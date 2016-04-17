angular.module('aurora.services', [])

//Local storage services
.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        get: function(key, defaultValue) {
            var temp = $window.localStorage[key];
            if(typeof temp != 'undefined')
                return JSON.parse(temp);
            else return defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        remove : function(key) {
            localStorage.removeItem(key);
        }
    };
}])

//Push notification services
.factory('$push', function($http, $location, $localstorage, $kpAPI) {
    var push      = false;
    var gcmID     = '209803454821'; // this is static for GCM
    var apnsId    = ''; //Apple iTunes App ID
    var windowsId = ''; //Windows Store ID

    var initData = {
        'android' : {
            'senderID' : gcmID
        },
        'ios' : {
            'senderID' : apnsId
        },
        'windows' : {
            'senderID' : windowsId
        }
    };

    postToPushServer = function(params, onSuccess, onFailure) {
        $http.post("http://aurora.cs.uaf.edu/push_notification/", params)
        .then(onSuccess, onFailure);
    };

    receivedNotification = function(data) {
        var message = JSON.parse(data.message);
        var kpTrigger = message.kpTrigger;
        $kpAPI.setNow(kpTrigger);

        console.log("AURORA: " + kpTrigger);
        console.log("AURORA: " + data.title);
        console.log("AURORA: " + data.count);
        console.log("AURORA: " + data.sound);
        console.log("AURORA: " + data.image);
        console.log("AURORA: " + data.additionalData);
    };

    receivedError = function(data) {
        console.log("AURORA: " + e.message);
    };

    notificationServiceRegistered = function(data) {
        if(ionic.Platform.isAndroid())
        {
            postData = {
                "service": "gcm",
                "token": data.registrationId,
                "kpTrigger": 6
            };
        }
        else if(ionic.Platform.isIOS())
        {
            postData = {
                "service": "apns",
                "token": data.registrationId,
                "kpTrigger": 6
            };
        }

        postToPushServer(postData, function(response) {
            if(response.status == 200) {
                console.log("AURORA: " + "Key has been added to push server!");
                $localstorage.set('pushToken', data.registrationId);
                alert(data.registrationId);
            }
        }, function(response) {
            console.log("AURORA: " + "Key has not been added to the push server!");
            console.log("AURORA: Failure status: " + response.status);
        });
    };

    return {
        requestTestPushNotification : function() {
            if(ionic.Platform.isAndroid())
            {
                postData = {
                    "test_push": true,
                    "kpTrigger": "",
                    "service": "gcm",
                    "method": "all",
                    "token": ""
                };
            }
            else if(ionic.Platform.isIOS())
            {
                postData = {
                    "test_push": true,
                    "kpTrigger": "",
                    "service": "apns",
                    "method": "all",
                    "token": ""
                };
            }

            postToPushServer(postData, function(response) {
                if(response.status == 200) {
                    console.log("AURORA: " + "You should receive a notification momentarily.");
                }
            }, function(response) {
                console.log("AURORA: " + "Request was denied.");
                console.log("AURORA: Failure status: " + response.status);
            });
        },
        initPushNotifications : function() {
            push = PushNotification.init(initData);

            if (push) {
                console.log("AURORA: " + "Push notification service successfully initialized.");
            }
            else {
                console.log("AURORA: " + "Push notification service NOT initialized.");
            }

            push.on('registration', notificationServiceRegistered);

            PushNotification.hasPermission(function(data) {
                if (data.isEnabled) {
                    console.log("AURORA: " + "Push notifications enabled.");
                }
                else {
                    console.log("AURORA: " + "Push notifications disabled.");
                }
            });

            push.on('notification', receivedNotification);

            push.on('error', receivedError);
        },
        unregister : function() {
            push.unregister(function() {
                console.log('AURORA: Push notifications unregistered.');
            }, function() {
                console.log('AURORA: Could not unregisted push notifications.');
            });
        },
        changeKpTrigger : function(kpTrigger) {
            var registrationId = $localstorage.get('pushToken');

            var postData = {
                'changeKpTrigger' : true,
                'token' : registrationId,
                'kpTrigger' : kpTrigger
            };

            postToPushServer(postData, function() {
                console.log("AURORA: kpTrigger changed!");
            }, function() {
                console.log("AURORA: Could not change kpTrigger.");
            });
        }
    };
})

