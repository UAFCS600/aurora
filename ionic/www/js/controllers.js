angular.module('aurora.controllers', [])

.controller('DashCtrl', function($scope, $kpAPI, $ionicPlatform, $background) {
    $scope.forecast = $kpAPI.getForecast();

    var checkKpNow = function() {
        if(!$scope.forecast.now)
            $scope.forecast.now = 0;
    };

    var viewportHeight = window.innerHeight;
    if(viewportHeight > 300)
    {
        var kpnow = document.getElementById("kp-now");
        kpnow.style.height = viewportHeight/2 + "px";
        kpnow.style.lineHeight = viewportHeight/2 + "px";
        kpnow.style.fontSize = viewportHeight/2 + "px";
    }


    window.onresize = function() {
        var viewportHeight = window.innerHeight;
        if(viewportHeight > 300)
        {
            var kpnow = document.getElementById("kp-now");
            kpnow.style.height = viewportHeight/2 + "px";
            kpnow.style.lineHeight = viewportHeight/2 + "px";
            kpnow.style.fontSize = viewportHeight/2 + "px";
        }
    };

    $scope.backgroundurl = $background.getBackground();

    $ionicPlatform.on('resume', function() {
        $scope.forecast = $kpAPI.getForecast();
        $scope.backgroundurl = $background.getBackground();
    });
})

.controller('SettingsCtrl', function($scope, $localstorage, $ionicPopover, $push, $geolocation, $background, $ionicPlatform, ionicTimePicker) {
    $scope.loadDefaults = function() {
        $scope.alerts    = true;
        $scope.kpTrigger = 1;
        $scope.daytime   = false;
        $scope.gps       = false;
        $scope.zip       = 90210;
    };
	
	$scope.makeTimes = function() {
		$scope.time1 =
		{
			'hours' : "08",
			'minutes' : "00",
			'half' : "AM",
			'epoch' : 28800
		}
		$scope.time2 =
		{
			'hours' : "08",
			'minutes' : "00",
			'half' : "PM",
			'epoch' : 72000
		}
		
		console.log("Value of time1: " + $scope.time1);
	}
	
	$scope.loadTimes = function() {
		//if($scope.timesactive)	?
		//if(numtimes>1)			?
		$scope.time1 	 = $localstorage.getObject('time1');
		$scope.time2 	 = $localstorage.getObject('time2');
		console.log("Value of time1: " + $scope.time1);
		if (typeof $scope.time1.hours == 'undefined')
		{
			$scope.makeTimes();
			$scope.saveTimes();
		}
	}
	
	$scope.saveTimes = function() { 
		$localstorage.setObject('time1', $scope.time1);
		$localstorage.setObject('time2', $scope.time2);
	}

    $scope.loadSettings = function() {
        $scope.alerts    = $localstorage.get('alerts');
        $scope.kpTrigger = $localstorage.get('kpTrigger');
        $scope.daytime   = $localstorage.get('daytime');
        $scope.gps       = $localstorage.get('gps');
        $scope.zip       = $localstorage.get('zip');

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
    };

    $scope.outputSettings = function(asAlert) {
        data = {'alerts' : $scope.alerts,
                'kpTrigger' : $scope.kpTrigger,
				'daytime' : $scope.daytime,
                'gps' : $scope.gps,
                'zip' : $scope.zip};

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

    $scope.unregisterPush      = function() {
        $push.unregister();
    };

    $scope.changeKpTrigger     = function(kpTrigger) {
        $localstorage.set('kpTrigger', kpTrigger);
        $push.changeKpTrigger(kpTrigger);
    };

    $scope.showGeoLocationInfo = function() {
        $geolocation.showGeoLocationInfo();
    };

    $scope.geolocationToggled = function() {
        $scope.gps = !$localstorage.get('gps');
        $localstorage.set('gps', $scope.gps);
        console.log('AURORA: GPS toggled!');
    };

    $scope.alertsToggled = function() {
        $scope.alerts = !$localstorage.get('alerts');
        $localstorage.set('alerts', $scope.alerts);
        console.log('AURORA: Alerts toggled!');

        if($scope.alerts) {
            $scope.initPush();
        }
        else {
            $scope.unregisterPush();
        }
    };

    $scope.loadSettings();
	$scope.loadTimes();
    $scope.outputSettings(false);
	$scope.backgroundurl = $background.getBackground();
	
	
	$scope.timeWindow = function(timeObj)
	{		
		var time = {
			callback: function (val, tObj) {      //Mandatory
				if (typeof (val) === 'undefined') {
					console.log('Time not selected');
				} else {
					var selectedTime = new Date(val * 1000);
					console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
					
					//Store value for loading window again
					tObj.epoch = val;
					
					//AM vs PM
					if(selectedTime.getUTCHours()>12)
						tObj.half = "PM";
					else
						tObj.half = "AM";
					
					//Hours
					var hour = (selectedTime.getUTCHours()%12);
					if (selectedTime.getUTCHours() == 0 )
					{
						hour = 12;
						tObj.half = "PM";
					}
					
					if (selectedTime.getUTCHours() == 12)
					{
						hour = 12;
						tObj.half = "AM";
					}
					
					tObj.hours = hour.toString();
					if(tObj.hours.length < 2)
					{
						var temp = tObj.hours;
						tObj.hours = "0" + temp;
					}
					
					//Minutes 
					var min = selectedTime.getUTCMinutes();
					tObj.minutes = min.toString();
					if(tObj.minutes.length < 2)
					{
						var temp = tObj.minutes;
						tObj.minutes = "0" + temp;
					}	
				}
			},
			inputTime: timeObj.epoch
		};
		ionicTimePicker.openTimePicker(time, timeObj);
	}

    $ionicPlatform.on('resume', function() {
        $scope.backgroundurl = $background.getBackground();
    });
})

.controller('AboutCtrl', function($scope, $background, $ionicPlatform) {
    $scope.backgroundurl = $background.getBackground();
    $ionicPlatform.on('resume', function() {
        $scope.backgroundurl = $background.getBackground();
    });
})

.controller('FeedbackCtrl', function($scope, $background, $ionicPlatform) {
    $scope.backgroundurl = $background.getBackground();
    $ionicPlatform.on('resume', function() {
        $scope.backgroundurl = $background.getBackground();
    });
})

.controller('AllskyCtrl', function($scope, $background, $ionicPlatform) {
	$scope.backgroundurl = $background.getBackground();
    $ionicPlatform.on('resume', function() {
        $scope.backgroundurl = $background.getBackground();
    });
});
