import Stripe from 'stripe';
import stripe from '@clients/stripe.client';
import tenantsModel from '@models/tenants.model';
import { CreateTenantDto } from '@dtos/tenants.dto';
import { HttpException } from '@exceptions/HttpException';
import { Tenant } from '@interfaces/tenants.interface';
import { isEmpty } from '@utils/util';
import { logger } from '@utils/logger';

class TenantService {
  public tenants = tenantsModel;

  public async findAllTenants(): Promise<Tenant[]> {
    return this.tenants.find();
  }

  public async findTenantById(id: string): Promise<Tenant> {
    return this.tenants.findById(id);
  }

  public async createTenant(tenantData: CreateTenantDto): Promise<Tenant> {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    const findTenant: Tenant = await this.tenants.findOne({ email: tenantData.email });
    if (findTenant) throw new HttpException(409, `You're already registered`);

    const customer = await this.createCustomer(tenantData);
    return await this.tenants.create({ ...tenantData, customerId: customer.id });
  }

  async updateTenant(tenantId: string, tenantData: Tenant) {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    const findTenant: Tenant = await this.tenants.findByIdAndUpdate({ _id: tenantId }, { ...tenantData }, { new: true, useFindAndModify: false });
    if (!findTenant) throw new HttpException(409, `Tenant not found`);

    return findTenant;
  }

  createCustomer = async (tenantData: CreateTenantDto) => {
    const params: Stripe.CustomerCreateParams = {
      description: `Unit #${tenantData.unit} at ${tenantData.property}`,
      email: tenantData.email,
      name: tenantData.name,
      phone: tenantData.phone[0],
      address: {
        city: 'Woonsocket',
        country: 'US',
        line1: tenantData.property,
        line2: `Unit #${tenantData.unit}`,
        postal_code: '02895',
        state: 'RI',
      },
    };

    const customer: Stripe.Customer = await stripe.customers.create(params);

    logger.info(`created stripe customer ${customer.id}`);
    return customer;
  };
}

export default TenantService;
