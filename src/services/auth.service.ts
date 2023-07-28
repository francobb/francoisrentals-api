import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import tenantsModel from '@models/tenants.model';
import userModel from '@models/users.model';
import { CreateUserDto } from '@dtos/users.dto';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { GoogleUserDto } from '@dtos/gusers.dto';
import { HttpException } from '@exceptions/HttpException';
import { SECRET_KEY } from '@config';
import { Tenant } from '@interfaces/tenants.interface';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';

class AuthService {
  public users = userModel;
  public tenants = tenantsModel;

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    return await this.users.create({ ...userData, password: hashedPassword });
  }

  public async login(userData: CreateUserDto | GoogleUserDto): Promise<{ cookie: string; findUser: User; tenantInfo: Tenant }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    if (userData.hasOwnProperty('password')) {
      const isPasswordMatching: boolean = await compare((userData as CreateUserDto).password, findUser.password);
      if (!isPasswordMatching) throw new HttpException(409, 'Your password not matching');
    }

    const tenantInfo = await this.tenants.findOne({ email: userData.email });
    const tokenData = this.createToken(findUser, tenantInfo);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser, tenantInfo };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    return findUser;
  }

  private createToken(user: User, tenantInfo: Tenant): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id, tenant: tenantInfo };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  private createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
