import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Property } from '@models/property.pg_model';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  externalId: string;

  @Column({ type: 'timestamp' })
  postedOn: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // cashIn or cashOut

  @Column({ type: 'varchar', length: 255, nullable: true })
  partyId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  partyName: string;

  @ManyToOne(() => Property, property => property.transactions)
  property: Property;

  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
