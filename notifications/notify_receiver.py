#!/usr/bin/python

#test with below
#	curl --data "{\"token\":\"dGij2usJjHQ:APA91bEqhaCfQukPF0GvawfQ-ze8EIu9tHGzA0kYZMDnUhfYzJVBJkAbHbpUYQubfMRtlkcjXFT43vy8DLO4jWdIvuLEkHdoYQCUMfvQAJDqIeJW-5CucKBrtJppacOcHHxsN1k7VCfF\",\"kpTrigger\":3}" http://aurora.cs.uaf.edu/push_notification

import base64
import BaseHTTPServer
import datetime
import json
import MySQLdb
import SimpleHTTPServer
import ssl

def db_insert_client(service,token,kp_trigger):
	database=MySQLdb.connect(host="localhost",
		user="notify_user",  #change this to your real user
		passwd="letmein",    #change this to your real password
		db="notification_db")#change this to your real database

	cursor=database.cursor()
	cursor.execute("delete from clients where token='"+str(token)+"';")
	cursor.execute("insert into clients (service,token,kpTrigger) values ('"+
		str(service)+"','"+str(token)+"','"+str(kp_trigger)+"');")

	database.commit()
	cursor.close()
	database.close()

def validate_service(service):
	if service=="gcm" or service=="apns":
		return service
	else:
		raise Exception("Invalid service\""+service+"\".")

def validate_kp(kp):
	error=False
	kp_int=-1

	try:
		kp_int=int(kp)
	except:
		error=True

	if not error and (kp_int<0 or kp_int>9):
		error=True

	if error:
		raise Exception("Invalid KP value \""+str(kp)+"\".")

	return kp_int

class aurora_handler(BaseHTTPServer.BaseHTTPRequestHandler):
	def do_POST(self):
		return_code=200

		try:
			self.log()
			data_size=int(self.headers.getheader("content-length",0))
			data=self.rfile.read(data_size)
			print("    Data:       "+data)
			json_obj=json.loads(data)
			service=validate_service(json_obj["service"])
			token=str(base64.b64encode(json_obj["token"]))
			kp_trigger=str(validate_kp(json_obj["kpTrigger"]))
			print("    service:    "+service)
			print("    token:      "+token)
			print("    kpTrigger:  "+kp_trigger)
			db_insert_client(service,token,kp_trigger)
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
	server=BaseHTTPServer.HTTPServer(('localhost',8081),aurora_handler)
	#server.socket=ssl.wrap_socket(server.socket,
	#	certfile='path/to/localhost.pem',server_side=True)
	try:
		server.serve_forever()
	except KeyboardInterrupt:
		pass
