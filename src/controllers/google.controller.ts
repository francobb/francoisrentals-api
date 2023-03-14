import { NextFunction, Request, Response } from 'express';
import GoogleService from '@services/google.service';
import AuthService from '@services/auth.service';
import { ROOT_URI } from '@config';

class GoogleController {
  public authService = new AuthService();
  public googleService = new GoogleService();
  // public users = userModel;

  public getAuthUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUrl = this.googleService.getAuthUrl();
      res.status(200).redirect(authUrl);
    } catch (err: any) {
      console.log('Failed to get Auth URI', err);
      next(err);
    }
  };
  public googleOauthHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code as string;

      if (!code) {
        return res.status(401).json({
          status: 'fail',
          message: 'Authorization code not provided!',
        });
      }

      const { id_token, access_token } = await this.googleService.authenticateWithGoogle(code);

      console.log({ idToken: id_token, acT: access_token });
      // const { id_token, access_token } = await this.googleService.getGoogleOauthToken({ code });

      const { name, verified_email, email, picture } = await this.googleService.getGoogleUser({
        id_token,
        access_token,
      });

      if (!verified_email) {
        return res.status(403).json({
          status: 'fail',
          message: 'Google account not verified',
        });
      }
      const { cookie, findUser } = await this.authService.login({ email, name });
      const COOKIE_NAME = 'Authorization';
      const COOKIE_VALUE = cookie.replace('Authorization=', '');
      res
        .setHeader('set-cookie', ['cookie2=value2; SameSite=None; Secure'])
        .cookie(COOKIE_NAME, COOKIE_VALUE, { sameSite: 'none', maxAge: 900000, httpOnly: true, secure: true });
      const hdrs = res.getHeaders();
      console.log({ hdrs });
      // res
      //   .send();
      // res.cookie(COOKIE_NAME, cookie, { path: '/', maxAge: 900000, httpOnly: true, domain: `${ROOT_URI.replace('http://', '.')}` });
      // res.redirect('/');
      res.status(200).json({ data: findUser, message: 'login' });
    } catch (err: any) {
      console.log('Failed to authorize Google User', err);
      next(err);
    }
  };

  listFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.googleService.listDriveFiles();
      res.status(200).json({ message: 'ran get files from drive' });
    } catch (err: any) {
      console.log('Failed to get files', err);
      next(err);
    }
  };
}

export default GoogleController;
