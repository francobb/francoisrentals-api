import tenantsModel from '@models/tenants.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';

class TenantService {
  public tenants = tenantsModel;

  public async getTenants() {
    const tenants = await tenantsModel.find();
    return tenants;
  }

  async createTenant(tenantData: any) {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    const tenant = await this.tenants.create({ ...tenantData });
    return tenant;
  }
}

export default TenantService;
