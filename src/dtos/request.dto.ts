import { IsArray, IsOptional, IsString } from 'class-validator';
import { Image } from '@interfaces/images.interface';

export class MaintenanceRequestDto {
  @IsString()
  public details: string;

  @IsString()
  public location: string;

  @IsString()
  public room: string;

  @IsString()
  public unit: string;

  @IsOptional()
  @IsArray()
  // @Type(() => ImageDto)
  // public images: ImageDto[];
  // public images?: Array<Express.Multer.File>;
  public images?: Image[];
}
