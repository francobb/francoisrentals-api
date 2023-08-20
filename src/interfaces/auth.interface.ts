import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { Tenant } from '@interfaces/tenants.interface';

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

export interface RequestWithUser extends Request {
  user: User;
}
