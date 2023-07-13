import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ImageDto {
  @IsString()
  @IsNotEmpty()
  public fieldname: string;

  @IsString()
  @IsNotEmpty()
  public originalname: string;

  @IsString()
  @IsNotEmpty()
  public encoding: string;

  @IsString()
  @IsNotEmpty()
  public mimetype: string;

  @IsString()
  @IsNotEmpty()
  public destination: string;

  @IsString()
  @IsNotEmpty()
  public filename: string;

  @IsString()
  @IsNotEmpty()
  public path: string;

  @IsNumber()
  @IsNotEmpty()
  public size: number;
}
