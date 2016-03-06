// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('aurora', ['ionic', 'aurora.controllers', 'aurora.services'])

.run(function($ionicPlatform, $push) {
    $ionicPlatform.ready(function() {
        //Keyboard code is dated and causes errors do not restore -Dain Harmon
        /*if (window.cordova && window.cordova.plugins.Keyboard) {
        	// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        	// for form inputs)
        	cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        	// Don't remove this line unless you know what you are doing. It stops the viewport
        	// from snapping when text inputs are focused. Ionic handles this internally for
        	// a much nicer keyboard experience.
        	cordova.plugins.Keyboard.disableScroll(true);
        }*/
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        document.addEventListener("deviceready", onDeviceReady, false);
        // navigator.splashscreen.hide();
        /*
        document.body.classList.remove('platform-ios');
        document.body.classList.remove('platform-android');
        document.body.classList.add('platform-ios');
        */

        $push.initPushNotifications();
    });
})

.config(function($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
        .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:
    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })

    .state('tab.settings', {
        url: '/settings',
        views: {
            'tab-settings': {
                templateUrl: 'templates/tab-settings.html',
                controller: 'SettingsCtrl'
            }
        }
    })

    .state('tab.location', {
        url: '/location',
        views: {
            'tab-settings': {
                templateUrl: 'templates/setting-location.html',
            }
        }
    })

    .state('tab.kpAlert', {
        url: '/kpAlert',
        views: {
            'tab-settings': {
                templateUrl: 'templates/setting-kpa.html',
                controller: 'SettingsCtrl',
            }
        }
    })

    .state('tab.allskyAlert', {
        url: '/allskyAlert',
        views: {
            'tab-settings': {
                templateUrl: 'templates/setting-allsky.html',
            }
        }
    })

    .state('tab.about', {
        url: '/about',
        views: {
            'tab-about': {
                templateUrl: 'templates/tab-about.html',
                controller: 'AboutCtrl'
            }
        }
    })

    .state('tab.allsky', {
        url: '/allsky',
        views: {
            'tab-allsky': {
                templateUrl: 'templates/tab-allsky.html',
                controller: 'AllskyCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');
});

function onDeviceReady() {
    //showGeoLocationInfo();
    //initPushNotifications();
}

function showGeoLocationInfo() {
    console.log("Initializing geolocation...");

    var options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000 * 60 * 5 //Five minutes
    }

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
