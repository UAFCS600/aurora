#!/usr/bin/python

import base64
import BaseHTTPServer
import config_util
import datetime
import db_util
import json
import MySQLdb
import SimpleHTTPServer
import ssl
import validate

class aurora_handler(BaseHTTPServer.BaseHTTPRequestHandler):
	def do_POST(self):
		return_code=200

		try:
			self.log()
			data_size=int(self.headers.getheader("content-length",0))
			data=self.rfile.read(data_size)
			print("    Data:       "+data)

			json_obj=json.loads(data)
			if not json_obj.has_key("service"):
				raise Exception("JSON object does not contain the key \"service\".")
			if not json_obj.has_key("token"):
				raise Exception("JSON object does not contain the key \"token\".")
			if not json_obj.has_key("kpTrigger"):
				raise Exception("JSON object does not contain the key \"kpTrigger\".")

			service=validate.service(json_obj["service"])
			token=str(base64.b64encode(json_obj["token"]))
			kp_trigger=str(validate.kp(json_obj["kpTrigger"]))
			print("    service:    "+service)
			print("    token:      "+token)
			print("    kpTrigger:  "+kp_trigger)

			config=config_util.open("notification.cfg")
			db_util.insert_client(config,service,token,kp_trigger)

		except Exception as error:
			print("    Error:      "+str(error))
			return_code=400

		try:
			print("    Sending:    "+str(return_code))
			self.end_headers()
			self.send_response(return_code)

		except Exception as error:
			print("    Error:      "+str(error))

	def log_message(self,format,*args):
		return

	def log(self):
		if self.client_address[0]=="127.0.0.1" and self.headers.getheader("x-forwarded-for")!=None:
			address=self.headers.getheader("x-forwarded-for")+":"+str(self.client_address[1])
		else:
			address=self.client_address[0]+":"+str(self.client_address[1])

		method=self.command
		time=str(datetime.datetime.now())
		request=self.path
		print("%-6s  %-21s  %-26s  %s"%(method,address,time,request))


if __name__=="__main__":
	try:
		server=BaseHTTPServer.HTTPServer(('0.0.0.0',8081),aurora_handler)
		#server.socket=ssl.wrap_socket(server.socket,
		#	certfile='path/to/localhost.pem',server_side=True)

		try:
			server.serve_forever()
		except KeyboardInterrupt:
			pass

	except Exception as error:
		print("Error:  "+str(error))