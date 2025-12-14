import { IsDateString, IsNumberString, IsOptional } from 'class-validator';

export class FindAllTransactionsDto {
  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a number' })
  public limit?: number;

  @IsOptional()
  @IsNumberString({}, { message: 'Offset must be a number' })
  public offset?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string (YYYY-MM-DD)' })
  public startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string (YYYY-MM-DD)' })
  public endDate?: string;
}
