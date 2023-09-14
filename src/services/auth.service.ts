import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import mailer from '@clients/mailer.client';
import tenantsModel from '@models/tenants.model';
import userModel from '@models/users.model';
import { CreateUserDto, loginUserDto } from '@dtos/users.dto';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { GoogleUserDto } from '@dtos/gusers.dto';
import { HttpException } from '@exceptions/HttpException';
import { SECRET_KEY } from '@config';
import { Tenant } from '@interfaces/tenants.interface';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { logger } from '@utils/logger';

class AuthService {
  public users = userModel;
  public tenants = tenantsModel;
  public transporter = mailer;

  public async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findOne({ email });

    if (!user) {
      throw new HttpException(404, `User with email ${email} not found`);
    }

    // Generate a reset token (you should implement this)
    const resetToken = this.generateResetToken(); // Implement this function

    // Save the reset token and its expiration time in the user record
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 3600000); // Token expiration time (e.g., 1 hour)

    // Save the user record with the reset token
    this.users.findByIdAndUpdate(user._id, { user });

    // Send the password reset email (you should implement this)
    await this.sendResetPasswordEmail(user.email, resetToken); // Implement this function
  }

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    return await this.users.create({ ...userData, password: hashedPassword });
  }

  public async login(userData: loginUserDto | GoogleUserDto): Promise<{ cookie: string; findUser: User; tenantInfo: Tenant }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `Your email ${userData.email} is not found`);

    if (userData.hasOwnProperty('password')) {
      const isPasswordMatching: boolean = await compare((userData as loginUserDto).password, findUser.password);
      if (!isPasswordMatching) throw new HttpException(409, 'Your password is not matching');
    }

    const tenantInfo = await this.tenants.findOne({ email: userData.email });
    const tokenData = this.createToken(findUser, tenantInfo);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser, tenantInfo };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `Your email ${userData.email} is not found`);

    return findUser;
  }

  private createToken(user: User, tenantInfo: Tenant): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id, role: user.role, tenant: tenantInfo, email: user.email };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  private createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  private generateResetToken(length = 32) {
    return new Promise((resolve, reject) => {
      randomBytes(length, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          const token = buffer.toString('hex');
          resolve(token);
        }
      });
    });
  }

  private async sendResetPasswordEmail(email: string, resetToken: Promise<unknown>) {
    try {
      // Email content
      const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `To reset your password, click the following link: http://example.com/reset-password?token=${resetToken}`,
      };

      // Send the email
      await this.transporter.sendMail(mailOptions);

      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      throw new Error('Error sending password reset email');
    }
  }
}

export default AuthService;
