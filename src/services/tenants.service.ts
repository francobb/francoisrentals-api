import tenantsModel from '@models/tenants.model';
import { Tenant } from '@interfaces/tenants.interface';
import { isEmpty } from '@utils/util';
import { CreateTenantDto } from '@dtos/tenants.dto';
import { HttpException } from '@exceptions/HttpException';
import { stripe } from '@config';

class TenantService {
  public tenants = tenantsModel;

  public async findAllTenants(): Promise<Tenant[]> {
    return this.tenants.find();
  }

  public async createTenant(tenantData: CreateTenantDto): Promise<Tenant> {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    const customer = await stripe.customers.create();

    // todo: add stripe info to tenant.
    const findTenant: Tenant = await this.tenants.findOne({ email: tenantData.email });
    if (findTenant) throw new HttpException(409, `You're already registered`);

    return await this.tenants.create({ ...tenantData });
  }

  async updateTenant(tenantId: string, tenantData: CreateTenantDto) {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    const findTenant: Tenant = await this.tenants.findByIdAndUpdate(tenantId, { tenantData });
    if (!findTenant) throw new HttpException(409, `Tenant not found`);

    return findTenant;
  }
}

export default TenantService;
