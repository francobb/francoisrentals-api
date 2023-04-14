import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import TwilioController from '@controllers/twilio.controller';

class TwilioRoute implements Routes {
  public path = '/twilio';
  public router = Router();
  public indexController = new TwilioController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/rent`, this.indexController.sendRentReminder);
  }
}

export default TwilioRoute;
