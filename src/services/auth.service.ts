import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import mailer from '@clients/mailer.client';
import { AppDataSource } from '@databases';
import { User } from '@models/user.pg_model'; // CORRECTED: Import TypeORM User model
import tenantsModel from '@models/tenants.model';
import { CreateUserDto, loginUserDto } from '@dtos/users.dto';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { GoogleUserDto } from '@dtos/gusers.dto';
import { HttpException } from '@exceptions/HttpException';
import { EMAIL_ADDRESS, SECRET_KEY } from '@config';
import { Tenant } from '@interfaces/tenants.interface';
import { isEmpty } from '@utils/util';
import { logger } from '@utils/logger';
import { Repository } from 'typeorm';

class AuthService {
  // CORRECTED: Use TypeORM repository
  public userRepository: Repository<User> = AppDataSource.getRepository(User);
  public tenants = tenantsModel; // This will be removed in a future step
  public transporter = mailer;

  public async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      logger.info(`User with email ${email} not found`);
      throw new HttpException(404, `User with email ${email} not found`);
    }

    const resetToken = await this.generateResetToken();
    user.resetToken = resetToken as string;
    user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);
    await this.sendResetPasswordEmail(user.email, user.resetToken);
  }

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.userRepository.findOneBy({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = this.userRepository.create({ ...userData, password: hashedPassword });
    return await this.userRepository.save(createUserData);
  }

  public async login(userData: loginUserDto | GoogleUserDto): Promise<{ cookie: string; findUser: User; tenantInfo: Tenant }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.userRepository.findOneBy({ email: userData.email });
    if (!findUser) throw new HttpException(409, `Your email ${userData.email} is not found`);

    if (userData.hasOwnProperty('password')) {
      const isPasswordMatching: boolean = await compare((userData as loginUserDto).password, findUser.password);
      if (!isPasswordMatching) throw new HttpException(409, 'Your password is not matching');
    }

    // TODO: This still uses the Mongoose model. This will be the next service to refactor.
    const tenantInfo = await this.tenants.findOne({ email: userData.email });
    const tokenData = this.createToken(findUser, tenantInfo);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser, tenantInfo };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.userRepository.findOneBy({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `Your email ${userData.email} is not found`);

    return findUser;
  }

  private createToken(user: User, tenantInfo: Tenant): TokenData {
    // Note: The user._id is now user.id for the TypeORM model
    const dataStoredInToken: DataStoredInToken = { _id: user.id, role: user.role, tenant: tenantInfo, email: user.email };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  private createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  private generateResetToken(length = 32): Promise<string> {
    return new Promise((resolve, reject) => {
      randomBytes(length, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer.toString('hex'));
      });
    });
  }

  private async sendResetPasswordEmail(email: string, resetToken: string) {
    try {
      const mailOptions = {
        from: EMAIL_ADDRESS,
        to: email,
        subject: 'Password Reset',
        text: `To reset your password, click the following link: <frontend prod endpoint>=${resetToken}`,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      throw new Error('Error sending password reset email ' + error);
    }
  }
}

export default AuthService;
