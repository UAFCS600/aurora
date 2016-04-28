angular.module('aurora.services', [])

//Local storage services
.factory('$localstorage', ['$window', function($window) {
	return {
		set: function(key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},
		get: function(key, defaultValue) {
			var temp = $window.localStorage[key];
			if (typeof temp != 'undefined')
				return JSON.parse(temp);
			else return defaultValue;
		},
		setObject: function(key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},
		getObject: function(key) {
			return JSON.parse($window.localStorage[key] || '{}');
		},
		remove: function(key) {
			localStorage.removeItem(key);
		}
	};
}])

//Push notification services
.factory('$push', function($http, $location, $localstorage, $kpAPI, $geolocation) {
	var push     = false;
	var gcmID    = '638344930515';
	
	var initData = {
		'android': {
			'senderID': gcmID
		},
		'ios': {
			'alert': true,
			'badge': true,
			'sound': true,
			'clearBage': true
		},
		'windows': {

		}
	};

	var postToPushServer = function(params, onSuccess, onFailure) {
		$http.post("http://aurora.cs.uaf.edu/notification_service", params)
			.then(onSuccess, onFailure);
	};

	var update = function(info) {
        info.token = $localstorage.get('pushToken');
        info.mode  = 'update';

		postToPushServer(info, function() {
			console.log("AURORA: Info changed.");
		}, function() {
			console.log("AURORA: Could not change info.");
		});
	};

	var receivedNotification = function(data) {
		var message   = JSON.parse(data.message);
		var kpTrigger = message.kpTrigger;
		$kpAPI.setNow(kpTrigger);

		console.log("AURORA: " + kpTrigger);
		console.log("AURORA: " + data.title);
		console.log("AURORA: " + data.count);
		console.log("AURORA: " + data.sound);
		console.log("AURORA: " + data.image);
		console.log("AURORA: " + data.additionalData);
	};

	var receivedError = function(data) {
		console.log("AURORA: " + e.message);
	};

	var notificationServiceRegistered = function(data) {
        var postData  = {};
        var kpTrigger = $localstorage.get('kpTrigger', 6);
        var info      = {};

		var getGeolocation = function() {
			$geolocation.getInfo(info, function(lat, lon) {
				console.log('AURORA: Setting geolocation information.');
				update(info);
			});
		};

		if (ionic.Platform.isAndroid()) {
            postData.mode      = "register";
            postData.service   = "gcm";
            postData.token     = data.registrationId;
            postData.kpTrigger = kpTrigger;
		}
		else if (ionic.Platform.isIOS()) {
            postData.mode      = "register";
            postData.service   = "apns";
            postData.token     = data.registrationId;
            postData.kpTrigger = kpTrigger;
		}

		console.log('AURORA: ' + postData);
		console.log('AURORA: ' + JSON.stringify(postData));

		postToPushServer(postData, function(response) {
			if (response.status == 200) {
				console.log("AURORA: " + "Key has been added to push server!");
				$localstorage.set('pushToken', data.registrationId);
				console.log("AURORA: Your token: " + data.registrationId);
				getGeolocation();
			}
		}, function(response) {
			console.log("AURORA: " + "Key has not been added to the push server!");
			console.log("AURORA: Failure status: " + response.status);
		});
	};

	return {
		requestTestPushNotification: function() {
			if (ionic.Platform.isAndroid()) {
				postData = {
                    "test_push" : true,
                    "kpTrigger" : "",
                    "service"   : "gcm",
                    "method"    : "all",
                    "token"     : ""
				};
			} else if (ionic.Platform.isIOS()) {
				postData = {
                    "test_push" : true,
                    "kpTrigger" : "",
                    "service"   : "apns",
                    "method"    : "all",
                    "token"     : ""
				};
			}

			postToPushServer(postData, function(response) {
				if (response.status == 200) {
					console.log("AURORA: " + "You should receive a notification momentarily.");
				}
			}, function(response) {
				console.log("AURORA: " + "Request was denied.");
				console.log("AURORA: Failure status: " + response.status);
			});
		},
		initPushNotifications: function(callback) {
			push = PushNotification.init(initData);

			if (push) {
				console.log("AURORA: " + "Push notification service successfully initialized.");
			} else {
				console.log("AURORA: " + "Push notification service NOT initialized.");
			}

			push.on('registration', notificationServiceRegistered);

			PushNotification.hasPermission(function(data) {
				if (data.isEnabled) {
					console.log("AURORA: " + "Push notifications enabled.");
				} else {
					console.log("AURORA: " + "Push notifications disabled.");
				}
			});

			push.on('notification', receivedNotification);

			push.on('error', receivedError);

			if (callback)
				callback();
		},
		register: function() {
			var token           = $localstorage.get('pushToken');
			var notifyStartTime = $localstorage.get('quietHoursStartTime_1');
			var notifyStopTime  = $localstorage.get('quietHoursStopTime_1');
			
			notificationServiceRegistered({
				registrationId      : token,
				'notify_start_time' : notifyStartTime,
				'notify_stop_time'  : notifyStopTime
			});
		},
		unregister: function() {
			var info   = {};
			info.token = $localstorage.get('pushToken');
			info.mode  = 'remove';

			postToPushServer(info, function() {
				console.log("AURORA: Push notifications disabled.");
			}, function() {
				console.log("AURORA: Could not disable push notifications.");
			});
		},
		updateInfo: update
	};
})

