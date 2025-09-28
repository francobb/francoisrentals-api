import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Unit } from '@models/unit.pg_model';
import { Tenant } from '@models/tenant.pg_model';

@Entity('occupancies')
export class Occupancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  externalId: string;

  @Column({ type: 'date' })
  moveIn: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rent: number;

  @Column({ type: 'date', nullable: true })
  leaseEnd: Date;

  @OneToOne(() => Unit, unit => unit.currentOccupancy)
  @JoinColumn()
  unit: Unit;

  @ManyToOne(() => Tenant, tenant => tenant.occupancies)
  tenant: Tenant;
}
