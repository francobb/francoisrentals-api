import AuthService from '@services/auth.service';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { CreateTenantDto } from '@dtos/tenants.dto';
import { Transporter } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository;
  let mockTenantRepository;
  let mockTransporter: Transporter<SentMessageInfo>;
  let userData: CreateUserDto;
  let tenantData: CreateTenantDto;

  beforeAll(() => {
    authService = new AuthService();
    mockTenantRepository = authService.tenants;
    mockUserRepository = authService.users;
    mockTransporter = authService.transporter;
    userData = {
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
      const findUserByEmail = jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(userData as User);

      await expect(authService.signup(userData)).rejects.toThrow(HttpException);

      expect(findUserByEmail).toHaveBeenCalledWith({ email: userData.email });
    });

    it('should create a new user', async () => {
      const hashedPassword = 'hashedpassword';
      const createUser = jest.spyOn(mockUserRepository, 'create').mockResolvedValue({ ...userData, password: hashedPassword } as User);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const hash = jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const result = await authService.signup(userData);

      expect(result).toEqual({ ...userData, password: hashedPassword });
      expect(createUser).toHaveBeenCalledWith({ ...userData, password: hashedPassword });
      expect(hash).toHaveBeenCalledWith(userData.password, 10);
    });
  });

  describe('login', () => {
    it('should throw an error if userData is empty', async () => {
      await expect(authService.login({} as CreateUserDto)).rejects.toThrow(HttpException);
    });

    it('should throw an error if the email is not found', async () => {
      const findUserByEmail = jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(undefined);

      await expect(authService.login(userData)).rejects.toThrow(HttpException);

      expect(findUserByEmail).toHaveBeenCalledWith({ email: userData.email });
    });

    it('should return a cookie and findUser for valid credentials', async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      const findTenant = jest.spyOn(mockTenantRepository, 'findOne').mockResolvedValue(tenantData);
      const findUserByEmail = jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(userData);
      const result = await authService.login(userData as CreateUserDto);

      expect(result).toEqual({ cookie: expect.any(String), findUser: userData, tenantInfo: tenantData });
      expect(findUserByEmail).toHaveBeenCalledWith({ email: userData.email });
      expect(findTenant).toHaveBeenCalledWith({ email: userData.email });
    });

    it('should not return a cookie and findUser for valid credentials', async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      // const findTenant = jest.spyOn(mockTenantRepository, 'findOne').mockResolvedValue(tenantData);
      const findUserByEmail = jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(userData);
      // const result = await authService.login(userData as CreateUserDto);

      await expect(authService.login(userData)).rejects.toThrow(HttpException);
      expect(findUserByEmail).toHaveBeenCalledWith({ email: userData.email });
      // expect(findTenant).toHaveBeenCalledWith({ email: userData.email });
    });
  });

  describe('logout', () => {
    it('should throw an error if userData is empty', async () => {
      await expect(authService.logout({} as User)).rejects.toThrow(HttpException);
    });

    it('should log user out', async () => {
      const findUserByEmail = jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(userData);
      const result = await authService.logout({
        _id: expect.any(String),
        ...userData,
      });

      expect(result).toEqual(userData);
      expect(findUserByEmail).toHaveBeenCalledWith({ email: userData.email, password: userData.password });
    });

    it('should not log user out', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(undefined);

      await expect(authService.logout({ _id: expect.any(String), ...userData })).rejects.toThrow(
        new Error('Your email test@example.com is not found'),
      );
    });
  });

  describe('forgotPassword', () => {
    it('should throw an error if the user with the given email does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      // Mock the findOne method to return undefined, simulating a user not found scenario
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(undefined);

      // Act and Assert
      await expect(authService.forgotPassword(email)).rejects.toThrow(HttpException);
    });

    it('should generate a reset token and save it to the user', async () => {
      // Arrange
      const email = 'test@example.com';
      const user: User = {
        name: 'Jimmy',
        password: 'fakePassword',
        role: 'ADMIN',
        _id: 'user_id',
        email,
      };

      // Mock the findOne method to return the user
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);

      const mockNodeMailer = jest.spyOn(mockTransporter, 'sendMail').mockResolvedValue(undefined);

      // Mock the findByIdAndUpdate method to verify that it is called correctly
      const mockUpdateUser = jest.fn().mockResolvedValue(user);
      jest.spyOn(mockUserRepository, 'findByIdAndUpdate').mockImplementation(mockUpdateUser);

      // Act
      await authService.forgotPassword(email);

      // Assert
      expect(mockNodeMailer).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith(user._id, {
        user: {
          _id: 'user_id',
          email: 'test@example.com',
          name: 'Jimmy',
          password: 'fakePassword',
          resetToken: expect.any(Promise),
          resetTokenExpires: expect.any(Date),
          role: 'ADMIN',
        },
      });
    });

    it('should not send the password reset email', async () => {
      const email = 'test@example.com';
      const user: User = {
        name: 'Jimmy',
        password: 'fakePassword',
        role: 'ADMIN',
        _id: 'user_id',
        email,
      };

      // Mock the findOne method to return the user
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      const mockError = new Error('Failed');
      jest.spyOn(mockTransporter, 'sendMail').mockRejectedValue(mockError);

      // Act & Assert
      // CORRECTED: The test now expects the more detailed error message.
      await expect(authService.forgotPassword(email)).rejects.toThrowError(new Error('Error sending password reset email ' + mockError));
    });
  });
});
