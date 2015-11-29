#!/usr/bin/python

import ConfigParser

def open(filename):
	config={"gcm_api_key":"",
		"notify_host":"localhost","notify_database":"notification_db",
		"notify_user":"notify_user","notify_password":"notify_password",
		"forecast_host":"localhost","forecast_database":"notification_db",
		"forecast_user":"forecast_user","forecast_password":"forecast_password"}

	try:
		config_parser=ConfigParser.RawConfigParser()
		config_parser.read(filename)

		config["gcm_api_key"]=config_parser.get("GCM","api_key")

		config["notify_host"]=config_parser.get("Notification Database","host")
		config["notify_database"]=config_parser.get("Notification Database","name")
		config["notify_user"]=config_parser.get("Notification Database","user")
		config["notify_password"]=config_parser.get("Notification Database","password")

		config["forecast_host"]=config_parser.get("Forecast Database","host")
		config["forecast_database"]=config_parser.get("Forecast Database","name")
		config["forecast_user"]=config_parser.get("Forecast Database","user")
		config["forecast_password"]=config_parser.get("Forecast Database","password")

	except ConfigParser.NoOptionError as error:
		raise Exception("Invalid config file \""+str(filename)+"\" ("+str(error)+").")

	except:
		raise Exception("Error reading config file \""+str(filename)+"\".")

	return config
