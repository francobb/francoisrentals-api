import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBuffer', async: false })
class IsBufferConstraint implements ValidatorConstraintInterface {
  validate(buffer: any) {
    return buffer instanceof Buffer;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a Buffer object.`;
  }
}

// Custom decorator to validate Buffer type
export function IsBuffer(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBuffer',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsBufferConstraint,
    });
  };
}

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

  @IsBuffer()
  public buffer: Buffer;

  @IsNumber()
  @IsNotEmpty()
  public size: number;
}
