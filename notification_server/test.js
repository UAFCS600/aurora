require('./db_util.js');

var success = function(tokens) {
	console.log('Success received tokens: ' + tokens);
};

var failure = function(err) {
	console.log('Failure received error: ' + err);
};

var db_util = new dbUtil();
db_util.getTokens(success, failure);