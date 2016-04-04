angular.module('aurora.services', [])

//Local storage services
.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        get: function(key, defaultValue) {
            var temp = $window.localStorage[key];
            if(typeof temp != 'undefined')
                return JSON.parse(temp);
            else return defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    };
}])

//Push notification services
.factory('$push', function($http, $location, $localstorage) {
    var push      = false;
    var gcmID     = '209803454821'; // this is static for GCM
    var apnsId    = ''; //Apple iTunes App ID
    var windowsId = ''; //Windows Store ID

    var initData = {
        'android' : {
            'senderID' : gcmID
        },
        'ios' : {
            'senderID' : apnsId
        },
        'windows' : {
            'senderID' : windowsId
        }
    };

    postToPushServer = function(params, onSuccess, onFailure) {
        $http.post("http://aurora.cs.uaf.edu/push_notification/", params)
        .then(onSuccess, onFailure);
    };

    receivedNotification = function(data) {
        //Switch to notification view somehow
        alert("Notification: " + JSON.stringify(data.message));
        console.log("AURORA: " + data.message);
        console.log("AURORA: " + data.title);
        console.log("AURORA: " + data.count);
        console.log("AURORA: " + data.sound);
        console.log("AURORA: " + data.image);
        console.log("AURORA: " + data.additionalData);
    };

    receivedError = function(data) {
        console.log("AURORA: " + e.message);
    };

    notificationServiceRegistered = function(data) {
        postData = {
            "service": "gcm",
            "token": data.registrationId,
            "kpTrigger": 6
        };

        postToPushServer(postData, function(response) {
            if(response.status == 200) {
                console.log("AURORA: " + "Key has been added to push server!");
            }
        }, function(response) {
            console.log("AURORA: " + "Key has not been added to the push server!");
            console.log("AURORA: Failure status: " + response.status);
        });
    };

    return {
        requestTestPushNotification : function() {
            postData = {
                "test_push": true,
                "kpTrigger": "",
                "service": "gcm",
                "method": "all",
                "token": ""
            };

            postToPushServer(postData, function(response) {
                if(response.status == 200) {
                    console.log("AURORA: " + "You should receive a notification momentarily.");
                }
            }, function(response) {
                console.log("AURORA: " + "Request was denied.");
                console.log("AURORA: Failure status: " + response.status);
            });
        },
        initPushNotifications : function() {
            push = PushNotification.init(initData);

            if (push) {
                console.log("AURORA: " + "Push notification service successfully initialized.");
            }
            else {
                console.log("AURORA: " + "Push notification service NOT initialized.");
            }

            push.on('registration', notificationServiceRegistered);

            PushNotification.hasPermission(function(data) {
                if (data.isEnabled) {
                    console.log("AURORA: " + "Push notifications enabled.");
                }
                else {
                    console.log("AURORA: " + "Push notifications disabled.");
                }
            });

            push.on('notification', receivedNotification);

            push.on('error', receivedError);
        },
        unregister : function() {
            push.unregister(function() {
                console.log('AURORA: Push notifications unregistered.');
            }, function() {
                console.log('AURORA: Could not unregisted push notifications.');
            });
        }
    };
})

//Geolocation services
.factory('$geolocation', function($localstorage) {
    return {
        showGeoLocationInfo : function() {
            var gps = $localstorage.get('gps', false);

            if(gps) {
                var options = {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 1000 * 60 * 5 //Five minutes
                };

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
        }
    };
})

//GI API service
.factory('$kpAPI', function($http, $localstorage) {
    var latestForecast;
    var apiURL = 'http://cs472.gi.alaska.edu/kp.php?';

    loadForecastFromStorage = function() {
        latestForecast = $localstorage.getObject('forecast');

        if(typeof latestForecast == 'undefined' || Object.keys(latestForecast).length === 0)
            updateForecast();
    };

    saveForecast = function(forecast) {
        $localstorage.setObject('forecast', forecast);
    };

    updateForecast = function() {
        $http.get(apiURL + 'd=h').success(function(data) {
            var jsonData = {};
            //Convert array to JSON object
            for (var i = 0; i < data.data.length - 1; i++) {
                jsonData['val' + i] = data.data[i];
            }

            latestForecast = jsonData;
            saveForecast(latestForecast);
            //Finish writing
        }).error(function(error) {
            //Finish writing
            console.log(error);
        });
    };

    return {
        getForecast : function() {
            if(typeof latestForecast == 'undefined')
                loadForecastFromStorage();

            return latestForecast;
        }
    };
});