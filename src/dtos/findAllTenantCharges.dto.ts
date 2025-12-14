import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllTenantChargesDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
