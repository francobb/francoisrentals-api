import { sign } from 'jsonwebtoken';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { GoogleUserDto } from '@dtos/gusers.dto';
import { HttpException } from '@exceptions/HttpException';
import { SECRET_KEY } from '@config';
import { Tenant } from '@interfaces/tenants.interface';
import { isEmpty } from '@utils/util';
import { User } from '@models/user.pg_model'; // We still need the type for a moment

// TODO: This service will be further simplified once the Tenant model is also migrated.
import tenantsModel from '@models/tenants.model';

class AuthService {
  // This service no longer manages users directly.
  // It only creates sessions for users authenticated by external providers.
  public tenants = tenantsModel;

  public async createSession(
    userData: GoogleUserDto,
  ): Promise<{ cookie: string; findUser: Partial<User>; tenantInfo: Tenant }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    // The user is already authenticated by Google. We just need to create our own session.
    // We construct a "user" object on the fly. It has no password and is not stored in our DB.
    const findUser: Partial<User> = {
      id: userData.id, // Or a unique ID from the auth provider
      email: userData.email,
      name: userData.name,
      role: 'USER', // Assign a default role or get it from the provider's scope
    };

    // TODO: This still uses the Mongoose model. This will be the next service to refactor.
    const tenantInfo = await this.tenants.findOne({ email: userData.email });

    const tokenData = this.createToken(findUser, tenantInfo);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser, tenantInfo };
  }

  private createToken(user: Partial<User>, tenantInfo: Tenant): TokenData {
    const dataStoredInToken: DataStoredInToken = {
      _id: user.id, // Use the ID from the auth provider
      role: user.role,
      tenant: tenantInfo,
      email: user.email,
    };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60; // 1 hour

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  private createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
