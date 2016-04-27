require('./db_util.js');
require('./notification_sender.js');
var http       = require('http');
var dispatcher = require('httpdispatcher');
var PORT       = 80;
var db_util    = new dbUtil();
var notifier   = new Notifier();

var handleRegisterRequest = function(data, onSuccess, onFailure) {
    var clientInfo = {
        service:data.service,
        token:data.token,
        kpTrigger:data.kpTrigger,
        latitude:data.latitude,
        longitude:data.longitude,
        notify_start_time:data.notify_start_time,
        notify_stop_time:data.notify_stop_time
    };

    db_util.insertClient(clientInfo, onSuccess, onFailure);
};

var handleUpdateRequest = function(data, onSuccess, onFailure) {
    var clientInfo = {
        service:data.service,
        token:data.token,
        kpTrigger:data.kpTrigger,
        latitude:data.latitude,
        longitude:data.longitude,
        notify_start_time:data.notify_start_time,
        notify_stop_time:data.notify_stop_time
    };

    db_util.updateClient(clientInfo, onSuccess, onFailure);
};

var handleRemoveRequest = function(data, onSuccess, onFailure) {
    var clientInfo = {
        service:data.service,
        token:data.token,
        kpTrigger:data.kpTrigger,
        latitude:data.latitude,
        longitude:data.longitude,
        notify_start_time:data.notify_start_time,
        notify_stop_time:data.notify_stop_time
    };

    db_util.removeClient(clientInfo, onSuccess, onFailure);
};

var handlePostData = function(postData, onSuccess, onFailure) {
    var mode = postData.mode;
    console.log('Handling post with mode: ' + mode);

    switch(mode) {
        case 'register':
            handleRegisterRequest(postData, onSuccess, onFailure);
            break;
        case 'update':
            handleUpdateRequest(postData, onSuccess, onFailure);
            break;
        case 'remove':
            handleRemoveRequest(postData, onSuccess, onFailure);
            break;
        default:
            onFailure('No mode set.');
    }
};

dispatcher.onError(function(req, res) {
    console.log('Received request for nonexistent page.\nSending 404.');
    res.writeHead(404);
    res.end('404 - NOT FOUND');
});  

dispatcher.onPost('/notification_service', function(req, res) {
    var params;
    try{
        params = Object.keys(req.params)[0];
        params = params.replace(/[\\]+/g, '');
        params = JSON.parse(params);
    }
    catch(err) {
        params = req.params;
    }

    console.log('Received post: ' + JSON.stringify(params));
    var onSuccess = function(successMessage) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(JSON.stringify({message:successMessage}));
    };

    var onFailure = function(errorMessage) {
        res.writeHead(400, {'Content-Type': 'text/html'});
        res.end(JSON.stringify({err:errorMessage}));
    };

    handlePostData(params, onSuccess, onFailure);
});

var handleRequest = function(request, response){
    try {
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
};

var notificationInterval = setInterval(function() {
    notifier.notifyClients();
}, 1000*60*15);

notifier.notifyClients();

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log('Listening on: http://localhost:%s', PORT);
});