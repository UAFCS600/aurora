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
	private int kpMin=5;

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

		kp_bar.setProgress(manager.getInt("kpTrigger",7)-kpMin);
		kp_text.setText("KP ("+manager.getInt("kpTrigger",7)+")");

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
				kp_text.setText("KP ("+(kpMin+progress)+")");
				apply_button.setEnabled(true);
			}
		});

		apply_button.setOnClickListener(new View.OnClickListener()
		{
			@Override
			public void onClick(View view)
			{
				manager.setInt("kpTrigger",kpMin+kp_bar.getProgress());
				manager.sync();
				apply_button.setEnabled(false);
			}
		});
	}
}
