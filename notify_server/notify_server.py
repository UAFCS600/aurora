#!/usr/bin/python

#test with below
#	curl --data "{\"token\":\"dGij2usJjHQ:APA91bEqhaCfQukPF0GvawfQ-ze8EIu9tHGzA0kYZMDnUhfYzJVBJkAbHbpUYQubfMRtlkcjXFT43vy8DLO4jWdIvuLEkHdoYQCUMfvQAJDqIeJW-5CucKBrtJppacOcHHxsN1k7VCfF\",\"kpTrigger\":3}" http://127.0.0.1:4443/?pushNotification

import base64
import BaseHTTPServer
import datetime
import json
import SimpleHTTPServer
import ssl

def validate_kp(kp):
	try:
		kp=int(kp)
	except:
		raise Exception("Not an integer.")
	if kp<0 or kp>9:
		raise Exception("Invalid KP value.")
	return int(kp)

class aurora_handler(BaseHTTPServer.BaseHTTPRequestHandler):
	def do_POST(self):
		return_code=200
		try:
			self.log()
			data_size=int(self.headers.getheader("content-length",0))
			data=self.rfile.read(data_size)
			print("    Data:       "+data)
			json_obj=json.loads(data)
			token=base64.b64encode(json_obj["token"])
			kp_trigger=validate_kp(json_obj["kpTrigger"])
			salt=base64.b64encode(self.headers.getheader("user-agent"))
			print("    token:      "+token)
			print("    kpTrigger:  "+str(kp_trigger))
			print("    salt:       "+salt)
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
	server=BaseHTTPServer.HTTPServer(('localhost',4443),aurora_handler)
	#server.socket=ssl.wrap_socket(server.socket,
	#	certfile='path/to/localhost.pem',server_side=True)
	try:
		server.serve_forever()
	except KeyboardInterrupt:
		pass
