#!/usr/bin/python

import base64
from gcm import GCM
import MySQLdb

def db_get_clients(kp):
	database=MySQLdb.connect(host="localhost",
		user="notify_user",  #change this to your real user
		passwd="letmein",    #change this to your real password
		db="notification_db")#change this to your real database

	cursor=database.cursor()
	cursor.execute("select * from clients where kpTrigger<='"+str(kp)+"';")
	clients=cursor.fetchall()

	cursor.close()
	database.close()

	return clients

if __name__=="__main__":
	kp_trigger=6
	clients=db_get_clients(kp_trigger)
	gcm_clients=[]

	for client in clients:
		service=str(client[1])
		token=str(base64.b64decode(client[2]))
		if service=="gcm":
			gcm_clients.append(token)

	if len(gcm_clients)>0:
		gcm_message="{\"kpTrigger\":\""+str(kp_trigger)+"\"}"
		gcm_data={'message':gcm_message}

		API_KEY="YOUR API_KEY"
		gcm=GCM(API_KEY)
		response=gcm.json_request(registration_ids=gcm_clients,data=gcm_data)
		print(response)