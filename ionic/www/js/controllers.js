angular.module('aurora.controllers', [])

.controller('DashCtrl', function($scope, $kpAPI, $ionicPlatform, $background) {
    $scope.forecast = $kpAPI.getForecast();
    console.log($kpAPI.getForecast());

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

.controller('SettingsCtrl', function($scope, $localstorage, $ionicPopover, $push, $geolocation, $background, ionicTimePicker) {
    $scope.loadDefaults = function() {
        $scope.alerts    = true;
        $scope.kpTrigger = 1;
        $scope.daytime   = false;
        $scope.gps       = false;
        $scope.zip       = 90210;
    };

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
    $scope.outputSettings(false);
	$scope.backgroundurl = $background.getBackground();
	
	$scope.timeWindow = function()
	{		
		var time1 = {
			callback: function (val) {      //Mandatory
				if (typeof (val) === 'undefined') {
					console.log('Time not selected');
				} else {
					var selectedTime = new Date(val * 1000);
					console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
				}
			}
		};
		ionicTimePicker.openTimePicker(time1);
	}
})

.controller('AboutCtrl', function($scope, $background) {
    $scope.backgroundurl = $background.getBackground();
})

.controller('FeedbackCtrl', function($scope, $background) {
    $scope.backgroundurl = $background.getBackground();
})

.controller('AllskyCtrl', function($scope, $background) {
	$scope.backgroundurl = $background.getBackground();
})

.controller('NotificationCtrl', function($scope, $push) {});
