angular.module('aurora.services', [])

//Local storage services
.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
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

    function postToPushServer(params, onSuccess, onFailure) {
        $http.post("http://aurora.cs.uaf.edu/push_notification/", params)
        .then(onSuccess, onFailure);
    }

    function requestTestPushNotification() {
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
    }

    function initPushNotifications() {
        var registered = $localstorage.get('pushRegistered');

        var gcmID = "209803454821"; // this is static for GCM
        var apnsId = ""; //Apple iTunes App ID
        // need to figure out APNS...

        var push = PushNotification.init({
            "android": {
                "senderID": gcmID
            }
            //"ios": {"console.log":"true", "badge":"true", "sound":"true"},
            //"windows": {}

        });

        if (push) {
            console.log("AURORA: " + "Push notification service successfully initialized.");
        }
        else {
            console.log("AURORA: " + "Push notification service NOT successfully initialized.");
        }

        push.on('registration', function(data) {
            postData = {
                "service": "gcm",
                "token": data.registrationId,
                "kpTrigger": 6
            }

            postToPushServer(postData, function(response) {
                if(response.status == 200) {
                    console.log("AURORA: " + "Key has been added to push server!");
                    $localstorage.set('pushRegistered', true);
                }
            }, function(response) {
                console.log("AURORA: " + "Key has not been added to the push server!");
                console.log("AURORA: Failure status: " + response.status);
            });
        });

        PushNotification.hasPermission(function(data) {
            if (data.isEnabled) {
                console.log("AURORA: " + "Push notifications enabled.");
            }
            else {
                console.log("AURORA: " + "Push notifications disabled.");
            }
        });

        //This function **SHOULD** get called when notification is received
        push.on('notification', function(data) {
            //Switch to notification view somehow
            alert("Notification: " + JSON.stringify(data["message"]));
            console.log("AURORA: " + data.message);
            console.log("AURORA: " + data.title);
            console.log("AURORA: " + data.count);
            console.log("AURORA: " + data.sound);
            console.log("AURORA: " + data.image);
            console.log("AURORA: " + data.additionalData);
        });

        push.on('error', function(data) {
            console.log("AURORA: " + e.message);
        });
    }

    return {postToPushServer, requestTestPushNotification, initPushNotifications};
})

//Geolocation services
.factory('$geolocation', function($localstorage) {
    var gps = true;

    function showGeoLocationInfo() {
        gps = $localstorage.get('gps');

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

    if(typeof gps != 'undefined' && gps)
        return {showGeoLocationInfo};
    else
        return {};
})

//GI API service
.factory('$kpAPI', function($http, $localstorage) {
    var latestForecast;
    var apiURL = 'http://cs472.gi.alaska.edu/kp.php?';

    saveForecast = function(forecast) {
        $localstorage.setObject('forecast', forecast);
    }

    updateForecast = function() {
        $http.get(apiURL + 'd=h').success(function(data) {
            var jsonData = {};
            //Convert array to JSON object
            for (var i = 0; i < data['data'].length - 1; i++) {
                jsonData['val' + i] = data['data'][i];
            };

            latestForecast = jsonData;
            saveForecast(latestForecast);
            //Finish writing
        }).error(function(error) {
            //Finish writing
            console.log(error);
        });
    }

    loadForecastFromStorage = function() {
        latestForecast = $localstorage.getObject('forecast');

        if(typeof latestForecast == 'undefined' || Object.keys(latestForecast).length == 0)
            updateForecast();
    }

    getForecast = function() {
        if(typeof latestForecast == 'undefined')
            loadForecastFromStorage();

        return latestForecast;
    }

    // window.setInterval(function() {updateForecast();}, 1000);

    return {saveForecast, updateForecast, loadForecastFromStorage, getForecast};
});