import axios from 'axios';
import GoogleClient from '@clients/gauth.client';
import googleModel from '@models/google.model';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

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
  public jwtClient = GoogleClient.getJWTClient();
  public oauthClient = GoogleClient.getOAuthClient();

  public getAuthUrl() {
    return GoogleClient.generateAuthURL();
  }

  async getGoogleUser({ id_token, access_token }: { id_token: string; access_token: string }): Promise<GoogleUserResult> {
    try {
      const { data } = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      });
      return data;
    } catch (err: any) {
      logger.error(err);
      throw new HttpException(404, err.message);
    }
  }

  async authenticateWithGoogle(code: string): Promise<GoogleOauthToken> {
    let tr: any = {};

    const credentials = await this.googleUser.findOne();
    if (credentials) {
      // If credentials exist, set them in the OAuth2 client
      tr = credentials;
      this.oauthClient.setCredentials(credentials.toObject() as any);
    } else {
      // If credentials don't exist, obtain them from Google and store them in the database
      const tokenResponse = await this.oauthClient.getToken(code);
      this.oauthClient.setCredentials(tokenResponse.tokens);
      tr = tokenResponse.tokens;
      const newCredentials = await this.googleUser.create(tokenResponse.tokens);
      await newCredentials.save();
    }

    // If the access token has expired, refresh it and update the database
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.oauthClient.isTokenExpiring()) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const refreshedCredentials = await this.oauthClient.refreshToken(this.oauthClient.credentials.refresh_token);

      this.oauthClient.setCredentials(refreshedCredentials.tokens);
      tr = refreshedCredentials.tokens;
      await this.googleUser.updateOne({}, refreshedCredentials.tokens);
    }

    return tr;
  }
}

export default GoogleService;
