import { google } from 'googleapis';
import { APP_ID, APP_SECRET, REDIRECT_URI, PRIVATE_KEY, CLIENT_EMAIL } from '@config';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { JWT } from 'google-auth-library/build/src/auth/jwtclient';
import { logger } from '@utils/logger';
class GoogleClient {
  private static JWTClient: JWT;
  private static OAuth2Client: OAuth2Client;

  private static initializeJWTClient() {
    logger.info('PRIVATE_KEY', PRIVATE_KEY.replace(/\\n/g, '\n'));
    return new google.auth.JWT(CLIENT_EMAIL, null, PRIVATE_KEY.replace(/\\n/g, '\n'), [
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
