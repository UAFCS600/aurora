#!/bin/bash
if [ $# -lt 1 ]
then
	echo "Usage: ./run.sh user_to_run_as"
	exit 1
fi

sudo -u "$1" python -u notify_server.py >> /var/log/notify_server
