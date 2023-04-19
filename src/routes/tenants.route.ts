import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import TenantsController from '@controllers/tenants.controller';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateTenantDto } from '@dtos/tenants.dto';

class TenantsRoute implements Routes {
  #path = `/tenants`;
  public router = Router();
  public tenantsController = new TenantsController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.#path}`, authMiddleware, this.tenantsController.getTenants);
    this.router.post(`${this.#path}`, validationMiddleware(CreateTenantDto, 'body'), this.tenantsController.createTenant);
  }
}

export default TenantsRoute;
