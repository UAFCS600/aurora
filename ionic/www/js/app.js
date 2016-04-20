// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('aurora', ['ionic', 'ionic-timepicker', 'aurora.controllers', 'aurora.services'])

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

        $push.initPushNotifications();

        document.addEventListener('resume', function() {
            console.log('AURORA: Awakened!');
            //Update forecast from API here
        }, false);
    });
})

/*.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow connections to/from push notification server.
        //Notice the difference between * and **.
        // 'http://srv*.assets.example.com/**'
        'http://aurora.cs.uaf.edu/**'
    ]);

    // The blacklist overrides the whitelist so the open redirect here is blocked.
    $sceDelegateProvider.resourceUrlBlacklist([
        
    ]);
})*/

.config(function($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html'
    })

    // Each tab has its own nav history stack:
    .state('app.dash', {
        url: '/dash',
        views: {
            'menuContent': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })

    .state('app.feedback', {
        url: '/feedback',
        views: {
            'menuContent': {
                templateUrl: 'templates/tab-feedback.html',
                controller: 'FeedbackCtrl'
            }
        }
    })

    .state('app.about', {
        url: '/about',
        views: {
            'menuContent': {
                templateUrl: 'templates/tab-about.html',
                controller: 'AboutCtrl'
            }
        }
    })

    .state('app.allsky', {
        url: '/allsky',
        views: {
            'menuContent': {
                templateUrl: 'templates/tab-allsky.html',
                controller: 'AllskyCtrl'
            }
        }
    })
	
    .state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/tab-settings.html',
                controller: 'SettingsCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/dash');
})

.config(function (ionicTimePickerProvider) {
    var timePickerObj = {
      inputTime: 64800,
      format: 12,
      step: 15,
      setLabel: 'Set',
      closeLabel: 'Close'
    };
    ionicTimePickerProvider.configTimePicker(timePickerObj);
});