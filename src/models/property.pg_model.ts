import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from '@models/transactions.pg_model';
import { Unit } from './unit.pg_model';
import { Tenant } from './tenant.pg_model';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  externalId: string; // matches propertyId from transactions

  @Column({ type: 'varchar', length: 255, nullable: true }) // Temporarily allow nulls
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Temporarily allow nulls
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  managementFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mortgage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sewer: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  water: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  trash: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  gas: number;

  @OneToMany(() => Transaction, transaction => transaction.property)
  transactions: Transaction[];

  @OneToMany(() => Unit, unit => unit.property)
  units: Unit[];

  @OneToMany(() => Tenant, tenant => tenant.property)
  tenants: Tenant[];
}
