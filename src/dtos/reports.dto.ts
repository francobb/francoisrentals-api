import { IsString } from 'class-validator';

export class ReportsDto {
  @IsString()
  public month: string;

  @IsString()
  public year: string;

  @IsString()
  public data: string;
}
