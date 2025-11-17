import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Property } from './property.pg_model';
import { Occupancy } from './occupancy.pg_model';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  externalId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean' })
  occupied: boolean;

  @ManyToOne(() => Property, property => property.units)
  property: Property;

  @Column({ type: 'uuid' })
  propertyId: string;

  @OneToOne(() => Occupancy, occupancy => occupancy.unit)
  @JoinColumn()
  currentOccupancy: Occupancy;
}
