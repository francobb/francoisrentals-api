import { IsNotEmpty, IsString } from 'class-validator';

export class MaintenanceRequestDto {
  @IsString()
  @IsNotEmpty()
  public details: string;

  @IsString()
  @IsNotEmpty()
  public location: string;

  @IsString()
  @IsNotEmpty()
  public room: string;

  @IsString()
  @IsNotEmpty()
  public unit: string;
}