//Geolocation services
.factory('$geolocation', function($localstorage) {
    return {
        showGeoLocationInfo : function() {
            var gps = $localstorage.get('gps', false);

            if(gps) {
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
        }
    };
})

//GI API service
.factory('$kpAPI', function($http, $localstorage) {
    var latestForecast;
    var apiURL = 'http://cs472.gi.alaska.edu/kp.php?';

    loadForecastFromStorage = function() {
        latestForecast = $localstorage.getObject('forecast');

        if(typeof latestForecast == 'undefined' || Object.keys(latestForecast).length === 0)
            updateForecast();
    };

    saveForecast = function(forecast) {
        $localstorage.remove('forecast');
        $localstorage.setObject('forecast', forecast);
    };

    formatTime = function(timeStr) {
        // source: http://stackoverflow.com/questions/14638018/current-time-formatting-with-javascript

        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // timeStr is in format:
        //      2016-04-17T21:01:00.0+00:00
        // which is UTC
        var apiDate = new Date(timeStr);
        var localDate = new Date();

        // getTimezoneOffset gives: UTC - timeobject
        // (480 minutes for Alaska, which is GMT-8)
        // so, adding 480 minutes to the Alaska time gives UTC
        var localOffset = localDate.getTimezoneOffset();

        // this fixes the Date constructor always using the local device offset
        // basically setting the apiDate to actual UTC
        apiDate.setMinutes(apiDate.getMinutes() + localOffset);

        var theDate = apiDate.getDate();
        var theMonth = months[apiDate.getMonth()];
        var theDay = days[apiDate.getDay()];
        var theHour = apiDate.getHours();

        var ampm = theHour < 12 ? "am" : "pm";
        if(theHour > 12) { theHour -= 12; }
        else if(theHour < 12) { theHour[0] = ""; }
        else if(theHour === 0) { theHour = 12; }

        var theMin = apiDate.getMinutes();
        if(theMin < 10) { theMin = "0" + theMin; }

        var time = theHour + ":" + theMin + ampm;
        var date = theDay + "," + theMonth + " " + theDate;

        return {'time':time, 'date':date};
    };

    updateForecast = function() {
        $http.get(apiURL + 'd=d&f=t').success(function(data) {
            if(data.data[0] != 'undefined') {
                var jsonData = {};

                for (var i = 0; i < data.data.length; i++) {
                    jsonData['kp' + i]      = {};
                    jsonData['kp' + i].kp   = data.data[i].kp;

                    var time = formatTime(data.data[i].predicted_time);

                    jsonData['kp' + i].time = time.time;
                    jsonData['kp' + i].date = time.date;
                }

                latestForecast = jsonData;
                console.log('Updated KP data.');
            }
        }).error(function(error) {
            //Finish writing
            console.log(error);
        });

        $http.get(apiURL + 'd=n&f=t').success(function(data) {
            if(data.data[0] != 'undefined') {
                latestForecast.now = Math.ceil(data.data[0].kp);
                saveForecast(latestForecast);
            }
        }).error(function(error) {
            //Finish writing
            console.log(error);
        });
    };

    return {
        getForecast : function() {
            updateForecast();
            if(typeof latestForecast == 'undefined')
                loadForecastFromStorage();

            return latestForecast;
        },
        setNow : function(kpNow) {
            if(typeof latestForecast == 'undefined')
                loadForecastFromStorage();

            latestForecast.now = kpNow;
            saveForecast(latestForecast);
        }
    };
})

.factory('$background', function($kpAPI) {
	backgroundlist = [
		{
			id: 1,
			url: "img/background-none.jpg"
		},
		{
			id: 2,
			url: "img/background-low.jpg"
		},
		{
			id: 3,
			url: "img/background-moderate.jpg"
		},
		{
			id: 4,
			url: "img/background-high.jpg"
		}
	];

	return {
		getBackground : function() {
			forecast = $kpAPI.getForecast();
			var url = null;

			switch(forecast.now)
			{
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
			return url;
		}
	};
});
