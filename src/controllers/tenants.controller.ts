import { NextFunction, Request, Response } from 'express';
import TenantService from '@services/tenants.service';
import type { PropertyType, Tenant } from '@interfaces/tenants.interface';

class TenantsController {
  constructor() {
    //old way
    this.updateTenant = this.updateTenant.bind(this);
  }
  public tenantService = new TenantService();

  // todo: rename to getAllTenants
  public getTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenants: Tenant[] = await this.tenantService.findAllActiveTenants();
      res.status(200).json({ tenants, message: 'get All Tenants' });
    } catch (error) {
      next(error);
    }
  };

  public getTenantById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenant: Tenant = await this.tenantService.findTenantById(req.query.tenantId as string);
      res.status(200).json({ tenant, message: 'getTenant' });
    } catch (error) {
      next(error);
    }
  };

  public createTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantData = req.body;
      const tenant = await this.tenantService.createTenant(tenantData);

      res.status(201).json({ data: tenant, message: 'Tenant created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getTenantsByProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const property: PropertyType = req.params.property as PropertyType;
      const tenants: Tenant[] = await this.tenantService.findTenantsByProperty(property);
      res.status(200).json({ tenants, message: 'getTenantsByProperty' });
    } catch (error) {
      next(error);
    }
  };

  public async updateTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantData = req.body;
      const tenant = await this.tenantService.updateTenant(tenantData._id, tenantData);

      res.status(200).json({ tenant, message: 'Tenant updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default TenantsController;
