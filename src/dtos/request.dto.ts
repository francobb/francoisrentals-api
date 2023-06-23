import { IsString } from 'class-validator';

export class MaintenanceRequestDto {
  @IsString()
  public details: string;

  @IsString()
  public location: string;
}
