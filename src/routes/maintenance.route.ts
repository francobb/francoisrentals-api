import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import MaintenanceController from '@controllers/maintenance.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { MaintenanceRequestDto } from '@dtos/request.dto';

class MaintenanceRoute implements Routes {
  public path = '/maintenance';
  public router = Router();
  public maintenanceController = new MaintenanceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, validationMiddleware(MaintenanceRequestDto, 'body'), this.maintenanceController.saveRequest);
  }
}

export default MaintenanceRoute;
