import { IsArray, IsDate, IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @IsEmail()
  public email: string;

  @IsOptional()
  @IsDate()
  public lease_to: Date;

  @IsDate()
  public move_in: Date;

  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsArray()
  public phone: string[];

  @IsNotEmpty()
  @IsString()
  public property: string;

  @IsNotEmpty()
  @IsString()
  public unit: string;
}
