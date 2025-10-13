import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Property } from '@models/property.pg_model';
import { Tenant } from '@models/tenant.pg_model';

@Entity('tenant_charges')
export class TenantCharge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  externalId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @Column({ type: 'date' })
  occurredOn: Date;

  @ManyToOne(() => Property)
  property: Property;

  @Column({ nullable: true })
  propertyId: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
