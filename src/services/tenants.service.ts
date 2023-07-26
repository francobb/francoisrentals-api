import Stripe from 'stripe';
import tenantsModel from '@models/tenants.model';
import { CreateTenantDto } from '@dtos/tenants.dto';
import { HttpException } from '@exceptions/HttpException';
import { Tenant } from '@interfaces/tenants.interface';
import { isEmpty } from '@utils/util';
import stripe from '@/config/stripe.config';
import { logger } from '@utils/logger';

class TenantService {
  public tenants = tenantsModel;

  public async findAllTenants(): Promise<Tenant[]> {
    return this.tenants.find();
  }

  public async createTenant(tenantData: CreateTenantDto): Promise<Tenant> {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    // const customer = await this.createCustomer(tenantData);

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

  // createCustomer = async tenantData => {
  //   const params: Stripe.CustomerCreateParams = {
  //     name: tenantData.name,
  //     email: tenantData.email,
  //     description: `${tenantData.unit} at ${tenantData.property}`,
  //   };
  //
  //   const customer: Stripe.Customer = await stripe.customers.create(params);
  //
  //   logger.info(`created stripe customer ${customer.id}`);
  //   return customer;
  // };
}

export default TenantService;
