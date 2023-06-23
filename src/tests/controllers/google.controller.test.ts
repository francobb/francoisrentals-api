import axios from 'axios';
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.post.mockResolvedValue({});

import { NextFunction, Response } from 'express';
import GoogleController from '@controllers/google.controller';
import AuthService from '@services/auth.service';
import GoogleService from '@services/google.service';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { logger } from '@utils/logger';

describe('Google controller', function () {
  let mRes: Partial<Response>;
  let mReq;
  let mNext: NextFunction;
  let googleController: GoogleController;
  let mAuthService: AuthService;
  let mGoogleService: GoogleService;
  let userData: User;

  beforeAll(() => {
    mNext = jest.fn();
    mReq = { query: { code: 'fakeCode' } };
    mRes = {
      cookie: jest.fn(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    } as unknown as Partial<Response>;
    userData = {
      _id: 'fakeId',
      email: 'test@example.com',
      password: 'password',
    };
    googleController = new GoogleController();
    mAuthService = googleController.authService;
    mGoogleService = googleController.googleService;
    logger.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    // jest.restoreAllMocks();
  });

  describe('getAuthUrl()', function () {
    it('should redirect to Google auth URL', async () => {
      mGoogleService.getAuthUrl = jest
        .fn()
        .mockReturnValueOnce(
          'https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=openid%20email%20profile',
        );

      await googleController.getAuthUrl(mReq, mRes as Response, mNext);

      expect(mGoogleService.getAuthUrl).toHaveBeenCalled();
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.redirect).toHaveBeenCalledWith(
        'https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=openid%20email%20profile',
      );
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should call next with an error if getAuthUrl fails', async () => {
      const error = new Error('Failed to get Auth URI');

      mGoogleService.getAuthUrl = jest.fn().mockImplementationOnce(() => {
        throw error;
      });

      await googleController.getAuthUrl(mReq, mRes as Response, mNext);

      expect(mGoogleService.getAuthUrl).toHaveBeenCalled();
      expect(mRes.status).not.toHaveBeenCalled();
      expect(mRes.redirect).not.toHaveBeenCalled();
      expect(mNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getFilesFromDrive()', function () {
    it('should get files in g drive', async () => {
      mGoogleService.listDriveFiles = jest.fn().mockResolvedValueOnce(null);
      await googleController.getFilesFromDrive(mReq, mRes as Response, mNext);

      expect(mGoogleService.listDriveFiles).toHaveBeenCalled();
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mNext).not.toHaveBeenCalledWith({ message: 'ran get files from drive' });
    });

    it('should call next with an error if getAuthUrl fails', async () => {
      const error = new Error('Failed to get Auth URI');

      mGoogleService.listDriveFiles = jest.fn().mockRejectedValueOnce(error);

      await googleController.getFilesFromDrive(mReq, mRes as Response, mNext);

      expect(mGoogleService.listDriveFiles).toHaveBeenCalled();
      expect(mRes.status).not.toHaveBeenCalled();
      expect(mNext).toHaveBeenCalledWith(error);
    });
  });

  describe('googleOauthHandler()', function () {
    afterEach(() => {
      mReq.query.code = 'fakeCode';
    });

    it('should return a 401 error', async () => {
      mReq.query.code = '';

      await googleController.googleOauthHandler(mReq, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(new HttpException(401, 'Authorization code not provided!'));
    });

    it('should return an Error on failure to authenticate with Google', async () => {
      const err = new HttpException(400, "You're not userId");
      mGoogleService.authenticateWithGoogle = jest.fn().mockRejectedValueOnce(err);
      await googleController.googleOauthHandler(mReq, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });

    it('should return an Error on failure to get Google User', async () => {
      const err = new HttpException(403, "You're not user data");
      mGoogleService.authenticateWithGoogle = jest.fn().mockResolvedValueOnce({ cookie: '', findUser: userData });
      mGoogleService.authenticateWithGoogle = jest.fn().mockRejectedValueOnce(err);
      await googleController.googleOauthHandler(mReq, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });

    it('should return error if email is not verified by google', async () => {
      const err = new HttpException(400, "You're not user data");
      mGoogleService.authenticateWithGoogle = jest.fn().mockResolvedValueOnce({ id_token: '', access_token: '' });
      mGoogleService.getGoogleUser = jest.fn().mockResolvedValueOnce({ name: '', verified_email: false, email: '' });
      await googleController.googleOauthHandler(mReq, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(err);
    });

    it('should return error if email is not verified by auth service', async () => {
      const err = new HttpException(400, "You're not user data");
      mGoogleService.authenticateWithGoogle = jest.fn().mockResolvedValueOnce({ id_token: '', access_token: '' });
      mGoogleService.getGoogleUser = jest.fn().mockResolvedValueOnce({ name: '', verified_email: false, email: '' });
      mAuthService.login = jest.fn().mockRejectedValue(err);

      await googleController.googleOauthHandler(mReq, mRes as Response, mNext);

      expect(mRes.status).not.toHaveBeenCalled();
      expect(mRes.redirect).not.toHaveBeenCalled();
      expect(mNext).toHaveBeenCalledWith(err);
    });

    it('should return 200', async () => {
      //todo: cleanup overriding of mRes;
      mRes = {
        cookie: jest.fn(),
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Partial<Response>;
      const cookieVal = 'oediehohjeede343343hoee';
      const options = { sameSite: 'none', maxAge: 900000, httpOnly: true, secure: true, path: '/' };
      mGoogleService.authenticateWithGoogle = jest.fn().mockResolvedValueOnce({ id_token: '', access_token: '' });
      mGoogleService.getGoogleUser = jest.fn().mockResolvedValueOnce({ name: '', verified_email: true, email: '' });
      mAuthService.login = jest.fn().mockResolvedValueOnce({ cookie: `Authorization=${cookieVal}; `, findUser: userData });

      await googleController.googleOauthHandler(mReq, mRes as Response, mNext);
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.cookie).toHaveBeenCalledWith('Authorization', cookieVal, options);
      expect(mRes.json).toHaveBeenCalledWith({
        data: expect.any(Object),
        message: 'login',
      });
      expect(mNext).not.toHaveBeenCalled();
    });
  });
});
