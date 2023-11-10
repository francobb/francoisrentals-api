import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import GoogleController from '@controllers/google.controller';
import { authWithGoogle, authWithGoogleCallback, checkRole, requireJwtAuth } from '@middlewares/auth.middleware';

class GoogleRoute implements Routes {
  public path = '/';
  public router = Router();

  public googleController = new GoogleController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    /* passport google routes */
    this.router.get(`${this.path}google`, authWithGoogle);
    this.router.get(`${this.path}auth/google/callback`, authWithGoogleCallback, this.googleController.googleOauth20Handler);
    /* passport google routes */
    this.router.get(`${this.path}listFiles`, requireJwtAuth, checkRole(['ADMIN']), this.googleController.getFilesFromDrive);
  }
}

export default GoogleRoute;
