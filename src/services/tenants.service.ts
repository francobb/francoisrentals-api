import Stripe from 'stripe';
import stripe from '@clients/stripe.client';
import { AppDataSource } from '@databases';
import { Tenant } from '@models/tenant.pg_model';
import { CreateTenantDto } from '@dtos/tenants.dto';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { logger } from '@utils/logger';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { PropertyType } from '@interfaces/tenants.interface';
import { Occupancy } from '@models/occupancy.pg_model';

class TenantService {
  public pg_tenants: Repository<Tenant> = AppDataSource.getRepository(Tenant);
  public pg_occupancies: Repository<Occupancy> = AppDataSource.getRepository(Occupancy);

  public async findAllTenants(): Promise<Tenant[]> {
    return this.pg_tenants.find({ relations: ['property', 'occupancies'] });
  }

  public async findTenantById(id: string): Promise<Tenant> {
    return this.pg_tenants.findOne({ where: { id }, relations: ['property', 'occupancies'] });
  }

  public async findTenantsByProperty(property: PropertyType): Promise<Tenant[]> {
    return this.pg_tenants
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.property', 'property')
      .where('property.name = :property', { property })
      .getMany();
  }

  public async findAllActiveTenants(): Promise<Tenant[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeOccupancies = await this.pg_occupancies.find({
      where: {
        moveIn: LessThanOrEqual(today),
        leaseEnd: MoreThan(today),
      },
      relations: ['tenant'],
    });

    return activeOccupancies.map(occupancy => occupancy.tenant);
  }

  public async createTenant(tenantData: CreateTenantDto): Promise<Tenant> {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    // const findTenant: Tenant = await this.pg_tenants.findOne({ where: { email: tenantData.email } });
    // if (findTenant) throw new HttpException(409, `You're already registered`);

    const customer = await this.createCustomer(tenantData);
    const newTenant = new Tenant();
    newTenant.name = tenantData.name;
    // newTenant.email = tenantData.email;
    // newTenant.property = tenantData.property;

    return this.pg_tenants.save(newTenant);
  }

  public async updateTenant(tenantId: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    if (isEmpty(tenantData)) throw new HttpException(400, "You're not tenantData");

    const tenant = await this.findTenantById(tenantId);
    if (!tenant) throw new HttpException(404, 'Tenant not found');

    Object.assign(tenant, tenantData);
    return this.pg_tenants.save(tenant);
  }

  public createCustomer = async (tenantData: CreateTenantDto) => {
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

  public async updateRentalBalance() {
    const activeOccupancies = await this.pg_occupancies.find({ relations: ['tenant'] });
    const currentDate = new Date();
    const isFirstDayOfMonth = currentDate.getDate() === 1;

    if (isFirstDayOfMonth) {
      for (const occupancy of activeOccupancies) {
        if (occupancy.tenant) {
          logger.info(`Monthly rent of $${occupancy.rent} charged for tenant ${occupancy.tenant.name} at unit ${occupancy.unit.name}`);
          // If a rental balance needs to be tracked, it would require a new field in the schema (e.g., in Occupancy or a new Transaction type).
        }
      }
    }
  }
}

export default TenantService;
