import { Request } from 'express';
import { Tenant } from '@interfaces/tenants.interface';
import { User } from '@interfaces/users.interface';

export interface DataStoredInToken {
  _id: string;
  email: string;
  role: string;
  tenant: Tenant;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export type RequestWithUser = Request & {
  user: User;
};
