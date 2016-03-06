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
    //Initialize values
    $scope.settingblock = {
        locAlertOn: true,
        locKPAlert: 9,
        locDayNot: true,
        locWeatherNot: false,
        aSAlertOn: false,
        aSKPAlert: 7,
        aSDayNot: false,
        aSWeatherNot: false,
        gpsUse: true,
        locationZip: 99701
    };

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

    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true && JSON.stringify(obj) === JSON.stringify({});
    }

    //Load existing settings
    var test = $localstorage.getObject('settings');
    console.log("The empty value of test:" + isEmpty(test));
    if (!isEmpty(test))
        $scope.settingblock = $localstorage.getObject('settings');

    //Happens at program close. Goes elsewhere probably
    $scope.saveSettings = function() {
        $localstorage.setObject('settings', $scope.settingblock);
    }
})

.controller('AboutCtrl', function($scope) {})

.controller('AllskyCtrl', function($scope) {});