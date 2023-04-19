import { NextFunction, Request, Response } from 'express';
import TenantService from '@services/tenants.service';
import { Tenant } from '@interfaces/tenants.interface';
import tenantsModel from '@models/tenants.model';

class TenantsController {
  public tenantService = new TenantService();
  public getTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenants: Tenant[] = await this.tenantService.findAllTenants();
      // const tenants: Tenant[] = await tenantsModel.find();
      res.status(200).json({ data: tenants, message: 'getTenants' });
    } catch (error) {
      next(error);
    }
  };

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
