angular.module('aurora.controllers', [])

.controller('DashCtrl', function($scope, $kpAPI, $ionicPlatform, $background, $geolocation) {
    var updateLocation = function() {
        $scope.locationInfo = {};
        var locInfo = $scope.locationInfo;
        $geolocation.getInfo(locInfo, function(info) {
            $scope.locationInfo = info;

            if(info.city)
                $scope.title = info.city;

            if(info.state)
                $scope.title += ', ' + info.state;
        });
    };

    updateLocation();

    var updateForecast = function(latestForecast) {
        $scope.forecast = latestForecast;
    };

    $kpAPI.updateForecast(updateForecast);

    var checkKpNow = function() {
        if (!$scope.forecast.now)
            $scope.forecast.now = 1;
    };

    var viewportHeight = window.innerHeight;
    if (viewportHeight > 300) {
        var kpnow              = document.getElementById("kp-now");
        kpnow.style.height     = viewportHeight / 2 + "px";
        kpnow.style.lineHeight = viewportHeight / 2 + "px";
        kpnow.style.fontSize   = viewportHeight / 2 + "px";
    }


    window.onresize = function() {
        var viewportHeight = window.innerHeight;
        if (viewportHeight > 300) {
            var kpnow              = document.getElementById("kp-now");
            kpnow.style.height     = viewportHeight / 2 + "px";
            kpnow.style.lineHeight = viewportHeight / 2 + "px";
            kpnow.style.fontSize   = viewportHeight / 2 + "px";
        }
    };

    $background.getBackgroundUrl(function(url) {
        $scope.backgroundurl = url;
    });
	
	$background.getIntensityText(function(intensityText) { 
			$scope.intensityText = intensityText;
	});

    $ionicPlatform.on('resume', function() {
        $kpAPI.updateForecast(updateForecast);
		
		updateLocation();
		
        $background.getBackgroundUrl(function(url) {
            $scope.backgroundurl = url;
        });
		
		$background.getIntensityText(function(intensityText) { 
			$scope.intensityText = intensityText;
		});
    });
})

