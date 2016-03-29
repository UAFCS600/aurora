angular.module('aurora.controllers', [])

.controller('DashCtrl', function($scope, $push, $geolocation, $kpAPI) {
    console.log($kpAPI.getForecast());
})

.controller('SettingsCtrl', function($scope, $localstorage, $ionicPopover, $push, $geolocation) {
    $scope.loadDefaults = function() {
        $scope.alerts      = true;
        $scope.kpTrigger   = 1;
		$scope.daytime	   = false;
        $scope.gps         = false;
        $scope.zip         = 90210;
    }

    $scope.loadSettings = function() {
        $scope.alerts      = $localstorage.get('alerts');
        $scope.kpTrigger   = $localstorage.get('kpTrigger');
		$scope.daytime	   = $localstorage.get('daytime');
        $scope.gps         = $localstorage.get('gps');
        $scope.zip         = $localstorage.get('zip');

        if (typeof $scope.alerts == 'undefined') {
            $scope.loadDefaults();
            $scope.saveAllSettings();
        };
    }

    $scope.saveAllSettings = function() {
        $localstorage.set('alerts', $scope.alerts);
        $localstorage.set('kpTrigger', $scope.kpTrigger);
		$localstorage.set('daytime', $scope.daytime);
        $localstorage.set('gps', $scope.gps);
        $localstorage.set('zip', $scope.zip);
    }

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
    }

    $scope.requestPush         = function() {
    $push.requestTestPushNotification();
    }
    
    $scope.initPush            = function() {
    $push.initPushNotifications();
    }
    
    $scope.showGeoLocationInfo = function() {
        $geolocation.showGeoLocationInfo();
    }

    $scope.geolocationToggled = function() {
        $localstorage.set('gps', !$scope.gps);
        console.log('AURORA: GPS toggled!');
    }

    $scope.loadSettings();
    $scope.outputSettings(false);

    $ionicPopover.fromTemplateUrl('popover-lkpa.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.poplkpa = popover;
    });

    $ionicPopover.fromTemplateUrl('popover-lDay.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.poplDay = popover;
    });

    $ionicPopover.fromTemplateUrl('popover-lAlert.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.poplAlert = popover;
    });
})

.controller('AboutCtrl', function($scope) {})

.controller('AllskyCtrl', function($scope) {})

.controller('NotificationCtrl', function($scope, $push) {
    
});