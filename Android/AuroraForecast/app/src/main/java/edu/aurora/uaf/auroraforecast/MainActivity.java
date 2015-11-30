package edu.aurora.uaf.auroraforecast;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

public class MainActivity extends AppCompatActivity
{
	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		SharedPreferences sharedPreferences=PreferenceManager.getDefaultSharedPreferences(this);
		SettingsManager manager=new SettingsManager(sharedPreferences);
		manager.setInt("kpMin",5);
		manager.setInt("kpMax",9);
		manager.sync();

		if (checkPlayServices())
		{
			Intent intent=new Intent(this,RegistrationIntentService.class);
			startService(intent);
		}

		Button settings_button=(Button)findViewById(R.id.apply_button);
		settings_button.setOnClickListener(new View.OnClickListener()
		{
			@Override
			public void onClick(View view)
			{
				Intent intent=new Intent(getApplicationContext(),SettingsActivity.class);
				startActivity(intent);
			}
		});

		Button about_button=(Button)findViewById(R.id.about_button);
		about_button.setOnClickListener(new View.OnClickListener()
		{
			@Override
			public void onClick(View view)
			{
				Intent intent=new Intent(getApplicationContext(),AboutActivity.class);
				startActivity(intent);
			}
		});

		Button website_button=(Button)findViewById(R.id.website_button);
		website_button.setOnClickListener(new View.OnClickListener()
		{
			@Override
			public void onClick(View view)
			{
				Uri uri=Uri.parse("http://www.gi.alaska.edu/AuroraForecast");
				Intent intent=new Intent(Intent.ACTION_VIEW,uri);
				startActivity(intent);
			}
		});
	}

	private boolean checkPlayServices()
	{
		final int PLAY_SERVICES_RESOLUTION_REQUEST=9000;
		GoogleApiAvailability apiAvailability=GoogleApiAvailability.getInstance();
		int resultCode=apiAvailability.isGooglePlayServicesAvailable(this);

		if(resultCode!=ConnectionResult.SUCCESS)
		{
			if(apiAvailability.isUserResolvableError(resultCode))
			{
				apiAvailability.getErrorDialog(this,resultCode,PLAY_SERVICES_RESOLUTION_REQUEST).show();
			}
			else
			{
				Log.d("MainActivity","This device is not supported.");
				finish();
			}

			return false;
		}

		return true;
	}
}
