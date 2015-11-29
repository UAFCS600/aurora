#!/usr/bin/python

import ConfigParser

def read_config(filename):
	config={"gcm_api_key":"","host":"localhost","database":"notification_db",
		"user":"notify_user","password":""}

	try:
		config_parser=ConfigParser.RawConfigParser()
		config_parser.read(filename)

		config["gcm_api_key"]=config_parser.get("GCM","api_key")

		config["host"]=config_parser.get("Database","host")
		config["database"]=config_parser.get("Database","name")
		config["user"]=config_parser.get("Database","user")
		config["password"]=config_parser.get("Database","password")

	except ConfigParser.NoOptionError as error:
		raise Exception("Invalid config file \""+str(filename)+"\" ("+str(error)+").")

	except:
		raise Exception("Error reading config file \""+str(filename)+"\".")

	return config
