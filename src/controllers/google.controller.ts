import { NextFunction, Request, Response } from 'express';
import { decode } from 'jsonwebtoken';
import { Profile } from 'passport-google-oauth20';
import GoogleService from '@services/google.service';
import AuthService from '@services/auth.service';
import { logger } from '@utils/logger';
import { HttpException } from '@exceptions/HttpException';

class GoogleController {
  public authService = new AuthService();
  public googleService = new GoogleService();

  public getAuthUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUrl = await this.googleService.getAuthUrl();
      res.status(200).redirect(authUrl);
    } catch (err: any) {
      logger.error('Failed to get Auth URI', err);
      next(err);
    }
  };

  public handleClientAuthRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const decodedToken = decode(token, { complete: true });
      const { payload } = decodedToken;

      const { cookie, tenantInfo, findUser } = await this.authService.login({ email: payload['email'], name: payload['name'] });
      const COOKIE_VALUE = cookie.replace('Authorization=', '').split(' ')[0].replace(';', '');

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ cookie: COOKIE_VALUE, tenantInfo, user: findUser, message: 'accessToken' });
    } catch (e) {
      logger.error('Failed to authorize Google User', e);
      next(e);
    }
  };

  /**
   * NOTE: NOT IN USE
   */
  public googleOauthHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code as string;

      if (!code) {
        this.handleError(401, 'Authorization code not provided!');
      }

      const { id_token, access_token } = await this.googleService.authenticateWithGoogle(code);
      const { name, verified_email, email } = await this.googleService.getGoogleUser({
        id_token,
        access_token,
      });

      if (!verified_email) {
        this.handleError(403, "You're not user data");
      }
      const { cookie, tenantInfo } = await this.authService.login({ email, name });
      const COOKIE_NAME = 'Authorization';
      const COOKIE_VALUE = cookie.replace('Authorization=', '').split(' ')[0].replace(';', '');
      res.cookie(COOKIE_NAME, COOKIE_VALUE, { sameSite: 'none', maxAge: 900000, httpOnly: true, secure: true, path: '/' });

      res.status(200).json({ data: tenantInfo, token: COOKIE_VALUE, message: 'login' });
    } catch (err: any) {
      logger.error('Failed to authorize Google User', err);
      next(err);
    }
  };

  /* passport handlers */
  public googleOauth20Handler = async (req: Request, res: Response, next: NextFunction) => {
    console.log({ req: req.query });
    try {
      const email = (req.user as Profile).emails[0].value;
      const name = (req.user as Profile).displayName;

      const { id_token, access_token } = await this.googleService.authenticateWithGoogle(req.query.code as string);
      logger.info('WAS ABLE TO GET TOKENS', { id_token, access_token });
      console.log('was able to get token');
      const { cookie, tenantInfo } = await this.authService.login({ email, name });
      const COOKIE_NAME = 'Authorization';
      const COOKIE_VALUE = cookie.replace('Authorization=', '').split(' ')[0].replace(';', '');
      res.cookie(COOKIE_NAME, COOKIE_VALUE, { sameSite: 'none', maxAge: 900000, httpOnly: true, secure: true, path: '/' });

      res.status(200).json({ data: tenantInfo, token: COOKIE_VALUE, message: 'login' });
    } catch (err: any) {
      logger.error('Failed to authorize Google User', err);
      next(err);
    }
  };
  /* passport handlers */

  private handleError(status: number, message: string) {
    throw new HttpException(status, message);
  }
}

export default GoogleController;
