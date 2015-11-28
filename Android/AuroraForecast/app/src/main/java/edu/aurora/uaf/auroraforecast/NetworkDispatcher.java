package edu.aurora.uaf.auroraforecast;

import android.os.AsyncTask;
import android.util.Log;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;

class NetworkDispatcher extends AsyncTask<String,Void,String>
{
	//expecting params [0]=urlstr, [1]=postdata
	protected String doInBackground(String... params)
	{
		InputStream in=null;
		int resCode=-1;
		String urlStr=params[0];
		String data=params[1];

		Log.d("DISPATCHER","SENDING "+data);

		try
		{
			URL url=new URL(urlStr);
			URLConnection urlConn=url.openConnection();

			if(!(urlConn instanceof HttpURLConnection))
				throw new IOException("Invalid url \'"+url+"\".");

			HttpURLConnection connection=(HttpURLConnection)urlConn;

			try
			{
				connection.setRequestMethod("POST");
				connection.setRequestProperty("Content-Type","application/x-www-form-urlencoded");
				connection.setRequestProperty("Content-Length",""+Integer.toString(data.getBytes().length));
				connection.setUseCaches(false);
				connection.setDoInput(true);
				connection.setDoOutput(true);

				DataOutputStream wr=new DataOutputStream(connection.getOutputStream());
				wr.writeBytes(data);
				wr.flush();
				wr.close();

				InputStream is=connection.getInputStream();
				BufferedReader rd=new BufferedReader(new InputStreamReader(is));
				String line;
				StringBuffer response=new StringBuffer();
				while((line=rd.readLine())!=null)
				{
					response.append(line);
					response.append('\r');
				}
				rd.close();
				return response.toString();
			}
			catch(Exception error)
			{
				Log.d("Server Test",""+error);
			}

			connection.disconnect();

		}
		catch (Exception error)
		{
			Log.d("Server Test",""+error);
		}

		return "";
	}
}
