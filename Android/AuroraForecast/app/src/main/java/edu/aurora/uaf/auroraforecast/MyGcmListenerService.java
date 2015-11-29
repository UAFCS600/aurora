package edu.aurora.uaf.auroraforecast;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import com.google.android.gms.gcm.GcmListenerService;

import org.json.JSONException;
import org.json.JSONObject;

public class MyGcmListenerService extends GcmListenerService
{
	public void onMessageReceived(String from,Bundle data)
	{
		String message=data.getString("message");
		Log.d("", "From: "+from);
		Log.d("","Message: "+message);

		try
		{
			JSONObject jsonObject=new JSONObject(message);
			int kpTrigger=jsonObject.getInt("kpTrigger");

			SharedPreferences sharedPreferences=PreferenceManager.getDefaultSharedPreferences(this);
			SettingsManager manager=new SettingsManager(sharedPreferences);
			int kpRetrieved=manager.getInt("kpTrigger",7);

			if(kpTrigger>=kpRetrieved)
			{
				String notification_message="The forecasted Kp is "+kpRetrieved+"!";
				Intent intent=new Intent(this, MainActivity.class);
				intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
				PendingIntent pendingIntent=PendingIntent.getActivity(this,0,intent,PendingIntent.FLAG_ONE_SHOT);
				Uri defaultSoundUri=RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
				NotificationCompat.Builder notificationBuilder=new NotificationCompat.Builder(this)
						.setSmallIcon(R.mipmap.ic_launcher)
						.setContentTitle("Aurora Forecast")
						.setContentText(notification_message)
						.setAutoCancel(true)
						.setSound(defaultSoundUri)
						.setContentIntent(pendingIntent);
				NotificationManager notificationManager=(NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE);
				notificationManager.notify(0,notificationBuilder.build());
			}
		}
		catch(JSONException error)
		{
			Log.d("Receive Error:  ",error.toString());
		}
	}
}