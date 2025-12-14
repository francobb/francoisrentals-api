import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import PropertiesController from '@controllers/properties.controller';
import { apiKeyMiddleware } from '@middlewares/auth.middleware';

class PropertiesRoute implements Routes {
  public path = '/properties';
  public router = Router();
  public propertiesController = new PropertiesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, apiKeyMiddleware, this.propertiesController.getProperties);
    this.router.get(`${this.path}/expenses/average`, apiKeyMiddleware, this.propertiesController.getAverageExpenses);
  }
}

export default PropertiesRoute;
