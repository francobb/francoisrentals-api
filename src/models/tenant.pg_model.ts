// src/models/tenants.pg_model.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Transaction } from './transactions.pg_model';
import { Property } from './property.pg_model';
import { Occupancy } from './occupancy.pg_model';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  externalId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @ManyToOne(() => Property, property => property.externalId)
  property: Property;

  @OneToMany(() => Transaction, transaction => transaction.partyName)
  transactions: Transaction[];

  @OneToMany(() => Occupancy, occupancy => occupancy.tenant)
  occupancies: Occupancy[];
}
