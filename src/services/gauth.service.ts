import { google } from 'googleapis';
import { APP_ID, APP_SECRET, REDIRECT_URI } from '@config';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';

class GoogleClient {
  static client;
  #client: OAuth2Client;
  private constructor(client: OAuth2Client) {
    this.#client = client;
  }

  static initialize() {
    return new GoogleClient(new google.auth.OAuth2(APP_ID, APP_SECRET, REDIRECT_URI)).#client;
  }

  static initClient() {
    GoogleClient.client = GoogleClient.initialize();
  }
  get client(): OAuth2Client {
    return this.#client;
  }

  static async generateAuthURL() {
    if (this.client instanceof OAuth2Client) {
      return this.client.generateAuthUrl({
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
