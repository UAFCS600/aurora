#!/usr/bin/python

import base64
import config_util
import db_util
from gcm import GCM
import math

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
				gcm_message="{\"kpTrigger\":\""+str(kp_trigger)+"\"}"
				gcm_data={'message':gcm_message}

				gcm=GCM(config["gcm_api_key"])
				response=gcm.json_request(registration_ids=gcm_clients,data=gcm_data)

				if response.has_key("errors"):
					db_util.remove_clients(config,response["errors"]["InvalidRegistration"])

	except Exception as error:
		print("Error:  "+str(error))