.controller('SettingsCtrl', function($scope, $localstorage, $ionicPopover, $push, $geolocation, $background, $ionicPlatform, ionicTimePicker) {
    $scope.loadDefaults = function() {
        $scope.alerts     = true;
        $scope.kpTrigger  = 1;
        $scope.daytime    = false;
        $scope.gps        = true;
        $scope.zip        = 90210;
        $scope.quietTime  = false;
        $scope.secondTime = false;
    };

    $scope.makeTimes = function() {
        $scope.notifyStartTime = {
            'hours'  : "08",
            'minutes': "00",
            'half'   : "AM",
            'epoch'  : 28800
        };
        $scope.notifyStopTime = {
            'hours'  : "08",
            'minutes': "00",
            'half'   : "PM",
            'epoch'  : 72000
        };
	};

	$scope.initTimes = function() {
		var t1 = document.getElementById("times_1");

		if ($scope.quietTime === false) {
			t1.style.display = 'none';
		} 
        else {	
            t1.style.display = 'block';
		}
	};

	$scope.loadTimes = function() {
        $scope.notifyStartTime = $localstorage.getObject('notifyStartTime');
        $scope.notifyStopTime  = $localstorage.getObject('notifyStopTime');
        
        if ($scope.notifyStartTime.hours === undefined) {
            $scope.makeTimes();
            $scope.saveTimes();
        }
    };

    $scope.formatTimeForPushServer = function(time) {
        var hours   = time.hours;
        var minutes = time.minutes;
        if(time.half == 'PM' && hours != 12) hours = parseInt(hours) + 12;
        if(time.half == 'AM' && hours == 12) hours = '00';

        return (hours + ':' + minutes + ':00');
    };
    
    $scope.saveTimes = function() {
        $localstorage.setObject('notifyStartTime', $scope.notifyStartTime);
        $localstorage.setObject('notifyStopTime', $scope.notifyStopTime);

        var notifyStartTime = $scope.formatTimeForPushServer($scope.notifyStartTime);
        var notifyStopTime  = $scope.formatTimeForPushServer($scope.notifyStopTime);

        $push.updateInfo({'notify_start_time':notifyStartTime, 'notify_stop_time':notifyStopTime});
    };

    $scope.loadSettings = function() {
        $scope.alerts     = $localstorage.get('alerts');
        $scope.kpTrigger  = $localstorage.get('kpTrigger');
        $scope.daytime    = $localstorage.get('daytime');
        $scope.gps        = $localstorage.get('gps');
        $scope.zip        = $localstorage.get('zip');
        $scope.quietTime  = $localstorage.get('quietTime');
        $scope.secondTime = $localstorage.get('secondTime');

        if (typeof $scope.alerts == 'undefined') {
            $scope.loadDefaults();
            $scope.saveAllSettings();
        }
    };

    $scope.saveAllSettings = function() {
        $localstorage.set('alerts', $scope.alerts);
        $localstorage.set('kpTrigger', $scope.kpTrigger);
        $localstorage.set('daytime', $scope.daytime);
        $localstorage.set('gps', $scope.gps);
        $localstorage.set('zip', $scope.zip);
        $localstorage.set('quietTime', $scope.quietTime);
        $localstorage.set('secondTime', $scope.secondTime);
    };

    $scope.outputSettings = function(asAlert) {
        data = {
            'alerts'   : $scope.alerts,
            'kpTrigger': $scope.kpTrigger,
            'daytime'  : $scope.daytime,
            'gps'      : $scope.gps,
            'zip'      : $scope.zip
            };

        if(asAlert)
            alert(data);
        else
            console.log(data);
    };

    $scope.requestPush         = function() {
        $push.requestTestPushNotification();
    };

    $scope.initPush            = function() {
        $push.initPushNotifications();
    };

    $scope.changeKpTrigger     = function(kpTrigger) {
        var info = {'kpTrigger':kpTrigger};

        $localstorage.set('kpTrigger', kpTrigger);
        $push.updateInfo(info);
    };

    $scope.showGeoLocationInfo = function() {
        $geolocation.showGeoLocationInfo();
    };

    $scope.geolocationToggled  = function() {
        $scope.gps = !$localstorage.get('gps');
        $localstorage.set('gps', $scope.gps);
        console.log('AURORA: GPS toggled!');
    };

    $scope.alertsToggled = function() {
        $scope.alerts = !$localstorage.get('alerts');
        $localstorage.set('alerts', $scope.alerts);
        console.log('AURORA: Alerts toggled!');

        if($scope.alerts) {
            $push.register();
        }
        else {
            $push.unregister();
        }
    };

    $scope.quietTimeToggled = function() {
        $scope.quietTime          = !$localstorage.get('quietTime');
        var notifyStartTime = $scope.formatTimeForPushServer($scope.notifyStartTime);
        var notifyStopTime  = $scope.formatTimeForPushServer($scope.notifyStopTime);
        $localstorage.set('quietTime', $scope.quietTime);
        $scope.initTimes();
        console.log('AURORA: Quiet Time toggled!');

        if(!$scope.quietTime)
            $push.updateInfo({'notify_start_time':'00:00:00','notify_stop_time':'23:59:59'});
        else
            $push.updateInfo({'notify_start_time':notifyStartTime, 'notify_stop_time':notifyStopTime});
    };

    //Literally a table index of geomagnetic coordinates
    var getIdealKP = function(gmagcoords) {
        var kp = {
            overhead : "N/A",
            horizon  : "N/A"
            };
        //using chart found here: https://www.spaceweatherlive.com/en/help/the-kp-index
        if (gmagcoords == 'undefined') {
            return kp;
        }
        else {
            if (gmagcoords.latitude == 'undefined')
            {
                return kp;
            }
            else {
                kp.horizon = '9';
                if (Math.abs(gmagcoords.latitude) > 46)
                {
                    kp.horizon = '8';
                }
                if (Math.abs(gmagcoords.latitude) > 48.1)
                {
                    kp.horizon = '7';
                    kp.overhead = '9';
                }
                if (Math.abs(gmagcoords.latitude) > 50.1)
                {
                    kp.horizon = '6';
                    kp.overhead = '8';
                }
                if (Math.abs(gmagcoords.latitude) > 52.2)
                {
                    kp.horizon = '5';
                    kp.overhead = '7';
                }
                if (Math.abs(gmagcoords.latitude) > 54.2)
                {
                    kp.horizon = '4';
                    kp.overhead = '6';
                }
                if (Math.abs(gmagcoords.latitude) > 56.3)
                {
                    kp.horizon = '3';
                    kp.overhead = '5';
                }
                if (Math.abs(gmagcoords.latitude) > 58.3)
                {
                    kp.horizon = '2';
                    kp.overhead = '4';
                }
                if (Math.abs(gmagcoords.latitude) > 60.4)
                {
                    kp.horizon = '1';
                    kp.overhead = '3';
                }
                if (Math.abs(gmagcoords.latitude) > 62.4)
                {
                    kp.horizon = '0';
                    kp.overhead = '2';
                }
                if (Math.abs(gmagcoords.latitude) > 64.5)
                {
                    kp.overhead = '1';
                }
                if (Math.abs(gmagcoords.latitude) > 66.5)
                {
                    kp.overhead = '0';
                }
                return kp;
            }
        }
    };

    //This could actually call some API in the future, or a call to this could be replaced with an API call
    var getMagneticPole = function() {
        //geographic location geomagnetic pole as of 2015 coords are east positive
        var pole = {
            latitude: 80.375 * Math.PI / 180,
            longitude: -72.625 * Math.PI / 180
        };
        return pole;
    };

    //Contemplated having the pole be passed into the function
    var convertGeographicToGeomagnetic = function(geographicCoord) {
        //Set the magnetic pole
        var pole   = getMagneticPole();
        var mslat  = pole.latitude;
        var mslong = pole.longitude;

        //geographic coordinates (To radians)
        var glat  = geographicCoord.latitude * Math.PI / 180;
        var glong = geographicCoord.longitude * Math.PI / 180;

        //rectangular coordinates
        var x = Math.cos(glat) * Math.cos(glong);
        var y = Math.cos(glat) * Math.sin(glong);
        var z = Math.sin(glat);

        var matrix;
        var rotation;
        rotation      = mslong;
        var rotation2 = Math.PI / 2 - mslat;
        matrix        = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        matrix[0 * 3 + 0] = Math.cos(rotation) * Math.cos(rotation2);
        matrix[1 * 3 + 0] = -1 * Math.sin(rotation);
        matrix[2 * 3 + 0] = Math.cos(rotation) * Math.sin(rotation2);

        matrix[0 * 3 + 1] = Math.sin(rotation) * Math.cos(rotation2);
        matrix[1 * 3 + 1] = Math.cos(rotation);
        matrix[2 * 3 + 1] = Math.sin(rotation) * Math.sin(rotation2);

        matrix[0 * 3 + 2] = -1 * Math.sin(rotation2);
        matrix[1 * 3 + 2] = 0;
        matrix[2 * 3 + 2] = Math.cos(rotation2);


        //apply matrix
        xt = x * matrix[0] + y * matrix[1] + z * matrix[2];
        yt = x * matrix[3] + y * matrix[4] + z * matrix[5];
        zt = x * matrix[6] + y * matrix[7] + z * matrix[8];
        x  = xt;
        y  = yt;
        z  = zt;

        //convert back
        var mlat  = Math.atan(z / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
        var mlong = Math.atan(y / x) * 180 / Math.PI;
        //Method is imperfect but close enough

        var magCoords = {
            latitude: mlat,
            longitude: mlong
        };

        return magCoords;
    };

    var getMagCoord = function(geoCoords) {
        var output = convertGeographicToGeomagnetic(geoCoords);
        return output;
    };

    var showIdealKP = function(magCoord) {
        var output = getIdealKP(magCoord);
        return output;
    };

    var getGeoMagLocation = function(callback) {
        $geolocation.getInfo({}, function(position) {
            var magCoords = convertGeographicToGeomagnetic({'latitude':position.latitude, 'longitude':position.longitude});
            if (callback) {
                callback(magCoords);
            }
        });
    };
	
	$scope.getLocalKP = function() {
		getGeoMagLocation(function(magCoords) {
            $scope.localKP = showIdealKP(magCoords);
        });	
	};
	
    $scope.loadSettings();
    $scope.loadTimes();
    $scope.initTimes();
	$scope.localKP = {
		overhead : "N/A",
		horizon  : "N/A"
	};
	$scope.magCoords = {
		latitude : 'undefined',
		longitude : 'undefined'
	};
	$scope.getLocalKP();
    $background.getBackgroundUrl(function(url) {
        $scope.backgroundurl = url;
    });
	

    $scope.timeWindow = function(timeObj) {
        var time = {
            callback: function (val, tObj, scope) {      //Mandatory
                if (!val) {
                    console.log('Time not selected');
                }
                else {
                    var selectedTime = new Date(val * 1000);
                    console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');

                    //Store value for loading window again
                    tObj.epoch = val;

                    //AM vs PM
                    if (selectedTime.getUTCHours() > 12)
                        tObj.half = "PM";
                    else
                        tObj.half = "AM";

                    //Hours
                    var hour = (selectedTime.getUTCHours() % 12);
                    if (selectedTime.getUTCHours() === 0) {
                        hour      = 12;
                        tObj.half = "PM";
                    }

                    if (selectedTime.getUTCHours() == 12) {
                        hour      = 12;
                        tObj.half = "AM";
                    }

                    tObj.hours = hour.toString();
                    if (tObj.hours.length < 2) {
                        var temp   = tObj.hours;
                        tObj.hours = "0" + temp;
                    }

                    //Minutes 
                    var min      = selectedTime.getUTCMinutes();
                    tObj.minutes = min.toString();
                    if (tObj.minutes.length < 2) {
                        var tempMin  = tObj.minutes;
                        tObj.minutes = "0" + tempMin;
                    }
                }
                $scope.saveTimes();
            },
            inputTime: timeObj.epoch
        };

        ionicTimePicker.openTimePicker(time, timeObj, $scope);
    };

    $ionicPlatform.on('resume', function() {
        $background.getBackgroundUrl(function(url) {
            $scope.backgroundurl = url;
        });
		$scope.getLocalKP();
    });
})

.controller('AboutCtrl', function($scope, $background, $ionicPlatform) {
    $background.getBackgroundUrl(function(url) {
        $scope.backgroundurl = url;
    });

    $ionicPlatform.on('resume', function() {
        $background.getBackgroundUrl(function(url) {
            $scope.backgroundurl = url;
        });
    });
})

.controller('FeedbackCtrl', function($scope, $background, $ionicPlatform) {
    $background.getBackgroundUrl(function(url) {
        $scope.backgroundurl = url;
    });

    $ionicPlatform.on('resume', function() {
        $background.getBackgroundUrl(function(url) {
            $scope.backgroundurl = url;
        });
    });
})

.controller('AllskyCtrl', function($scope, $background, $ionicPlatform) {
    $background.getBackgroundUrl(function(url) {
        $scope.backgroundurl = url;
    });

    $ionicPlatform.on('resume', function() {
        $background.getBackgroundUrl(function(url) {
            $scope.backgroundurl = url;
        });
    });
});