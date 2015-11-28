package edu.aurora.uaf.auroraforecast;

import android.app.IntentService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

public class RegistrationIntentService extends IntentService
{
	public RegistrationIntentService()
	{
		super("RegistrationIntentService");
	}

	@Override
	protected void onHandleIntent(Intent intent)
	{
		SharedPreferences sharedPreferences=PreferenceManager.getDefaultSharedPreferences(this);

		try
		{
			InstanceID instanceID=InstanceID.getInstance(this);
			String token=instanceID.getToken(getString(R.string.gcm_defaultSenderId),GoogleCloudMessaging.INSTANCE_ID_SCOPE,null);
			Log.d("RegistrationIntentServi","GCM Registration Token: "+token);

			int kp=sharedPreferences.getInt("kp_trigger",7);
			sendRegistrationToServer(token,kp);
			sharedPreferences.edit().putBoolean("sentTokenToServer",true).apply();
		}
		catch (Exception e)
		{
			Log.d("RegistrationIntentServi","Failed to complete token refresh: "+e);
			sharedPreferences.edit().putBoolean("sentTokenToServer",false).apply();
		}
	}

	private void sendRegistrationToServer(String token,int kp)
	{
		SharedPreferences sharedPreferences=PreferenceManager.getDefaultSharedPreferences(this);
		sharedPreferences.edit().putString("token",token).apply();

		NetworkDispatcher dispatcher=new NetworkDispatcher();
		String[] params=new String[2];
		params[0]="http://137.229.25.180/?push_notification";
		params[1]="{\"token\":\""+token+"\",\"kp\":\""+kp+"\"}";
		dispatcher.execute(params);
	}
}