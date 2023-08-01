import AuthService from '@services/auth.service';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { auth } from 'google-auth-library';
import { CreateTenantDto } from '@dtos/tenants.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository;
  let mockTenantRepository;
  let userData: CreateUserDto;
  let tenantData: CreateTenantDto;

  beforeAll(() => {
    authService = new AuthService();
    mockTenantRepository = authService.tenants;
    mockUserRepository = authService.users;
    userData = {
      email: 'test@example.com',
      password: 'password',
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
  });
});
