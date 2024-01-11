import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import TenantsController from '@controllers/tenants.controller';
import authMiddleware, { checkRole } from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import {CreateTenantDto, UpdateTenantDto} from '@dtos/tenants.dto';

class TenantsRoute implements Routes {
  #path = `/tenants`;
  public router = Router();
  public tenantsController = new TenantsController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.#path}`, authMiddleware, checkRole(['ADMIN']), this.tenantsController.getTenants);
    this.router.get(`${this.#path}/getById`, authMiddleware, checkRole(['ADMIN', 'TENANT']), this.tenantsController.getTenantById);
    this.router.get(`${this.#path}/:property`, authMiddleware, checkRole(['ADMIN', 'TENANT']), this.tenantsController.getTenantsByProperty);
    this.router.post(
      `${this.#path}`,
      authMiddleware,
      checkRole(['ADMIN']),
      validationMiddleware(CreateTenantDto, 'body'),
      this.tenantsController.createTenant,
    );
    this.router.put(
      `${this.#path}`,
      authMiddleware,
      checkRole(['ADMIN']),
      validationMiddleware(UpdateTenantDto, 'body', true),
      this.tenantsController.updateTenant,
    );
  }
}

export default TenantsRoute;
