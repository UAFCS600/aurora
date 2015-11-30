package edu.aurora.uaf.auroraforecast;

import android.content.SharedPreferences;

public class SettingsManager
{
	private SharedPreferences sharedPreferences;

	public SettingsManager(SharedPreferences preferences)
	{
		sharedPreferences=preferences;
	}

	public void setBool(String key,boolean value)
	{
		sharedPreferences.edit().putBoolean(key,value).apply();
	}

	public boolean getBool(String key,boolean default_value)
	{
		return sharedPreferences.getBoolean(key,default_value);
	}

	public void setInt(String key,int value)
	{
		sharedPreferences.edit().putInt(key,value).apply();
	}

	public int getInt(String key,int default_value)
	{
		return sharedPreferences.getInt(key,default_value);
	}

	public void setString(String key,String value)
	{
		sharedPreferences.edit().putString(key,value).apply();
	}

	public String getString(String key,String default_value)
	{
		return sharedPreferences.getString(key,default_value);
	}

	public void sync()
	{
		String token=getString("token","INVALID");
		int kpTrigger=getInt("kpTrigger",getInt("kpMin",0));

		if(kpTrigger<getInt("kpMin",0))
			kpTrigger=getInt("kpMin",0);
		if(kpTrigger>getInt("kpMax",0))
			kpTrigger=getInt("kpMax",0);

		setInt("kpTrigger",kpTrigger);

		NetworkDispatcher dispatcher=new NetworkDispatcher();
		String[] params=new String[2];
		params[0]="http://aurora.cs.uaf.edu/push_notification/";
		params[1]="{\"service\":\"gcm\",\"token\":\""+token+"\",\"kpTrigger\":\""+kpTrigger+"\"}";
		dispatcher.execute(params);
	}
}
