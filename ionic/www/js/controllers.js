angular.module('aurora.controllers', [])

.controller('DashCtrl', function($scope, $push, $geolocation, $http) {
    $scope.updateForecast = function() {
        $http.get('http://cs472.gi.alaska.edu/kp.php?d=h').success(function(data) {
            console.log(data);
            //Finish writing
        }).error(function(error) {
            //Finish writing
            console.log(error);
        });
    }

    $scope.loadForecastFromStorage = function() {
        $scope.forecast = $localstorage.getObject('forecast');

        if(object.keys($scope.forecast).length == 0)
            $scope.updateForecast();
    }

    console.log($scope.forecast);
    $scope.updateForecast();

    $scope.requestPush = function() {
        $push.requestTestPushNotification();
    }

    $scope.initPush = function() {
        $push.initPushNotifications();
    }

    $scope.showGeoLocationInfo = function() {
        $geolocation.showGeoLocationInfo();
    }
})

.controller('SettingsCtrl', function($scope, $localstorage, $ionicPopover) {
    loadDefaults = function() {
        $scope.alerts      = true;
        $scope.kpTrigger   = 1;
		$scope.daytime	   = false;
        $scope.gps         = false;
        $scope.zip         = 90210;
    }

    loadSettings = function() {
        $scope.alerts      = $localstorage.get('alerts');
        $scope.kpTrigger   = $localstorage.get('kpTrigger');
		$scope.daytime	   = $localstorage.get('daytime');
        $scope.gps         = $localstorage.get('gps');
        $scope.zip         = $localstorage.get('zip');

        if (typeof $scope.alerts == 'undefined') {
            loadDefaults();
            saveSettings();
        };
    }

    saveSettings = function() {
        $localstorage.set('alerts', $scope.alerts);
        $localstorage.set('kpTrigger', $scope.kpTrigger);
		$localstorage.set('daytime', $scope.daytime);
        $localstorage.set('gps', $scope.gps);
        $localstorage.set('zip', $scope.zip);
    }

    outputSettings = function(asAlert) {
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

    loadSettings();
    outputSettings(false);

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