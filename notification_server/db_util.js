var mysql = require('mysql');

dbUtil = function() {};

dbUtil.prototype.success = false;
dbUtil.prototype.pool = mysql.createPool({
											host               : "localhost",
											user               : "push",
											password           : "pushpass",
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

	// console.log('Waiting for database transaction to complete.');
	// while(true);

	// return success;
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
					success = true;
					onSuccess('Updated registration.');
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
			connection.query('DELETE FROM clients Where token = ?',
			[clientInfo.token],
			function (err, result) {
				if (err) {
					console.log('Could not execute query: ' + err);
					success = false;
					onFailure(err);
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

dbUtil.prototype.getTokens = function(onSuccess, onFailure) {
	success = this.success;

	this.pool.getConnection(function(err, connection) {
		if(err) {
			console.log('Could not get connection to database: ' + err);
			success = false;
			onFailure(err);
		}
		else {
			connection.query('SELECT token from clients', function(err, rows, fields) {
				if (err) {
					console.log('Could not get tokens: ' + err);
					onFailure(err);
				}
				else {
					var retArr = [];
					for(var row in rows) {
						retArr.push(rows[row].token);
					}
					console.log('Received tokens: ' + retArr);
					onSuccess(retArr);
				}
			});

			connection.release();
		}
	});
}

dbUtil.prototype.close = function() {
	this.pool.end(function (err) {
	  // all connections in the pool have ended
	  if(err) console.log('Could not close database connection: ' + err);
	  else console.log('Database closed.');
	});
};