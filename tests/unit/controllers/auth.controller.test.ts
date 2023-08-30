import AuthController from '@controllers/auth.controller';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { Response } from 'express';

describe('Auth Controller Unit Tests', function () {
  let err;
  let mNext;
  let mReq;
  let mRes;
  let mockAuthService;
  let subject;
  let userData;

  beforeAll(() => {
    err = new HttpException(404, 'Invalid Email');
    userData = {
      email: 'test@email.com',
      password: 'q1w2e3r4!',
    };
    mNext = jest.fn();
    mReq = { user: userData, body: userData };
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
      await subject.signUp(mReq, mRes, mNext);

      expect(mRes.status).toHaveBeenCalledWith(201);
      expect(mRes.json).toHaveBeenCalledWith({
        data: expect.any(Object),
        message: 'signup',
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not return 201', async () => {
      mockAuthService.signup = jest.fn().mockRejectedValue(err);
      await subject.signUp(mReq, expect.any(Object), mNext);

      expect(mNext).toHaveBeenCalledWith(err);
    });
  });

  describe('logIn()', () => {
    it('should log user in', async () => {
      mockAuthService.login = jest.fn().mockReturnValue({ cookie: 'oihoihow', findUser: userData, tenantInfo: {} });
      await subject.logIn(mReq, mRes, mNext);

      expect(mRes.setHeader).toHaveBeenCalledWith('Set-Cookie', ['oihoihow']);
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        cookie: 'oihoihow',
        tenantInfo: {},
        message: 'accessToken',
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not log user in', async () => {
      mockAuthService.login = jest.fn().mockRejectedValue(err);

      await subject.logIn(mReq, mRes, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });
  });

  describe('logOut()', () => {
    it('should log user out', async () => {
      mReq.user = {
        _id: 'string',
        email: 'string',
        password: 'string',
      } as Partial<RequestWithUser>;

      mockAuthService.logout = jest.fn().mockResolvedValue(userData);
      await subject.logOut(mReq as RequestWithUser, mRes as Response, mNext);

      expect(mRes.setHeader).toHaveBeenCalledWith('Set-Cookie', ['Authorization=; Max-age=0']);
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        message: 'logged out',
      });
      expect(mNext).not.toHaveBeenCalled();
    });
  });
});
