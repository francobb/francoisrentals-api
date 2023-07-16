import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import { HttpException } from '@exceptions/HttpException';

const validationMiddleware = (
  type: any,
  value: string | 'body' | 'query' | 'files' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return async (req, res, next) => {
    // if (req.url.includes('/tenants')) convertDates(req.body);

    try {
      let validationResult: ValidationError[] = [];

      if (value === 'files') {
        const files = req[value] as Express.MulterS3.File[];

        for (const file of files) {
          const errors = await validate(plainToInstance(type, file), { skipMissingProperties, whitelist, forbidNonWhitelisted });

          errors.forEach(error => {
            error.property = `${file.filename} ${error.property}`;
          });

          validationResult = validationResult.concat(errors);
        }
      } else {
        validationResult = await validate(plainToInstance(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted });
      }

      if (validationResult.length > 0) {
        const message = validationResult.map(error => `${error.property}: ${Object.values(error.constraints).join(', ')}`).join(', ');
        next(new HttpException(400, message));
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  };
};

export default validationMiddleware;
