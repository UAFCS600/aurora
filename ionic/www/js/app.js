angular.module('aurora', ['ionic', 'ionic-timepicker', 'aurora.controllers', 'aurora.services'])

.run(function($ionicPlatform, $push, $geolocation) {
    $ionicPlatform.ready(function() {
        $push.initPushNotifications();

        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        document.addEventListener('resume', function() {
            console.log('AURORA: Awakened!');
            //Update forecast from API here
        }, false);
    });
})

.config(function($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
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
      inputTime  : 28800,
      format     : 12,
      step       : 15,
      setLabel   : 'Set',
      closeLabel : 'Close'
    };
    ionicTimePickerProvider.configTimePicker(timePickerObj);
});