//Geolocation services
.factory('$geolocation', function($localstorage, $http) {
	var getInfoFromCoordinates = function(info, callback) {
		var apiURL = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=';
		apiURL += info.latitude + ',' + info.longitude + '&sensor=false';

		console.log('AURORA: Getting country from: ' + apiURL);

		$http.get(apiURL + info.latitude + ',' + info.longitude + '&sensor=false')
		.success(function(data) {
			info.city    = data.results[0].address_components[2].short_name;
			info.state   = data.results[0].address_components[4].short_name;
			info.country = data.results[0].address_components[5].short_name;

			$localstorage.set('geoInfo', JSON.stringify(info));

			if(callback)
				callback(info);
		}).error(function(error) {
			//Finish writing
			console.log('AURORA: Error: ' + error);
		});
	};

	return {
		showGeoLocationInfo: function() {
			var gps = $localstorage.get('gps', false);
			if (gps) {
				var options = {
					enableHighAccuracy: true,
					timeout: 15000,
					maximumAge: 1000 * 60 * 5 //Five minutes
				};

				navigator.geolocation.getCurrentPosition(function(position) {
					alert('Latitude: ' + position.coords.latitude + '\n' +
						'Longitude: ' + position.coords.longitude + '\n' +
						'Altitude: ' + position.coords.altitude + '\n' +
						'Accuracy: ' + position.coords.accuracy + '\n' +
						'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
						'Heading: ' + position.coords.heading + '\n' +
						'Speed: ' + position.coords.speed + '\n' +
						'Timestamp: ' + position.timestamp + '\n');

				}, function(error) {
					alert('Code: ' + error.code + '\n' +
						'Message: ' + error.message + '\n');
				}, options);
			}
		},
		getInfo: function(params, callback) {
			var gps = $localstorage.get('gps', false);

			if (gps) {
				var options = {
					enableHighAccuracy: true,
					timeout: 15000,
					maximumAge: 1000 * 60 * 5 //Five minutes
				};

				navigator.geolocation.getCurrentPosition(function(position) {
                    params.latitude  = position.coords.latitude;
                    params.longitude = position.coords.longitude;

					console.log('AURORA: Set lat and long.');

					getInfoFromCoordinates(params, callback);
				});
			}
		}
	};
})

