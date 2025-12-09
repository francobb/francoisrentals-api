import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  password: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({
    type: 'enum',
    enum: ['OWNER', 'ADMIN', 'TENANT'],
    default: 'TENANT',
  })
  @IsNotEmpty()
  role: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires?: Date;
}
