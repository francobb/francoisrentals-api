import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import TenantChargesController from '@controllers/tenant-charges.controller';
import { apiKeyMiddleware } from '@middlewares/auth.middleware';

class TenantChargesRoute implements Routes {
  public path = '/tenant-charges';
  public router = Router();
  public tenantChargesController = new TenantChargesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, apiKeyMiddleware, this.tenantChargesController.getTenantCharges);
  }
}

export default TenantChargesRoute;
