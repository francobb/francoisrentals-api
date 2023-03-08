import { IsEmail, IsString } from 'class-validator';

export class GoogleUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public name: string;
}
