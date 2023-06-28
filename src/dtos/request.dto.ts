import { IsString } from 'class-validator';

export class MaintenanceRequestDto {
  @IsString()
  public details: string;

  @IsString()
  public location: string;

  @IsString()
  public room: string;

  @IsString()
  public unit: string;
}
