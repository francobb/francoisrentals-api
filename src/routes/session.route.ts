import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import GoogleController from '@controllers/google.controller';
import authMiddleware from '@middlewares/auth.middleware';

class SessionRoute implements Routes {
  public path = '/';
  public router = Router();

  public googleController = new GoogleController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}getAuthUrl`, this.googleController.getAuthUrl);
    this.router.get(`${this.path}auth/google/callback`, this.googleController.googleOauthHandler);
    this.router.get(`${this.path}listFiles`, authMiddleware, this.googleController.listFiles);
  }
}

export default SessionRoute;
