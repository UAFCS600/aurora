#!/usr/bin/python

import base64
import MySQLdb

def insert_client(config,service,token,kp_trigger):
	database=MySQLdb.connect(host=config["notify_host"],user=config["notify_user"],
		passwd=config["notify_password"],db=config["notify_database"])
	cursor=database.cursor()
	cursor.execute("delete from clients where token='"+str(token)+"';")
	cursor.execute("insert into clients (service,token,kpTrigger) values ('"+
		str(service)+"','"+str(token)+"','"+str(kp_trigger)+"');")
	database.commit()
	cursor.close()
	database.close()

def get_clients(config,kp):
	database=MySQLdb.connect(host=config["notify_host"],user=config["notify_user"],
		passwd=config["notify_password"],db=config["notify_database"])
	cursor=database.cursor()
	cursor.execute("select service,token from clients where kpTrigger<='"+str(kp)+"';")
	clients=cursor.fetchall()
	cursor.close()
	database.close()
	return clients

def remove_clients(config,bad_clients):
	if len(bad_clients)>0:
		database=MySQLdb.connect(host=config["notify_host"],user=config["notify_user"],
			passwd=config["notify_password"],db=config["notify_database"])
		cursor=database.cursor()

		query_string="delete from clients where token in (";
		for bad_client in bad_clients:
			query_string+="'"+str(base64.b64encode(bad_client))+"',"
		if query_string[-1]==',':
			query_string=query_string[:-1]
		query_string+=");"

		cursor.execute(query_string)

		database.commit()
		cursor.close()
		database.close()

def get_kps(config):
	database=MySQLdb.connect(host=config["forecast_host"],user=config["forecast_user"],
		passwd=config["forecast_password"],db=config["forecast_database"])
	cursor=database.cursor()
	cursor.execute("select * from now order by id desc limit 2;")
	kps=cursor.fetchall()
	cursor.close()
	database.close()
	return kps