#!/usr/bin/python

import base64
import MySQLdb

def db_insert_client(db_object,service,token,kp_trigger):
	database=MySQLdb.connect(host=db_object["host"],user=db_object["user"],
		passwd=db_object["password"],db=db_object["database"])
	cursor=database.cursor()
	cursor.execute("delete from clients where token='"+str(token)+"';")
	cursor.execute("insert into clients (service,token,kpTrigger) values ('"+
		str(service)+"','"+str(token)+"','"+str(kp_trigger)+"');")
	database.commit()
	cursor.close()
	database.close()

def db_remove_clients(db_object,bad_clients):
	if len(bad_clients)>0:
		database=MySQLdb.connect(host=db_object["host"],user=db_object["user"],
			passwd=db_object["password"],db=db_object["database"])
		cursor=database.cursor()
		for bad_client in bad_clients:
			bad_client=str(base64.b64encode(bad_client))
			cursor.execute("delete from clients where token='"+str(bad_client)+"';")
		database.commit()
		cursor.close()
		database.close()

def db_get_clients(db_object,kp):
	database=MySQLdb.connect(host=db_object["host"],user=db_object["user"],
		passwd=db_object["password"],db=db_object["database"])
	cursor=database.cursor()
	cursor.execute("select * from clients where kpTrigger<='"+str(kp)+"';")
	clients=cursor.fetchall()
	cursor.close()
	database.close()
	return clients
