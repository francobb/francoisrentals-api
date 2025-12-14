import { POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } from '@config';
import { DataSource } from 'typeorm';
import { Property } from '@models/property.pg_model';
import { Tenant } from '@models/tenant.pg_model';
import { Transaction } from '@models/transactions.pg_model';
import { Unit } from '@models/unit.pg_model';
import { TenantChargeSnapshot } from '@models/tenant-charge-snapshot.pg_model';
import { OccupancySnapshot } from '@models/occupancy-snapshot.pg_model';
import { Occupancy } from '@models/occupancy.pg_model';
import { TenantCharge } from '@models/tenant-charge.pg_model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT || '5432'),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  synchronize: true, // Set to false in production
  logging: false,
  entities: [Property, Transaction, Tenant, Unit, TenantChargeSnapshot, OccupancySnapshot, Occupancy, TenantCharge],
  migrations: [],
  subscribers: [],
});
