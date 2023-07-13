import { Request, Response, NextFunction } from 'express';
import UsersController from '@controllers/users.controller';
import UserService from '@services/users.service';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import { HttpException } from '@exceptions/HttpException';
import { CreateUserDto } from '@dtos/users.dto';

describe('UsersController', () => {
  const mNext: NextFunction = jest.fn();
  let err: HttpException;
  let mReq: Partial<Request>;
  let mRes: Partial<Response>;
  let mockUserService: UserService;
  let userData: CreateUserDto;
  let usersController: UsersController;

  beforeEach(() => {
    userData = {
      email: 'fakeEmail',
      password: 'password',
    };
    err = new HttpException(404, 'Invalid Email');
    usersController = new UsersController();
    mockUserService = usersController.userService;
    mReq = {
      params: {
        id: '123',
      },
      body: userData,
    };
    mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUserById()', () => {
    it('should get user by id', async () => {
      const user: User = {
        _id: '123',
        email: 'test@example.com',
        password: 'password',
      };
      jest.spyOn(usersController.userService, 'findUserById').mockResolvedValueOnce(user);

      await usersController.getUserById(mReq as Request, mRes as Response, mNext);

      expect(usersController.userService.findUserById).toHaveBeenCalledWith('123');
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        data: user,
        message: 'findOne',
      });
    });

    it('should call next with an error if an exception is thrown', async () => {
      jest.spyOn(mockUserService, 'findUserById').mockRejectedValueOnce(new Error('Test Error'));
      usersController.userService.findUserById = jest.fn().mockRejectedValueOnce(new Error('Test Error'));

      await usersController.getUserById(mReq as Request, mRes as Response, mNext);

      expect(usersController.userService.findUserById).toHaveBeenCalledWith('123');
      expect(mNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getUsers()', () => {
    it('should return 200', async () => {
      mockUserService.findAllUsers = jest.fn().mockResolvedValue([]);
      await usersController.getUsers(mReq as RequestWithUser, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        data: expect.any(Object),
        message: 'findAll',
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not return 200', async () => {
      mockUserService.findAllUsers = jest.fn().mockRejectedValue(err);
      await usersController.getUsers(mReq as RequestWithUser, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });
  });

  describe('createUser()', () => {
    it('should create a new user', async () => {
      jest.spyOn(mockUserService, 'createUser').mockResolvedValue({ _id: 'fakeId', ...userData });

      await usersController.createUser(mReq as RequestWithUser, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(201);
      expect(mRes.json).toHaveBeenCalledWith({ data: { _id: 'fakeId', ...userData }, message: 'created' });
    });

    it('should not create a new user', async () => {
      mockUserService.createUser = jest.fn().mockRejectedValue(err);
      await usersController.createUser(mReq as RequestWithUser, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });
  });

  describe('updateUser()', () => {
    it('should update user', async () => {
      jest.spyOn(mockUserService, 'updateUser').mockResolvedValue({ _id: 'fakeId', ...userData });

      await usersController.updateUser(mReq as RequestWithUser, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({ data: { _id: 'fakeId', ...userData }, message: 'updated' });
    });

    it('should not update a user', async () => {
      mockUserService.updateUser = jest.fn().mockRejectedValue(err);
      await usersController.updateUser(mReq as RequestWithUser, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });
  });

  describe('deleteUser()', () => {
    it('should delete user', async () => {
      jest.spyOn(mockUserService, 'deleteUser').mockResolvedValue({ _id: 'fakeId', ...userData });

      await usersController.deleteUser(mReq as RequestWithUser, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(204);
      expect(mRes.json).toHaveBeenCalledWith({ data: { _id: 'fakeId', ...userData }, message: 'deleted' });
    });

    it('should not update a user', async () => {
      mockUserService.deleteUser = jest.fn().mockRejectedValue(err);
      await usersController.deleteUser(mReq as RequestWithUser, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });
  });
});
