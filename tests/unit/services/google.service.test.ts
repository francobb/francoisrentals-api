import axios from 'axios';
import { Credentials } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';
import GoogleService from '@services/google.service';
import { GoogleUserResult } from '@utils/interfaces';
import { HttpException } from '@exceptions/HttpException';
import GoogleClient from '@clients/gauth.client';

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));
jest.mock('googleapis');
jest.mock('@utils/logger');

describe('Google Service', function () {
  let googleService: GoogleService;
  let mGoogleRepository;
  let mOauthClient;
  let tokenData;

  beforeAll(() => {
    googleService = new GoogleService();
    mGoogleRepository = googleService.googleUser;
    mOauthClient = googleService.oauthClient;
    tokenData = { id_token: 'string', access_token: 'string' };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getAuthUrl()', () => {
    it('should return a url', function () {
      jest.spyOn(GoogleClient, 'generateAuthURL').mockResolvedValue('');
      googleService.getAuthUrl();
      expect(GoogleClient.generateAuthURL).toHaveBeenCalledTimes(1);
    });
  });

  describe('getGoogleUser()', function () {
    it('should return google user data', async () => {
      const googleUserData = {
        id: 'string',
        email: 'string',
        verified_email: false,
        name: 'string',
        given_name: 'string',
        family_name: 'string',
        picture: 'string',
        locale: 'string',
      };
      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: googleUserData as GoogleUserResult,
      });
      const result = await googleService.getGoogleUser(tokenData);
      expect(result).toEqual(googleUserData);
    });
    it('should not return data', async () => {
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new HttpException(404, 'Error getting google user'));
      await expect(googleService.getGoogleUser(tokenData)).rejects.toThrow(new HttpException(404, 'Error getting google user'));
    });
  });

  describe('authenticateWithGoogle()', function () {
    let fakeCode;
    let credentialData;

    beforeAll(() => {
      fakeCode = 'fakeCode';
      credentialData = {
        toObject: () =>
          ({
            refresh_token: 'fakeRefreshToken',
            expiry_date: 1234,
            access_token: 'fakeAccessToken',
            token_type: 'fakeTokenType',
            id_token: 'fakeId_token',
            scope: 'fakeScope',
          }) as Credentials,
      };
    });

    it('should authenticate existing user with google without expiring token', async () => {
      jest.spyOn(mOauthClient, 'setCredentials').mockReturnValueOnce(null);
      mGoogleRepository.findOne = jest.fn().mockResolvedValueOnce(credentialData);
      mOauthClient.isTokenExpiring = jest.fn().mockReturnValueOnce(false);

      const result = await googleService.authenticateWithGoogle(fakeCode);
      expect(result).toEqual(credentialData);
    });

    it('should authenticate existing user with google with expiring token', async () => {
      jest.spyOn(mOauthClient, 'setCredentials').mockReturnValueOnce(null);
      mGoogleRepository.findOne = jest.fn().mockResolvedValueOnce(credentialData);
      mOauthClient.isTokenExpiring = jest.fn().mockReturnValueOnce(true);
      mOauthClient.credentials = { refresh_token: 'fakeToken' };
      mOauthClient.refreshToken = jest.fn().mockResolvedValueOnce({
        tokens: credentialData.toObject(),
        res: {} as GaxiosResponse,
      });

      mGoogleRepository.updateOne = jest.fn();

      const result = await googleService.authenticateWithGoogle(fakeCode);
      expect(result).toEqual(credentialData.toObject());
      expect(mOauthClient.setCredentials).toHaveBeenCalledWith(credentialData.toObject());
    });

    it('should authenticate new user with google without expiring token', async () => {
      jest.spyOn(mOauthClient, 'setCredentials').mockReturnValueOnce(null);
      mGoogleRepository.findOne = jest.fn().mockResolvedValueOnce(null);
      mOauthClient.getToken = jest.fn().mockResolvedValueOnce({
        tokens: credentialData.toObject(),
        res: {} as GaxiosResponse,
      });
      mGoogleRepository.create = jest.fn().mockResolvedValueOnce({
        save: jest.fn().mockResolvedValueOnce(null),
      });
      mOauthClient.isTokenExpiring = jest.fn().mockReturnValueOnce(false);

      const result = await googleService.authenticateWithGoogle(fakeCode);
      expect(result).toEqual(credentialData.toObject());
      expect(mOauthClient.setCredentials).toHaveBeenCalledWith(credentialData.toObject());
    });
  });
});
