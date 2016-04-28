require('./db_util.js');
var http    = require('http');
var gcm     = require('node-gcm');
var apn     = require('apn');
var config  = require('./config.json');
var db_util = new dbUtil();

Notifier    = function() {};

Notifier.prototype.getClientTokens = function(kpTrigger, service, onSuccess, onFailure) {
    db_util.getTokens(kpTrigger, service, onSuccess, onFailure);
};

Notifier.prototype.removeBadClients = function(clients, onSuccess, onFailure) {
    var success = false;

    clients.forEach(function(client, index, array) {
        db_util.removeClient({token:client},
                             function(msg) {
                                console.log('Successfully removed ' + client);
                             },
                             function(err) {
                                console.log('Could not remove ' + client + ': ' + err);
                             });
    });
};

Notifier.prototype.getClientChunks = function(clientArr, chunkSize) {
    var retArr = [];

    var i, j, tempArray;

    for (i = 0,j = clientArr.length; i < j; i += chunkSize) {
        tempArray = clientArr.slice(i,i+chunkSize);
        retArr.push(tempArray);
    }

    return retArr;
};

Notifier.prototype.sendGCMMessages = function(self, kp, clients) {
    console.log('Sending message to GCM clients: ' + clients);

    var message = new gcm.Message();
    var sender  = new gcm.Sender(config.gcmApiKey);

    message.addData('message', JSON.stringify({kptrigger:kp}));

    console.log('Using GCM Sender ID: ' + config.gcmApiKey);

    sender.send(message, { registrationTokens: clients }, function (err, response) {
        if(err) console.log('Error: ' + err + '\nResponse: ' + response);
        else {
            var results    = response.results;
            var badClients = [];
            for(var i in results) {
                if(results[i].error) {
                    badClients.push(clients[i]);
                }
            }

            self.removeBadClients(badClients,
                             function() {console.log('Removed all bad clients');},
                             function() {console.log('Could not remove all bad clients');});
        }
    });
};

Notifier.prototype.sendAPNSMessages = function(self, kp, clients) {
    console.log('Sending message to APNS clients: ' + clients);

	var options = {
		"cert": config.apnsDevCertPath,
		"key": config.apnsDevKeyPath,
        "production": false,
        "batchFeedback": true
    };

	var badClients = [];
	var feedback = new apn.Feedback(options);
	feedback.on("feedback", function(devices) {
		devices.forEach(function(item) {
			console.log("BAD APNS: " + item.device);
			badClients.push(item.device);
		});
		self.removeBadClients(badClients,
						function() {console.log('Removed all bad clients');},
						function() {console.log('Could not remove all bad clients');});
	});

	var apnConnection = new apn.Connection(options);

	apnConnection.on("completed",         function()    { console.log("Completed!")});
	apnConnection.on("connected",         function()    { console.log("Connected"); });
	apnConnection.on('disconnected',      function()    { console.log("Disconnected", arguments); });
	apnConnection.on('error',             function(err) { console.log("Standard error", err); });
	apnConnection.on('socketError',       function(err) { console.log("Socket error", err.message); });
	apnConnection.on('timeout',           function()    { console.log("Timeout"); });
	apnConnection.on('transmissionError', function(err) { console.log("Transmission Error", err); });

	var message = new apn.Notification();
	message.badge = 3;
	message.alert = "Aurora activity detected!";
	message.payload = {kptrigger:kp};

	apnConnection.pushNotification(message, clients);
};

Notifier.prototype.sendKpToClients = function(self, kp) {
    //Send GCM messages
    this.getClientTokens(kp, 'gcm', function(tokens) {
        var clientChunks = self.getClientChunks(tokens, 1000);
        for(var i in clientChunks) self.sendGCMMessages(self, kp, clientChunks[i]);
    }, function(err) {
        console.log('Could not send GCM message: ' + err);
    });

    //Send APNS messages
    this.getClientTokens(kp, 'apns', function(tokens) {
        var clientChunks = self.getClientChunks(tokens, 1000);
        for(var i in clientChunks) self.sendAPNSMessages(self, kp, clientChunks[i]);
    }, function(err) {
        console.log('Could not send APNS message: ' + err);
    });
};

Notifier.prototype.receivedResponse = function(self, response) {
    var body = '';

    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
        var data      = JSON.parse(body);
        var currentKp = Math.ceil(data.data[0].kp);

        self.sendKpToClients(self, currentKp);
    });
};

Notifier.prototype.notifyClients = function() {
    var requestOptions = {
        host: 'cs472.gi.alaska.edu',
        path: '/kp.php?d=n'
    };

    var self = this;

    http.get(requestOptions, function(response) {
        self.receivedResponse(self, response);
    });
};

