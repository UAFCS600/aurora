package edu.aurora.uaf.auroraforecast;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.Button;
import android.widget.SeekBar;
import android.widget.TextView;

public class SettingsActivity extends AppCompatActivity
{
	public SharedPreferences sharedPreferences;

	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		sharedPreferences=PreferenceManager.getDefaultSharedPreferences(this);

		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_settings);
		Toolbar toolbar=(Toolbar)findViewById(R.id.toolbar);
		setSupportActionBar(toolbar);
		getSupportActionBar().setDisplayHomeAsUpEnabled(true);
		getSupportActionBar().setDisplayShowHomeEnabled(true);

		Button apply_button=(Button)findViewById(R.id.apply_button);
		apply_button.setOnClickListener(new View.OnClickListener()
		{
			@Override
			public void onClick(View view)
			{
				String token=sharedPreferences.getString("token","INVALID");
				SeekBar kp_bar=(SeekBar)findViewById(R.id.settings_kp_seek);
				int kp=kp_bar.getProgress();
				sharedPreferences.edit().putInt("kp_trigger",kp).apply();

				NetworkDispatcher dispatcher=new NetworkDispatcher();
				String[] params=new String[2];
				params[0]="http://137.229.25.180/?push_notification";
				params[1]="{\"token\":\""+token+"\",\"kp\":\""+kp+"\"}";
				dispatcher.execute(params);

				Button apply_button=(Button)findViewById(R.id.apply_button);
				apply_button.setEnabled(false);
			}
		});

		int kp=sharedPreferences.getInt("kp_trigger",7);
		SeekBar kp_bar=(SeekBar)findViewById(R.id.settings_kp_seek);
		kp_bar.setProgress(kp);
		TextView kp_text=(TextView)findViewById(R.id.setting_kp_text);
		kp_text.setText("KP ("+kp+")");

		kp_bar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener()
		{
			@Override
			public void onStopTrackingTouch(SeekBar seekBar)
			{
			}

			@Override
			public void onStartTrackingTouch(SeekBar seekBar)
			{
			}

			@Override
			public void onProgressChanged(SeekBar seekBar,int progress,boolean fromUser)
			{
				TextView kp_text=(TextView)findViewById(R.id.setting_kp_text);
				kp_text.setText("KP ("+progress+")");
				Button apply_button=(Button)findViewById(R.id.apply_button);
				apply_button.setEnabled(true);
			}
		});
	}
}
