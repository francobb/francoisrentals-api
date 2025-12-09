import AuthController from '@controllers/auth.controller';
import { HttpException } from '@exceptions/HttpException';
import { Request, Response } from 'express';
import AuthService from '../../../src/services/auth.service';
import { CreateUserDto } from '../../../src/dtos/users.dto';

describe('Auth Controller Unit Tests', function () {
  let err: HttpException;
  let mNext: jest.Mock;
  let mReq: Partial<Request<any, Record<string, any>>>;
  let mRes: Partial<Response<any, Record<string, any>>>;
  let mockAuthService: AuthService;
  let subject: AuthController;
  let userData: CreateUserDto;

  beforeAll(() => {
    err = new HttpException(404, 'Invalid Email');
    userData = {
      email: 'test@email.com',
      password: 'q1w2e3r4!',
      name: 'auth controller name',
      role: 'ADMIN',
    };
    mNext = jest.fn();
    mReq = { body: userData };
    mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Partial<Response>;

    subject = new AuthController();
    mockAuthService = subject.authService;
  });

  afterEach(() => jest.clearAllMocks());

  describe('signUp()', function () {
    it('should return 201', async () => {
      mockAuthService.signup = jest.fn().mockResolvedValue({});
      await subject.signUp(mReq as Request, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(201);
      expect(mRes.json).toHaveBeenCalledWith({
        data: expect.any(Object),
        message: 'signup',
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not return 201', async () => {
      mockAuthService.signup = jest.fn().mockRejectedValue(err);
      await subject.signUp(<Request>mReq, expect.any(Object), mNext);

      expect(mNext).toHaveBeenCalledWith(err);
    });
  });

  describe('logIn()', () => {
    it('should log user in', async () => {
      mockAuthService.login = jest.fn().mockReturnValue({ cookie: 'oihoihow', findUser: userData, tenantInfo: {} });
      await subject.logIn(<Request>mReq, <Response>mRes, mNext);

      expect(mRes.setHeader).toHaveBeenCalledWith('Set-Cookie', ['oihoihow']);
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        cookie: 'oihoihow',
        tenantInfo: {},
        user: userData,
        message: 'accessToken',
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not log user in', async () => {
      mockAuthService.login = jest.fn().mockRejectedValue(err);

      await subject.logIn(<Request>mReq, <Response>mRes, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });
  });

  describe('logOut()', () => {
    it('should log user out', async () => {
      mockAuthService.logout = jest.fn().mockResolvedValue(userData);
      // CORRECTED: The mNext argument is removed.
      await subject.logOut(mReq as Request, mRes as Response);

      expect(mRes.setHeader).toHaveBeenCalledWith('Set-Cookie', ['Authorization=; Max-age=0']);
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        message: 'logged out',
      });
      expect(mNext).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword()', () => {
    it('should send a successful password reset email', async () => {
      // Arrange
      const email = 'test@email.com';
      mReq.body.email = email;

      // Mock the authService to resolve successfully
      mockAuthService.forgotPassword = jest.fn().mockResolvedValue(undefined);

      // Act
      await subject.forgotPassword(<Request>mReq, <Response>mRes, mNext);

      // Assert
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({ message: 'Password reset email sent successfully' });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should handle an error when sending a password reset email fails', async () => {
      // Arrange
      const email = 'invalid@email.com';
      mReq.body.email = email;

      // Mock the authService to reject with an error
      const error = new HttpException(500, 'Email sending failed');
      mockAuthService.forgotPassword = jest.fn().mockRejectedValue(error);

      // Act
      await subject.forgotPassword(<Request>mReq, <Response>mRes, mNext);

      // Assert
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
      expect(mNext).toHaveBeenCalledWith(error);
      expect(mRes.status).not.toHaveBeenCalled(); // Response status should not be called in case of an error
      expect(mRes.json).not.toHaveBeenCalled(); // Response json should not be called in case of an error
    });
  });
});
