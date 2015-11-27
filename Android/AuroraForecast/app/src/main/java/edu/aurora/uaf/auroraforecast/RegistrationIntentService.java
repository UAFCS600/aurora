package edu.aurora.uaf.auroraforecast;

import android.app.IntentService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;

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
			String token=instanceID.getToken(getString(R.string.gcm_defaultSenderId),GoogleCloudMessaging.INSTANCE_ID_SCOPE, null);
			Log.d("RegistrationIntentServi","GCM Registration Token: "+token);
			sendRegistrationToServer(token);
			sharedPreferences.edit().putBoolean("sentTokenToServer",true).apply();
		}
		catch (Exception e)
		{
			Log.d("RegistrationIntentServi","Failed to complete token refresh"+e);
			sharedPreferences.edit().putBoolean("sentTokenToServer",false).apply();
		}
	}

	private void sendRegistrationToServer(String token)
	{
		//NEEDS IMPLEMENTING...
	}
}