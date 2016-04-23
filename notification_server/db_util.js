var mysql  = require('mysql');
var config = require('./config.json');

dbUtil     = function() {};

dbUtil.prototype.success = false;
dbUtil.prototype.pool = mysql.createPool({
											host               : "localhost",
											user               : config.dbUser,
											password           : config.dbPass,
											database           : "push_notifications",
											connectionLimit    : 30,
											waitForConnections : true
										});

dbUtil.prototype.insertClient = function(clientInfo, onSuccess, onFailure) {
	var success = this.success;

	console.log('Attemping to insert client into database: ' + JSON.stringify(clientInfo));

	this.pool.getConnection(function(err, connection) {
		if(err) {
			console.log('Could not get connection to database: ' + err);
			success = false;
			onFailure(err);
		}
		else {
			connection.query('INSERT INTO clients SET ?', clientInfo, function(err, res) {
				if(err) {
					console.log('Could not insert into database: ' + err);
					success = false;
					onFailure(err);
				}
				else {
					console.log('Last inserted ID: ' + res.insertId);
					success = true;
					onSuccess('Registration successful.');
				}

				connection.release();
			});
		}
	});
};

dbUtil.prototype.updateClient = function(clientInfo, onSuccess, onFailure) {
	success = this.success;

	this.pool.getConnection(function(err, connection) {
		if(err) {
			console.log('Could not get connection to database: ' + err);
			success = false;
			onFailure(err);
		}
		else {
			connection.query('UPDATE clients SET kpTrigger = ?, notify_start_time = ?, notify_stop_time = ? where token = ?',
			[clientInfo.kpTrigger, clientInfo.notify_start_time, clientInfo.notify_stop_time, clientInfo.token],
			function (err, result) {
				if (err) {
					console.log('Could not execute query: ' + err);
					success = false;
					onFailure(err);
				}
				else {
					console.log('Changed ' + result.changedRows + ' rows');
					if(result.changedRows > 0) {
						success = true;
						onSuccess('Updated registration.');
					}
					else onFailure('No matching token.');
				}

				connection.release();
			});
		}
	});
};

dbUtil.prototype.removeClient = function(clientInfo, onSuccess, onFailure) {
	success = this.success;

	this.pool.getConnection(function(err, connection) {
		if(err) {
			console.log('Could not get connection to database: ' + err);
			success = false;
			onFailure(err);
		}
		else {
			connection.query('DELETE FROM clients WHERE token = ?',
			[clientInfo.token],
			function (err, result) {
				console.log(result);
				if (err || result.affectedRows < 1) {
					success = false;
					onFailure((err ? err:'token does not exist.'));
				}
				else {
					success = true;
					onSuccess('Removed from registry.');
				}

				connection.release();
			});
		}
	});
};

dbUtil.prototype.getTokens = function(kpTrigger, service, onSuccess, onFailure) {
	success = this.success;
	console.log('Trigger: ' + kpTrigger);

	var getTimeNow  = function() {
		var today   = new Date();
		var hours   = today.getHours();
		var minutes = today.getMinutes();
		var seconds = today.getSeconds();

		if(hours.length < 2)   hours   = '0' + hours;
		if(minutes.length < 2) minutes = '0' + minutes;
		if(seconds.length < 2) seconds = '0' + seconds;

		var time = hours + ':' +
				   minutes + ':' +
				   seconds;

		return time;
	};

	this.pool.getConnection(function(err, connection) {
		if(err) {
			console.log('Could not get connection to database: ' + err);
			success = false;
			onFailure(err);
		}
		else {
			var timeRightNow = getTimeNow();
			var query = "SELECT token FROM clients WHERE notify_start_time < '" + timeRightNow +
			            "' AND notify_stop_time > '" + timeRightNow + "' AND kpTrigger <= '" + 
			            kpTrigger + "' AND service = '" + service + "'";
		    console.log('Query: ' + query);

			connection.query(query,
				function(err, rows, fields) {
				if (err) {
					console.log('Could not get tokens: ' + err);
					onFailure(err);
				}
				else {
					var retArr = [];
					for(var row in rows) {
						retArr.push(rows[row].token);
					}
					onSuccess(retArr);
				}
			});

			connection.release();
		}
	});
};

dbUtil.prototype.close = function() {
	this.pool.end(function (err) {
	  // all connections in the pool have ended
	  if(err) console.log('Could not close database connection: ' + err);
	  else console.log('Database closed.');
	});
};