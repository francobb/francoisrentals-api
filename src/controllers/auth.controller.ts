import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, loginUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.email;
      await this.authService.forgotPassword(email);

      res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
      next(error);
    }
  };

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);

      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: loginUserDto = req.body;
      const { cookie, tenantInfo, findUser } = await this.authService.login(userData);
      const COOKIE_VALUE = cookie.replace('Authorization=', '').split(' ')[0].replace(';', '');

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ cookie: COOKIE_VALUE, tenantInfo, user: findUser, message: 'accessToken' });
    } catch (error) {
      next(error);
    }
  };

  /* passport handlers */

  public signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        user: { cookie, tenantInfo, findUser },
      }: any = req;

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
