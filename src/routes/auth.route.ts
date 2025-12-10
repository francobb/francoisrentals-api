import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { Routes } from '@interfaces/routes.interface';
import { localAuth } from '@middlewares/auth.middleware';

class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // The routes for local signup, login, and forgot-password have been removed.
    // Authentication is now handled by external providers.
    this.router.post(`${this.path}logout`, this.authController.logOut);

    /* The passportJs route is now the primary way to create a session after an OAuth callback. */
    this.router.post(`${this.path}signin`, localAuth, this.authController.signIn);
  }
}

export default AuthRoute;
