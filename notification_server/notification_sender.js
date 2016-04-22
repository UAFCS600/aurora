var http = require('http');

requestOptions = {
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

        console.log(body);
    });
};

http.get(requestOptions, receivedResponse);