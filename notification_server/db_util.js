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

dbUtil.prototype.getQueryInfoFromClientInfo = function(clientInfo) {
	query  = '';
	params = [];

	if(clientInfo.kpTrigger) {
		if(query.length > 0) query += ', ';
		query += 'kpTrigger = ?';
		params.push(clientInfo.kpTrigger);
	}

	if(clientInfo.notify_start_time) {
		if(query.length > 0) query += ', ';
		query += 'notify_start_time = ?';
		params.push(clientInfo.notify_start_time);
	}

	if(clientInfo.notify_stop_time) {
		if(query.length > 0) query += ', ';
		query += 'notify_stop_time = ?';
		params.push(clientInfo.notify_stop_time);
	}

	if(clientInfo.latitude) {
		if(query.length > 0) query += ', ';
		query += 'latitude = ?';
		params.push(clientInfo.latitude);
	}

	if(clientInfo.longitude) {
		if(query.length > 0) query += ', ';
		query += 'longitude = ?';
		params.push(clientInfo.longitude);
	}

	if(clientInfo.token)
		params.push(clientInfo.token);

	return [query, params];
};

dbUtil.prototype.updateClient = function(clientInfo, onSuccess, onFailure) {
	success = this.success;
	var getUpdateQueryInfo = this.getQueryInfoFromClientInfo;

	this.pool.getConnection(function(err, connection) {
		if(err) {
			console.log('Could not get connection to database: ' + err);
			success = false;
			onFailure(err);
		}
		else {
			var queryInfo = getUpdateQueryInfo(clientInfo);
			var query = 'UPDATE clients SET ' + queryInfo[0] + ' where token = ?';
			connection.query(query,
			queryInfo[1],
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

		if(hours < 10)   hours   = '0' + hours;
		if(minutes < 10) minutes = '0' + minutes;
		if(seconds < 10) seconds = '0' + seconds;

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
			            "' AND notify_stop_time > '" + timeRightNow + "' AND kpTrigger >= '" + 
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