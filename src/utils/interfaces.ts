import { Request } from 'express';
import { ITransaction } from '@interfaces/transactions.interface';

export interface IRequest extends Request {
  query: IQuery;
}

export interface IQuery {
  [key: string]: string;
}

export interface IFile {
  id: string;
  name: string;
  pdf: Buffer;
  data?: ITransaction[];
}

export interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
