package edu.aurora.uaf.auroraforecast;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import com.google.android.gms.gcm.GcmListenerService;

public class MyGcmListenerService extends GcmListenerService
{
	public void onMessageReceived(String from,Bundle data)
	{
		String message=data.getString("message");
		Log.d("", "From: "+from);
		Log.d("","Message: "+message);

		Intent intent=new Intent(this, MainActivity.class);
		intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		PendingIntent pendingIntent=PendingIntent.getActivity(this,0,intent,PendingIntent.FLAG_ONE_SHOT);
		Uri defaultSoundUri=RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
		NotificationCompat.Builder notificationBuilder=new NotificationCompat.Builder(this)
				.setSmallIcon(R.mipmap.ic_launcher)
				.setContentTitle("Aurora Forecast")
				.setContentText(message)
				.setAutoCancel(true)
				.setSound(defaultSoundUri)
				.setContentIntent(pendingIntent);

		NotificationManager notificationManager=(NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE);
		notificationManager.notify(0,notificationBuilder.build());
	}
}