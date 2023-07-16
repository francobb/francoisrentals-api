import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  public size: number;

  @IsString()
  @IsNotEmpty()
  public bucket: string;

  @IsString()
  @IsNotEmpty()
  public key: string;

  @IsString()
  @IsNotEmpty()
  public acl: string;

  @IsString()
  @IsNotEmpty()
  public contentType: string;

  @IsString()
  @IsOptional()
  public contentDisposition: string;

  @IsString()
  @IsOptional()
  public contentEncoding: string;

  @IsString()
  @IsNotEmpty()
  public storageClass: string;

  @IsString()
  @IsOptional()
  public serverSideEncryption: string;

  @IsString()
  @IsNotEmpty()
  public location: string;

  @IsString()
  @IsNotEmpty()
  public etag: string;

  @IsString()
  @IsOptional()
  public versionId: string;

  @IsObject()
  public metadata: object;
}
