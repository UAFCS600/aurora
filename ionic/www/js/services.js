angular.module('aurora.services', [])

//Push notification services
.factory('$push', function() {
  return {
    postToPushServer : function(params, onSuccess, onFailure) {
      alert("The post begins!");
      try {
        $http.post("http://aurora.cs.uaf.edu/push_notification/,",params)
        .then(onSuccess,onFailure);
      }
      catch (error)
      {
        alert(error.message +"The error that happened");
      }
      alert("The post ends!");
    },

    requestTestPushNotification : function() {
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
    },

    initPushNotifications : function() {
      alert("Initializing push notification service...");
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
        alert("Push notification service successfully initialized.");
      }
      else {
        alert("It doesn't work!");
        console.log("Push notification service failure.");
      }

      push.on('registration', function(data) {
        alert("Registration: " + JSON.stringify(data));

        postData = {
          "service": "gcm",
          "token": data.registrationId,
          "kpTrigger": 1
        }

        alert(JSON.stringify(postData));

        postToPushServer(postData, function() {
          alert("Key has been added to push server!");
        }, function() {
          alert("Key has not been added to the push server!");
        });
      });

      PushNotification.hasPermission(function(data) {
        if(data.isEnabled) {
          alert("Push notifications enabled.");
        }
        else {
          alert("Push notifications disabled.");
        }
      });

      push.on('notification', function(data) {
        alert("Notification: " + JSON.stringify(data["message"]));
      });
    }
  }
})

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
  }
}]);
