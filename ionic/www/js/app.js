// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        //For some reason this block causes errors commented out for now -Dain
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
        navigator.splashscreen.hide();
    });
});

function postToPushServer(params, onSuccess, onFailure) {
    xhttp = new XMLHttpRequest();
    xhttp.withCredentials = false;

    xhttp.addEventListener("readystatechange", function() {
        console.log("State changed: " + xhttp.readyState + ' ' + "Status: " + xhttp.status);
        if (xhttp.readyState == 4 /*&& xhttp.status == 200*/ ) {
            onSuccess();
        }
    });

    xhttp.open("POST", "http://aurora.cs.uaf.edu/push_notification/");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(JSON.stringify(params));
}

function requestTestPushNotification() {
    postData = {
        "test_push":true,
        "kpTrigger":"",
        "service":"gcm",
        "method":"all",
        "token":""
    }

    postToPushServer(postData, function() {
        alert("You should receive a notification momentarily.");
    }, function() {
        alert("Request was denied.");
    });
}

function onDeviceReady() {
    showGeoLocationInfo();
    initPushNotifications();
}

function showGeoLocationInfo() {
    console.log("Initializing geolocation...");

    var options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000*60*5 //Five minutes
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

function initPushNotifications() {
    console.log("Initializing push notification service...");
    var gcmID = "209803454821" // this is static for GCM
    var apnsId = ""; //Apple iTunes App ID
        // need to figure out APNS...

    var push = PushNotification.init({
        "android": {
            "senderID": gcmID
        }
        //"ios": {"alert":"true", "badge":"true", "sound":"true"},
        //"windows": {}

    });

    if (push) {
        console.log("Push notification service successfully initialized.");
    }
    else {
        alert("It doesn't work!");
        console.log("Push notification service failure.");
    }

    push.on('registration', function(data) {
        console.log("Registration: " + JSON.stringify(data));

        postData = {
            "service": "gcm",
            "token": data.registrationId,
            "kpTrigger": 1
        }

        console.log(JSON.stringify(postData));

        postToPushServer(postData, function() {
            alert("Key has been added to push server!");
        }, function() {});
    });

    PushNotification.hasPermission(function(data) {
        if(data.isEnabled) {
          console.log("Push notifications enabled.");
        }
        else {
          console.log("Push notifications disabled.");
        }
    });

    push.on('notification', function(data) {
        alert("Notification: " + JSON.stringify(data["message"]));
    });
}
