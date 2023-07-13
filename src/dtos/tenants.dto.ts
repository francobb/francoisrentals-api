import { IsArray, IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsOptional()
  @IsString()
  public lease_to: string;

  @IsNotEmpty()
  @IsString()
  public move_in: string;

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
