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
		int kpTrigger=getInt("kpTrigger",7);

		NetworkDispatcher dispatcher=new NetworkDispatcher();
		String[] params=new String[2];
		params[0]="http://137.229.25.180/?pushNotification";
		params[1]="{\"token\":\""+token+"\",\"kpTrigger\":\""+kpTrigger+"\"}";
		dispatcher.execute(params);
	}
}
