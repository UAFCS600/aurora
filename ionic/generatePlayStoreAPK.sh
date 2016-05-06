#!/bin/bash

# source: http://ionicframework.com/docs/guide/publishing.html
# make sure you've run:
# keytool -genkey -v -keystore aurora.keystore -alias aurora -keyalg RSA -keysize 2048 -validity 10000

if [[ "$#" -lt 2 ]]; then
    echo "Usage: $0 <path/to/apk> <path/to/keystore>"
else
    if [ -z ${ANDROID_HOME+x} ]; 
	then ANDROID_HOME=`/usr/libexec/java_home`
	
	if [ -z ${ANDROID_HOME+x} ];
    		then echo "ANDROID_HOME is unset. Please enter the path to your Android SDK:";
    		read ANDROID_HOME;
	fi
    fi

    if [ -z ${JAVA_HOME+x} ]; 
    	then echo "JAVA_HOME is unset.  Please enter the path to your JDK:";
    	read JAVA_HOME;
    fi

    $JAVA_HOME/bin/jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $2 $1 aurora
    $ANDROID_HOME/build-tools/23.0.2/zipalign -v 4 $1 aurora.apk
fi
