import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Unit } from './unit.pg_model';
import { Tenant } from './tenant.pg_model';

@Entity('occupancy_snapshots')
export class OccupancySnapshot {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  occupancyId: string; // The externalId of the occupancy

  @PrimaryColumn({ type: 'timestamp' }) // Changed from 'date' to 'timestamp'
  snapshotDate: Date;

  @ManyToOne(() => Unit)
  unit: Unit;

  @Column({ type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Tenant, { nullable: true })
  tenant: Tenant;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ type: 'date' })
  moveIn: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rent: number;

  @Column({ type: 'date', nullable: true })
  leaseEnd: Date | null;
}
