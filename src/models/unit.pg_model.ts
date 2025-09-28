import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { Property } from '@models/property.pg_model';
import { Occupancy } from '@models/occupancy.pg_model';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  externalId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: false })
  occupied: boolean;

  @ManyToOne(() => Property, property => property.units)
  property: Property;

  @OneToOne(() => Occupancy, occupancy => occupancy.unit)
  currentOccupancy: Occupancy;
}