//GI API service
.factory('$kpAPI', function($http, $localstorage) {
	var latestForecast = {};
	var apiURL         = 'http://cs472.gi.alaska.edu/kp.php?';

	var loadForecastFromStorage = function() {
		latestForecast = $localstorage.getObject('forecast');

		if (typeof latestForecast == 'undefined' || Object.keys(latestForecast).length === 0)
			updateForecast();
	};

	var saveForecast = function(forecast) {
		$localstorage.remove('forecast');
		$localstorage.setObject('forecast', forecast);
	};

	var formatTime = function(timeStr) {
		// source: http://stackoverflow.com/questions/14638018/current-time-formatting-with-javascript

        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var days   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		// timeStr is in format:
		//      2016-04-17T21:01:00.0+00:00
		// which is UTC
		var apiDate  = new Date(timeStr);
		
		var theDate  = apiDate.getDate();
		var theMonth = months[apiDate.getMonth()];
		var theDay   = days[apiDate.getDay()];
		var theHour  = apiDate.getHours();

		var ampm = theHour < 12 ? "am" : "pm";
		if (theHour > 12) {
			theHour -= 12;
		} else if (theHour < 12) {
			theHour[0] = "";
		}

		if (theHour == '0') {
			theHour = "12";
		}

		var theMin = apiDate.getMinutes();
		if (theMin < 10) {
			theMin = "00";
		}

		var time = theHour + ":" + theMin + ampm;
		var date = theDay + "," + theMonth + " " + theDate;

		return {
			'time': time,
			'date': date
		};
	};

	var getForecastData = function(callback) {
		$http.get(apiURL + 'd=d&f=t').success(function(data) {
			if (data.data[0] != 'undefined') {
				var jsonData = {};

				for (var i = 0; i < data.data.length; i++) {
					jsonData['kp' + i]    = {};
					jsonData['kp' + i].kp = data.data[i].kp;

					var time = formatTime(data.data[i].predicted_time);

					jsonData['kp' + i].time = time.time;
					jsonData['kp' + i].date = time.date;
				}

				latestForecast = jsonData;

				saveForecast(latestForecast);

				if(callback)
					callback();
			}
		}).error(function(error) {
			console.log('AURORA: Error: ' + error);
		});
	};

	var getNowData = function(callback) {
		$http.get(apiURL + 'd=n&f=t').success(function(data) {
			if (data.data[0] != 'undefined') {
				latestForecast.now = Math.ceil(data.data[0].kp);
				saveForecast(latestForecast);

				if(callback) {
					callback();
				}
			}
		}).error(function(error) {
			console.log('AURORA: Error: ' + error);
		});
	};

	return {
		updateForecast : function(callback) {
			getForecastData(function() {
				getNowData(function() {
					callback(latestForecast);
				});
			});
		},
		setNow: function(kpNow) {
			if (typeof latestForecast == 'undefined')
				loadForecastFromStorage();

			latestForecast.now = kpNow;
			saveForecast(latestForecast);
		}
	};
})

.factory('$background', function($kpAPI) {
	var backgroundlist = [{
		id: 1,
		url: "img/background-none.jpg"
	}, {
		id: 2,
		url: "img/background-low.jpg"
	}, {
		id: 3,
		url: "img/background-moderate.jpg"
	}, {
		id: 4,
		url: "img/background-high.jpg"
	}];

	return {
		getBackgroundUrl: function(callback) {
	    	$kpAPI.updateForecast(function(forecast) {
	    		var url  = null;
				switch (forecast.now) {
					case 1:
					case 2:
					case 3:
						url = backgroundlist[0].url;
						break;
					case 4:
					case 5:
						url = backgroundlist[1].url;
						break;
					case 6:
					case 7:
						url = backgroundlist[2].url;
						break;
					case 8:
					case 9:
						url = backgroundlist[3].url;
						break;
					default:
						url = backgroundlist[0].url;
						break;
				}

				callback(url);
	    	});
		}
	};
});
