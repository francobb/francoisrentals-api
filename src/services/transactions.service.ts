import { FindAllTransactionsDto } from '@dtos/findAllTransactions';
import { Transaction } from '@models/transactions.pg_model';
import { AppDataSource } from '@databases';
import { TenantCharge } from '@models/tenant-charge.pg_model';

export interface RentSnapshot {
  tenantName: string;
  propertyName: string;
  unitName: string;
  chargeAmount: number;
  outstandingBalance: number;
  chargeDate: Date;
}

class TransactionService {
  private transactionRepository = AppDataSource.getRepository(Transaction);
  private tenantChargeRepository = AppDataSource.getRepository(TenantCharge);

  /**
   * Finds all transactions with optional filtering and pagination.
   * @param query Query parameters (limit, offset, startDate, endDate)
   * @returns A promise that resolves to an array of transactions.
   */
  public async findAllTransactions(query: FindAllTransactionsDto): Promise<Transaction[]> {
    const { limit = 100, offset = 0, startDate, endDate } = query;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.property', 'property') // Also fetch the related property
      .orderBy('transaction.postedOn', 'DESC') // Order by most recent
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

  public async getMonthlyRentSnapshot(): Promise<RentSnapshot[]> {
    // This query finds all tenant charges with an outstanding balance
    // and joins across tables to get tenant, unit, and property details.
    const outstandingCharges = await this.tenantChargeRepository
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
      .andWhere("charge.occurredOn >= date_trunc('month', CURRENT_DATE)") // Filter for current month
      .orderBy('property.name', 'ASC')
      .addOrderBy('unit.name', 'ASC')
      .getRawMany();

    return outstandingCharges;
  }
}

export default TransactionService;
