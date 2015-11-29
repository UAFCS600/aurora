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
		SettingsManager manager=new SettingsManager(sharedPreferences);

		try
		{
			InstanceID instanceID=InstanceID.getInstance(this);
			String token=instanceID.getToken(getString(R.string.gcm_defaultSenderId),GoogleCloudMessaging.INSTANCE_ID_SCOPE,null);

			Log.d("RegistrationIntentServi","GCM Registration Token: "+token);
			manager.setString("token",token);
			manager.setBool("sentTokenToServer",true);
		}
		catch (Exception e)
		{
			Log.d("RegistrationIntentServi","Failed to complete token refresh: "+e);
			manager.setBool("sentTokenToServer",false);
		}
	}
}