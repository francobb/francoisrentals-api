import tenantsModel from '@models/tenants.model';
import { Tenant } from '@interfaces/tenants.interface';
import { isEmpty } from '@utils/util';
import { CreateTenantDto } from '@dtos/tenants.dto';
import { HttpException } from '@exceptions/HttpException';

class TenantService {
  public tenants = tenantsModel;

  public async findAllTenants(): Promise<Tenant[]> {
    const tenants: Tenant[] = await this.tenants.find();
    return tenants;
  }

  public async createTenant(tenantData: CreateTenantDto): Promise<Tenant> {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    const findTenant: Tenant = await this.tenants.findOne({ email: tenantData.email });
    if (findTenant) throw new HttpException(409, `You're already registered`);

    const createTenantData: Tenant = await this.tenants.create({ ...tenantData });

    return createTenantData;
  }
}

export default TenantService;
