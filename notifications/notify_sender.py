#!/usr/bin/python

import base64
import config_util
import db_util
from gcm import GCM
import math
import time

def get_time_ms():
	return int(round(time.time()*1000))

def big_list_to_chunks(big_list,chunk_size):
	return [big_list[ii:ii+chunk_size] for ii in xrange(0,len(big_list),chunk_size)]

#max size of clients is 1000...gcm limitation...
def process_clients(kp_trigger,clients):
	gcm_message="{\"kpTrigger\":\""+str(kp_trigger)+"\"}"
	gcm_data={'message':gcm_message}

	gcm=GCM(config["gcm_api_key"])
	response=gcm.json_request(registration_ids=clients,data=gcm_data)

	if response.has_key("errors"):
		return response["errors"]["InvalidRegistration"]

	return []


if __name__=="__main__":
	try:
		config=config_util.open("notification.cfg")

		kps=db_util.get_kps(config)

		kp_new=int(math.ceil(kps[0][3]))
		kp_old=int(math.ceil(kps[1][3]))

		if kp_new!=kp_old:
			kp_trigger=kp_new

			clients=db_util.get_clients(config,kp_trigger)
			gcm_clients=[]

			for client in clients:
				try:
					service=str(client[1])
					token=str(base64.b64decode(client[2]))
					if service=="gcm":
						gcm_clients.append(token)
				except:
					#add a log!!!
					pass

			if len(gcm_clients)>0:
				client_chunks=big_list_to_chunks(gcm_clients,1000)
				bad_clients=[]

				print("Starting")
				start_time=get_time_ms()

				for chunk in client_chunks:
					print("Processing Chunk ("+str(get_time_ms()-start_time)+"ms)")
					bad_clients+=process_clients(kp_trigger,chunk)

				bad_client_chunks=big_list_to_chunks(bad_clients,20)
				for chunk in bad_client_chunks:
					print("Processing Bad Client List ("+str(get_time_ms()-start_time)+"ms)")
					db_util.remove_clients(config,chunk)

				end_time=get_time_ms()
				print("Total Process Time:  "+str(end_time-start_time)+"ms")

	except Exception as error:
		print("Error:  "+str(error))