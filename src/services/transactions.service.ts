import { FindAllTransactionsDto } from '@dtos/findAllTransactions';
import { Transaction } from '@models/transactions.pg_model';
import { AppDataSource } from '@databases';
import { TenantCharge } from '@models/tenant-charge.pg_model';
import { IsNull, Not, Repository } from 'typeorm';
import { Tenant } from '@/models/tenant.pg_model';
import { FindAllTenantChargesDto } from '@/dtos/findAllTenantCharges.dto';
import { Property } from '@/models/property.pg_model';

export interface RentSnapshot {
  tenantName: string;
  propertyName: string;
  unitName: string;
  chargeAmount: number;
  outstandingBalance: number;
  chargeDate: Date;
}

class TransactionService {
  private transactionRepository: Repository<Transaction> = AppDataSource.getRepository(Transaction);
  private tenantRepository: Repository<Tenant> = AppDataSource.getRepository(Tenant);
  private tenantChargeRepository: Repository<TenantCharge> = AppDataSource.getRepository(TenantCharge);

  public async findAllTransactions(query: FindAllTransactionsDto): Promise<Transaction[]> {
    const { limit = 100, offset = 0, startDate, endDate } = query;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.property', 'property')
      .orderBy('transaction.postedOn', 'DESC')
      .skip(offset)
      .take(limit);

    if (startDate) {
      queryBuilder.andWhere('transaction.postedOn >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.postedOn <= :endDate', { endDate });
    }

    return await queryBuilder.getMany();
  }

  public async findAllTenantCharges(query: FindAllTenantChargesDto): Promise<TenantCharge[]> {
    const { limit = 100, offset = 0, startDate, endDate } = query;

    const queryBuilder = this.tenantChargeRepository
      .createQueryBuilder('tenant_charge')
      .leftJoinAndSelect('tenant_charge.property', 'property')
      .leftJoinAndSelect('tenant_charge.tenant', 'tenant')
      .orderBy('tenant_charge.occurredOn', 'DESC')
      .skip(offset)
      .take(limit);

    if (startDate) {
      queryBuilder.andWhere('tenant_charge.occurredOn >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('tenant_charge.occurredOn <= :endDate', { endDate });
    }

    return await queryBuilder.getMany();
  }

  public async populateTenantsFromTransactions(): Promise<{ created: number; updated: number }> {
    const transactions = await this.transactionRepository.find({
      where: {
        partyId: Not(IsNull()),
        partyName: Not(IsNull()),
        type: 'cashIn',
      },
      relations: ['property'],
      order: {
        postedOn: 'DESC',
      },
    });

    if (transactions.length === 0) {
      return { created: 0, updated: 0 };
    }

    const tenantMap = new Map<string, { name: string; property: Property }>();
    for (const transaction of transactions) {
      if (!tenantMap.has(transaction.partyId) && transaction.property) {
        tenantMap.set(transaction.partyId, {
          name: transaction.partyName,
          property: transaction.property,
        });
      }
    }

    const tenantsToUpsert: Partial<Tenant>[] = [];
    for (const [externalId, { name, property }] of tenantMap.entries()) {
      tenantsToUpsert.push({
        externalId,
        name,
        property: property,
      });
    }

    if (tenantsToUpsert.length > 0) {
      const result = await this.tenantRepository.upsert(tenantsToUpsert, ['externalId']);
      const createdCount = result.generatedMaps.length;
      const updatedCount = tenantsToUpsert.length - createdCount;
      return { created: createdCount, updated: updatedCount };
    }

    return { created: 0, updated: 0 };
  }

  public async getMonthlyRentSnapshot(): Promise<RentSnapshot[]> {
    const outstandingCharges = await AppDataSource.getRepository(TenantCharge)
      .createQueryBuilder('charge')
      .innerJoin('charge.property', 'property')
      .innerJoin('property.units', 'unit')
      .innerJoin('unit.currentOccupancy', 'occupancy')
      .innerJoin('occupancy.tenant', 'tenant')
      .select([
        'tenant.name AS "tenantName"',
        'property.name AS "propertyName"',
        'unit.name AS "unitName"',
        'charge.amount AS "chargeAmount"',
        'charge.balance AS "outstandingBalance"',
        'charge.occurredOn AS "chargeDate"',
      ])
      .where('charge.balance > 0')
      .andWhere("charge.occurredOn >= date_trunc('month', CURRENT_DATE)")
      .orderBy('property.name', 'ASC')
      .addOrderBy('unit.name', 'ASC')
      .getRawMany();

    return outstandingCharges;
  }
}

export default TransactionService;
