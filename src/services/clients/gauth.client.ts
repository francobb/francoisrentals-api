import { google } from 'googleapis';
import { APP_ID, APP_SECRET, REDIRECT_URI } from '@config';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import credentials from '../../assets/keyfile.json';
import { JWT } from 'google-auth-library/build/src/auth/jwtclient';
class GoogleClient {
  private static JWTClient;
  private static OAuth2Client;

  private static initializeJWTClient() {
    return new google.auth.JWT(credentials.client_email, null, credentials.private_key, [
      'profile',
      'email',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/calendar',
    ]);
  }
  private static initializeOAuthClient() {
    return new google.auth.OAuth2(APP_ID, APP_SECRET, REDIRECT_URI);
  }
  private static initOAuthClient() {
    GoogleClient.OAuth2Client = GoogleClient.initializeOAuthClient();
  }
  private static initJWTClient() {
    GoogleClient.JWTClient = GoogleClient.initializeJWTClient();
  }
  static getOAuthClient(): OAuth2Client {
    if (!this.OAuth2Client) this.initOAuthClient();
    return this.OAuth2Client;
  }
  static getJWTClient(): JWT {
    if (!this.JWTClient) this.initJWTClient();
    return this.JWTClient;
  }
  static async generateAuthURL(): Promise<string> {
    if (this.OAuth2Client instanceof OAuth2Client) {
      return this.OAuth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // scopes are documented here: https://developers.google.com/identity/protocols/oauth2/scopes#calendar
        scope: [
          'profile',
          'email',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.appdata',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.readonly',
        ],
        include_granted_scopes: true,
      });
    }
  }
}

export default GoogleClient;
