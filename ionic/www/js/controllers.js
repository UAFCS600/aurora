angular.module('aurora.controllers', [])

.controller('DashCtrl', function($scope, $push, $geolocation) {
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
        $scope.gps         = false;
        $scope.zip         = 90210;
    }

    loadSettings = function() {
        $scope.alerts      = $localstorage.get('alerts');
        $scope.kpTrigger   = $localstorage.get('kpTrigger');
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
        $localstorage.set('gps', $scope.gps);
        $localstorage.set('zip', $scope.zip);
    }

    outputSettings = function(asAlert) {
        data = {'alerts' : $scope.alerts, 
                'kpTrigger' : $scope.kpTrigger, 
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