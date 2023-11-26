import { Router } from 'express';
import GoogleController from '@controllers/google.controller';
import { Routes } from '@interfaces/routes.interface';
import { authWithGoogle, authWithGoogleCallback, checkClient, checkRole, requireJwtAuth } from '@middlewares/auth.middleware';

class GoogleRoute implements Routes {
  public path = '/';
  public router = Router();

  public googleController = new GoogleController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}getAuthUrl`, this.googleController.getAuthUrl);

    /* FR-RN-Client */
    this.router.post(`${this.path}auth/google/client`, checkClient, this.googleController.handleClientAuthRequest);
    this.router.get(`${this.path}listFiles`, requireJwtAuth, checkRole(['ADMIN']), this.googleController.getFilesFromDrive);

    /* passport google routes */
    this.router.get(`${this.path}google`, authWithGoogle);
    this.router.get(`${this.path}auth/google/callback`, authWithGoogleCallback, this.googleController.googleOauth20Handler);
    /* passport google routes */
  }
}

export default GoogleRoute;
