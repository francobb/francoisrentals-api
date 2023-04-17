import { NextFunction, Request, Response } from 'express';
import TenantService from '@services/tenants.service';

class TenantsController {
  public tenantService = new TenantService();
  public async getTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = await this.tenantService.getTenants();
      res.status(200).json({ data: tenants });
    } catch (error) {
      next(error);
    }
  }

  public async createTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantData = req.body;
      const tenant = await this.tenantService.createTenant(tenantData);

      res.status(201).json({ data: tenant, message: 'Tenant created successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default TenantsController;
