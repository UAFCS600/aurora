var http   = require('http');
var gcm    = require('node-gcm');
var config = require('./config.json');
require('./db_util.js');

var getClientTokens = function(kpTrigger, service, onSuccess, onFailure) {
    var db_util = new dbUtil();
    db_util.getTokens(kpTrigger, service, onSuccess, onFailure);
};

var removeBadClients = function(clients, onSuccess, onFailure) {
    var db_util = new dbUtil();
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
}

var getClientChunks = function(clientArr, chunkSize) {
    var retArr = [];

    var i, j, tempArray;

    for (i = 0,j = clientArr.length; i < j; i += chunkSize) {
        tempArray = clientArr.slice(i,i+chunkSize);
        retArr.push(tempArray);
    }
    
    return retArr;
};

var sendGCMMessages = function(kp, clients) {
    console.log('Sending message to GCM clients: ' + clients);

    var message = new gcm.Message();
     
    message.addData('message', JSON.stringify({kptrigger:kp}));
    
    console.log('Using GCM Sender ID: ' + config.gcmApiKey);
    var sender = new gcm.Sender(config.gcmApiKey);
     
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

            removeBadClients(badClients,
                             function() {console.log('Removed all bad clients');},
                             function() {console.log('Could not remove all bad clients');});
        }
    });
};

var sendAPNSMessages = function(kp, clients) {
    console.log('Sending message to APNS clients: ' + clients);
};

var sendKpToClients = function(kp) {
    //Send GCM messages
    getClientTokens(kp, 'gcm', function(tokens) {
        var clientChunks = getClientChunks(tokens, 1000);
        for(var i in clientChunks) sendGCMMessages(kp, clientChunks[i]);
    }, function(err) {
        console.log('Could not send GCM message: ' + err);
    });

    //Send APNS messages
    getClientTokens(kp, 'apns', function(tokens) {
        var clientChunks = getClientChunks(tokens, 1000);
        for(var i in clientChunks) sendAPNSMessages(kp, clientChunks[i]);
    }, function(err) {
        console.log('Could not send APNS message: ' + err);
    });
};

var requestOptions = {
	host: 'cs472.gi.alaska.edu',
    path: '/kp.php?d=d'
};

var receivedResponse = function(response) {
	// Continuously update stream with data
    var body = '';
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
        var data      = JSON.parse(body);
        var currentKp = Math.ceil(data.data[0].kp);
        
        sendKpToClients(currentKp);
    });
};

http.get(requestOptions, receivedResponse);