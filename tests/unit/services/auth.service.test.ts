import AuthService from '@services/auth.service';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@models/user.pg_model'; // CORRECTED: Import TypeORM User model
import { CreateTenantDto } from '@dtos/tenants.dto';
import { Transporter } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: Repository<User>;
  let mockTenantRepository;
  let mockTransporter: Transporter<SentMessageInfo>;
  let userData: CreateUserDto;
  let tenantData: CreateTenantDto;
  let userModel: User;

  beforeAll(() => {
    authService = new AuthService();
    mockTenantRepository = authService.tenants;
    // CORRECTED: Reference the TypeORM repository
    mockUserRepository = authService.userRepository;
    mockTransporter = authService.transporter;

    userData = {
      email: 'test@example.com',
      password: 'password',
      name: 'Bill',
      role: 'ADMIN',
    };

    userModel = {
      id: 'user_id',
      email: 'test@example.com',
      password: 'password',
      name: 'Bill',
      role: 'ADMIN',
    };

    tenantData = {
      email: 'j@j.com',
      lease_to: new Date().toISOString(),
      move_in: new Date().toISOString(),
      name: 'fakeTenant',
      phone: ['12121212'],
      property: 'fakeProperty',
      rentalAmount: 1000,
      rentalBalance: 0,
      unit: 'fakeunit',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('signup', () => {
    it('should throw an error if userData is empty', async () => {
      await expect(authService.signup({} as CreateUserDto)).rejects.toThrow(HttpException);
    });

    it('should throw an error if the email already exists', async () => {
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(userModel);
      await expect(authService.signup(userData)).rejects.toThrow(HttpException);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: userData.email });
    });

    it('should create a new user', async () => {
      const hashedPassword = 'hashedpassword';
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(mockUserRepository, 'create').mockReturnValue(userModel);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue({ ...userModel, password: hashedPassword });
      // CORRECTED: Use mockImplementation for type safety
      jest.spyOn(bcrypt, 'hash').mockImplementation((): Promise<string> => Promise.resolve(hashedPassword));

      const result = await authService.signup(userData);

      expect(result).toEqual({ ...userModel, password: hashedPassword });
      expect(mockUserRepository.create).toHaveBeenCalledWith({ ...userData, password: hashedPassword });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    });
  });

  describe('login', () => {
    it('should throw an error if userData is empty', async () => {
      await expect(authService.login({} as CreateUserDto)).rejects.toThrow(HttpException);
    });

    it('should throw an error if the email is not found', async () => {
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(null);
      await expect(authService.login(userData)).rejects.toThrow(HttpException);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: userData.email });
    });

    it('should return a cookie and findUser for valid credentials', async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      const findTenant = jest.spyOn(mockTenantRepository, 'findOne').mockResolvedValue(tenantData);
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(userModel);
      const result = await authService.login(userData as CreateUserDto);

      expect(result).toEqual({ cookie: expect.any(String), findUser: userModel, tenantInfo: tenantData });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: userData.email });
      expect(findTenant).toHaveBeenCalledWith({ email: userData.email });
    });

    it('should throw an error for invalid credentials', async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(userModel);
      await expect(authService.login(userData)).rejects.toThrow(HttpException);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: userData.email });
    });
  });

  describe('logout', () => {
    it('should throw an error if userData is empty', async () => {
      await expect(authService.logout({} as User)).rejects.toThrow(HttpException);
    });

    it('should log user out', async () => {
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(userModel);
      const result = await authService.logout(userModel);
      expect(result).toEqual(userModel);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: userModel.email, password: userModel.password });
    });

    it('should not log user out if user not found', async () => {
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(null);
      await expect(authService.logout(userModel)).rejects.toThrow(new HttpException(409, `Your email ${userModel.email} is not found`));
    });
  });

  describe('forgotPassword', () => {
    it('should throw an error if the user does not exist', async () => {
      const email = 'nonexistent@example.com';
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(null);
      await expect(authService.forgotPassword(email)).rejects.toThrow(HttpException);
    });

    it('should generate a reset token and save it to the user', async () => {
      const email = 'test@example.com';
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(userModel);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(userModel);
      const mockNodeMailer = jest.spyOn(mockTransporter, 'sendMail').mockResolvedValue(undefined);

      await authService.forgotPassword(email);

      expect(mockNodeMailer).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user_id',
          email: 'test@example.com',
          resetToken: expect.any(String),
          resetTokenExpires: expect.any(Date),
        }),
      );
    });

    it('should throw an error if sending the email fails', async () => {
      const email = 'test@example.com';
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(userModel);
      const mockError = new Error('Failed');
      jest.spyOn(mockTransporter, 'sendMail').mockRejectedValue(mockError);

      await expect(authService.forgotPassword(email)).rejects.toThrowError(new Error('Error sending password reset email ' + mockError));
    });
  });
});
