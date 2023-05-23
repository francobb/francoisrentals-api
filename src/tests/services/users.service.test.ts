import UsersService from '@services/users.service';
import UserService from '@services/users.service';
import { User } from '@interfaces/users.interface';
import { HttpException } from '@exceptions/HttpException';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';

describe('UsersService', () => {
  let mockUserRepository;
  let userData: User;
  let createUser: CreateUserDto;
  let usersService: UsersService;

  beforeAll(() => {
    usersService = new UserService();
    mockUserRepository = usersService.users;
    userData = {
      _id: 'fakeId',
      email: 'test@example.com',
      password: 'password',
    };
    createUser = {
      email: 'test@example.com',
      password: 'password',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      mockUserRepository.find = jest.fn().mockResolvedValue([userData]);
      const result = await usersService.findAllUsers();
      expect(result.length).toEqual(1);
    });
  });

  describe('findUserById', () => {
    it('should not return a user when id is empty', async () => {
      await expect(usersService.findUserById('')).rejects.toThrow(HttpException);
    });

    it('should not return a user if id does not exist', async () => {
      mockUserRepository.findOne = jest.fn().mockResolvedValue(null);
      const result = usersService.findUserById('fakeId');
      await expect(result).rejects.toThrow(HttpException);
    });

    it('should return a user by id', async () => {
      mockUserRepository.findOne = jest.fn().mockResolvedValue(userData);
      const result = await usersService.findUserById('fakeId');
      expect(result.email).toEqual(userData.email);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(mockUserRepository, 'create').mockResolvedValueOnce(userData);
      bcrypt.hash = jest.fn().mockResolvedValueOnce('hashedPassword');

      const result = await usersService.createUser(createUser);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: createUser.email });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUser,
        password: 'hashedPassword',
      });
      expect(result).toEqual(userData);
    });

    it('should throw an error if the user already exists', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(userData);

      await expect(usersService.createUser(createUser)).rejects.toThrowError(
        new HttpException(409, `You're email ${createUser.email} already exists`),
      );
    });

    it('should throw an error if userData is empty', async () => {
      await expect(usersService.createUser({} as CreateUserDto)).rejects.toThrowError(new HttpException(400, "You're not userData"));
    });
  });

  describe('updateUser', () => {
    const userId = 'fakeId';

    it('should update an existing user', async () => {
      mockUserRepository.findOne = jest.fn().mockResolvedValueOnce(userData);
      mockUserRepository.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(userData);
      bcrypt.hash = jest.fn().mockResolvedValueOnce('hashedPassword');

      const result = await usersService.updateUser(userId, { password: 'hashedPassword', ...createUser });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(result).toEqual(userData);
    });

    it('should not recognize user', async () => {
      mockUserRepository.findOne = jest.fn().mockResolvedValueOnce(userData);
      mockUserRepository.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);
      bcrypt.hash = jest.fn().mockResolvedValueOnce('hashedPassword');

      await expect(usersService.updateUser(userId, { password: 'hashedPassword', ...createUser })).rejects.toThrow(
        new HttpException(409, "You're not user"),
      );
    });

    it('should throw an error if the email already exists for another user', async () => {
      const existingUser = { ...userData, email: userData.email, _id: '456' };
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);

      await expect(usersService.updateUser(userId, userData)).rejects.toThrowError(
        new HttpException(409, `You're email ${userData.email} already exists`),
      );
    });

    it('should throw an error if userData is empty', async () => {
      await expect(usersService.updateUser(userId, {} as CreateUserDto)).rejects.toThrowError(new HttpException(400, "You're not userData"));
    });
  });

  describe('deleteUser', () => {
    const userId = '123';

    it('should delete an existing user', async () => {
      const deletedUser = { ...userData, _id: userId };
      mockUserRepository.findByIdAndDelete = jest.fn().mockResolvedValueOnce(deletedUser);

      const result = await usersService.deleteUser(userId);

      expect(mockUserRepository.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(deletedUser);
    });

    it('should throw an error if user does not exist', async () => {
      mockUserRepository.findByIdAndDelete = jest.fn().mockResolvedValueOnce(undefined);

      await expect(usersService.deleteUser(userId)).rejects.toThrowError(new HttpException(409, "You're not user"));
    });
  });
});
