import { NextFunction, Request, Response } from 'express';
import GoogleService from '@services/google.service';
import AuthService from '@services/auth.service';
import { logger } from '@utils/logger';
import { HttpException } from '@exceptions/HttpException';

class GoogleController {
  public authService = new AuthService();
  public googleService = new GoogleService();

  public getAuthUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUrl = this.googleService.getAuthUrl();
      res.status(200).redirect(authUrl);
    } catch (err: any) {
      logger.error('Failed to get Auth URI', err);
      next(err);
    }
  };
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
      const { cookie, findUser } = await this.authService.login({ email, name });
      const COOKIE_NAME = 'Authorization';
      const COOKIE_VALUE = cookie.replace('Authorization=', '').split(' ')[0].replace(';', '');
      res.cookie(COOKIE_NAME, COOKIE_VALUE, { sameSite: 'none', maxAge: 900000, httpOnly: true, secure: true, path: '/' });

      res.status(200).json({ data: findUser, message: 'login' });
    } catch (err: any) {
      logger.error('Failed to authorize Google User', err);
      next(err);
    }
  };
  public getFilesFromDrive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.googleService.listDriveFiles();
      res.status(200).json({ message: 'ran get files from drive' });
    } catch (err: any) {
      logger.error('Failed to get files', err);
      next(err);
    }
  };

  private handleError(status: number, message: string) {
    throw new HttpException(status, message);
  }
}

export default GoogleController;
