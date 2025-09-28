import { TenantCharge } from '@models/tenant-charge.pg_model';
import { Repository } from 'typeorm';
import { AppDataSource } from '@databases';

class TenantChargeService {
  public pg_tenant_charges: Repository<TenantCharge> = AppDataSource.getRepository(TenantCharge);

  public async findAll(startDate: string, endDate: string): Promise<TenantCharge[]> {
    const queryBuilder = this.pg_tenant_charges
      .createQueryBuilder('tenant_charge')
      .leftJoinAndSelect('tenant_charge.property', 'property')
      .where('tenant_charge.occurredOn >= :startDate', { startDate })
      .andWhere('tenant_charge.occurredOn <= :endDate', { endDate })
      .orderBy('tenant_charge.occurredOn', 'DESC');

    return await queryBuilder.getMany();
  }
}

export default TenantChargeService;
