import { IsString, IsDateString, IsArray } from 'class-validator';

export class CreateTransactionDto {
  @IsArray()
  public balance: string;

  @IsDateString()
  public date: string;

  @IsString()
  public desc: string;

  @IsString()
  public location: string;

  @IsString()
  public outcome: string;

  @IsString()
  public payeePayer: string;
}
