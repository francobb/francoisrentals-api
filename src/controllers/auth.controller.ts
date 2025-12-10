import { NextFunction, Request, Response } from 'express';
import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  /*
    The signUp, forgotPassword, and local logIn methods have been removed.
    User authentication is now handled exclusively by external providers like Google.
    The `signIn` method below is the new entry point after a successful OAuth callback.
  */

  /**
   * This method is called by the Passport.js middleware after a successful
   * external authentication (e.g., Google). It receives the user profile
   * and creates a session for them.
   */
  public signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The user object is attached to the request by Passport.js
      const { user }: any = req;

      // We no longer have a local user, so we pass the profile from the provider
      // to our service to create a session.
      const { cookie, tenantInfo, findUser } = await this.authService.createSession(user);

      const auth = cookie.split(';')[0];
      const token = auth.split('=')[1];

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ token, tenantInfo, user: findUser, message: 'accessToken' });
    } catch (e) {
      next(e);
    }
  };

  public logOut = async (_req: Request, res: Response) => {
    res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
    res.status(200).json({ message: 'logged out' });
  };
}

export default AuthController;
