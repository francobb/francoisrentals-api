import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Property } from '@models/property.pg_model';

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

  @Column({ nullable: true }) // Add this column to expose the foreign key
  propertyId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
