import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Property } from './property.pg_model';
import { Tenant } from './tenant.pg_model';

@Entity('tenant_charge_snapshots')
export class TenantChargeSnapshot {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  chargeId: string; // The externalId of the charge

  @PrimaryColumn({ type: 'date' })
  snapshotDate: Date; // The date the snapshot was taken

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @Column({ type: 'date' })
  occurredOn: Date;

  @ManyToOne(() => Property)
  property: Property;

  @Column()
  propertyId: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: string;
}
