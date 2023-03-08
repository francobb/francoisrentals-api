import { google } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import axios from 'axios';
import { APP_SECRET, APP_ID, REDIRECT_URI } from '@config';
import qs from 'qs';
import googleModel from '@models/google.model';

interface GoogleOauthToken {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
class GoogleService {
  public googleUser = googleModel;
  public oauth2Client = new google.auth.OAuth2(APP_ID, APP_SECRET, REDIRECT_URI);

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
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
  getGoogleOauthToken = async ({ code }: { code: string }): Promise<GoogleOauthToken> => {
    const rootURl = 'https://oauth2.googleapis.com/token';

    const options = {
      code,
      client_id: APP_ID,
      client_secret: APP_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    };
    try {
      const { data } = await axios.post<GoogleOauthToken>(rootURl, qs.stringify(options), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return data;
    } catch (err: any) {
      console.log('Failed to fetch Google Oauth Tokens');
      throw new Error(err);
    }
  };

  getGoogleUser = async ({ id_token, access_token }: { id_token: string; access_token: string }): Promise<GoogleUserResult> => {
    try {
      const { data } = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      });
      return data;
    } catch (err: any) {
      console.log(err);
      throw Error(err);
    }
  };
  async authenticateWithGoogle(code: string): Promise<GoogleOauthToken> {
    let tr: any = {};
    // Create a new OAuth2 client if it doesn't exist yet
    // const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

    // Check if the user's credentials are already stored in the database
    const credentials = await this.googleUser.findOne();

    if (credentials) {
      // If credentials exist, set them in the OAuth2 client
      tr = credentials;
      this.oauth2Client.setCredentials(credentials.toObject() as Credentials);
    } else {
      // If credentials don't exist, obtain them from Google and store them in the database
      const tokenResponse = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokenResponse.tokens);
      tr = tokenResponse.tokens;
      const newCredentials = await this.googleUser.create(tokenResponse.tokens);
      await newCredentials.save();
    }

    // If the access token has expired, refresh it and update the database
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.oauth2Client.isTokenExpiring()) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const refreshedCredentials = await this.oauth2Client.refreshToken(this.oauth2Client.credentials.refresh_token);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.oauth2Client.setCredentials(refreshedCredentials.tokens);
      tr = refreshedCredentials.tokens;
      await this.googleUser.updateOne({}, refreshedCredentials.tokens);
    }

    return tr;
  }

  async listDriveFiles() {
    // Create a new Drive client
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const ID_OF_THE_FOLDER = '1jXtb1PHlAoHtHs3vfmSIgQF5rofvzO3Y';

    // List the user's files
    const { data } = await drive.files.list({
      pageSize: 10,
      q: `'${ID_OF_THE_FOLDER}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name)',
    });

    // Log the file names and IDs
    console.log('Files:');
    const files = data.files;
    if (files && files.length) {
      files.forEach(file => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  }
}

export default GoogleService;
