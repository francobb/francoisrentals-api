import { Request } from 'express';
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
  user: {
    email: string;
    name: string;
    password: string;
    role: string;
    resetToken?: Promise<unknown>;
    resetTokenExpires?: Date;
  };
}
