#!/usr/bin/python

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