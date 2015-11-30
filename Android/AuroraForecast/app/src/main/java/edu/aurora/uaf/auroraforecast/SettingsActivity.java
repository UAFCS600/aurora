package edu.aurora.uaf.auroraforecast;

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
	private SharedPreferences sharedPreferences;
	SettingsManager manager;
	private Toolbar toolbar;
	private SeekBar kp_bar;
	private TextView kp_text;
	Button apply_button;

	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_settings);

		sharedPreferences=PreferenceManager.getDefaultSharedPreferences(this);
		manager=new SettingsManager(sharedPreferences);
		toolbar=(Toolbar)findViewById(R.id.toolbar);
		kp_text=(TextView)findViewById(R.id.setting_kp_text);
		kp_bar=(SeekBar)findViewById(R.id.settings_kp_seek);
		apply_button=(Button)findViewById(R.id.apply_button);

		setSupportActionBar(toolbar);
		getSupportActionBar().setDisplayHomeAsUpEnabled(true);
		getSupportActionBar().setDisplayShowHomeEnabled(true);

		int kpMin=manager.getInt("kpMin",0);
		int kpMax=manager.getInt("kpMax",0);
		int kpTrigger=manager.getInt("kpTrigger",kpMin);

		kp_bar.setMax(kpMax-kpMin);
		kp_bar.setProgress(kpTrigger-kpMin);
		kp_text.setText("KP ("+kpTrigger+")");

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
				kp_text.setText("KP ("+(manager.getInt("kpMin",0)+progress)+")");
				apply_button.setEnabled(true);
			}
		});

		apply_button.setOnClickListener(new View.OnClickListener()
		{
			@Override
			public void onClick(View view)
			{
				manager.setInt("kpTrigger",manager.getInt("kpMin",0)+kp_bar.getProgress());
				manager.sync();
				apply_button.setEnabled(false);
			}
		});
	}
}
