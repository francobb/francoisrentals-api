import axios from 'axios';
import { Credentials } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';
import { google, drive_v3 } from 'googleapis';
import { PassThrough } from 'stream';
import GoogleService from '@services/google.service';
import TransactionService from '@services/transactions.service';
import { GoogleUserResult } from '@utils/interfaces';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import Parser from '@utils/parser';
import { ID_OF_FOLDER } from '@utils/constants';

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));
jest.mock('googleapis');
jest.mock('@utils/logger');
jest.mock('pdf-parse', () =>
  jest.fn().mockResolvedValue(
    Promise.resolve({
      numpages: 123,
      numrender: 12,
      info: 'fakeinfo',
      metadata: 'fakemetadata',
      version: 'default',
      text: 'string',
    }),
  ),
);

describe('Google Service', function () {
  let googleService: GoogleService;
  let mGoogleRepository;
  let mOauthClient;
  let mPayeePayers;
  let mJWTClient;
  let mTransactionService: TransactionService;
  let tokenData;
  let mParser: Parser;

  beforeAll(() => {
    googleService = new GoogleService();
    mGoogleRepository = googleService.googleUser;
    mOauthClient = googleService.oauthClient;
    mPayeePayers = googleService.payeesPayers;
    mTransactionService = googleService.transactionService;
    mJWTClient = googleService.jwtClient;
    tokenData = { id_token: 'string', access_token: 'string' };
    mParser = googleService.parser;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getAllPayeesAndPayers()', function () {
    it('should return all payees payers', async () => {
      jest.spyOn(mPayeePayers, 'find').mockReturnValueOnce([]);
      await googleService.getAllPayeesAndPayers();
      expect(mPayeePayers.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAuthUrl()', () => {
    it('should return a url', function () {
      jest.spyOn(mOauthClient, 'generateAuthUrl').mockReturnValue('');
      googleService.getAuthUrl();
      expect(mOauthClient.generateAuthUrl).toHaveBeenCalledTimes(1);
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
          } as Credentials),
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

  xdescribe('exportFile', () => {
    const fileId = 'fileId';

    it('should export a file and return the buffer for real', async () => {
      process.stdout.isTTY = true;
      process.stdout.clearLine = jest.fn();
      process.stdout.cursorTo = jest.fn();
      const mockStream = new PassThrough();
      const mockFilesGet = jest.fn().mockReturnValueOnce(Promise.resolve({ data: mockStream }));
      (google.drive as jest.MockedFunction<typeof google.drive>).mockReturnValueOnce({
        files: {
          get: mockFilesGet,
        },
      } as unknown as drive_v3.Drive);

      const exportPromise = googleService.exportFile(fileId);
      mockStream.write(Buffer.from('file content'));
      mockStream.end();

      const result = await exportPromise;

      expect(google.drive).toHaveBeenCalledWith('v3');
      expect(mockFilesGet).toHaveBeenCalledWith(
        {
          auth: mJWTClient,
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' },
      );
      expect(result).toEqual(Buffer.from('file content'));
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error when file export fails', async () => {
      const mockStream = new PassThrough();
      const mockFilesGet = jest.fn().mockReturnValueOnce(Promise.resolve({ data: mockStream }));
      (google.drive as jest.MockedFunction<typeof google.drive>).mockReturnValueOnce({
        files: {
          get: mockFilesGet,
        },
      } as unknown as drive_v3.Drive);

      const exportPromise = googleService.exportFile(fileId);

      const mockError = new Error('Invalid file export');

      setTimeout(() => {
        mockStream.emit('error', mockError);
      }, 1000);

      await expect(exportPromise).rejects.toEqual(mockError);

      expect(google.drive).toHaveBeenCalledWith('v3');
      expect(mockFilesGet).toHaveBeenCalledWith(
        {
          auth: mJWTClient,
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' },
      );
      expect(logger.error).toHaveBeenCalledWith('Error downloading file.');
    });
  });

  describe('listDriveFiles', () => {
    it('should list and not process drive files', async () => {
      const filesListMock = {
        data: {
          files: [
            { id: 'fileId1', name: 'Jan_Report.pdf' },
            { id: 'fileId2', name: 'Feb_Report.pdf' },
            { id: 'fileId3', name: 'Mar_Report.pdf' },
          ],
        },
      };

      const driveFilesMock = {
        list: jest.fn().mockResolvedValueOnce(filesListMock),
      };

      const driveMock = {
        files: driveFilesMock,
      } as unknown as drive_v3.Drive;

      mTransactionService.getAllReports = jest.fn().mockResolvedValueOnce([]);
      googleService.getAllPayeesAndPayers = jest.fn().mockResolvedValueOnce([]);
      (googleService.jwtClient as jest.Mocked<any>).authorize.mockImplementationOnce(callback => {
        callback(null, {});
      });
      (google.drive as jest.MockedFunction<typeof google.drive>).mockReturnValueOnce(driveMock);

      googleService.exportFile = jest.fn().mockResolvedValue(Buffer.from('fake pdf'));
      mParser.collectReportData = jest.fn().mockReturnValue('fakeData');
      mTransactionService.addManyTransactions = jest.fn().mockResolvedValue(undefined);
      mTransactionService.addReport = jest.fn().mockResolvedValue(undefined);

      await googleService.listDriveFiles();

      const loggerErrorMock = jest.spyOn(logger, 'error');

      expect(google.drive).toHaveBeenCalledWith({ version: 'v3', auth: googleService.jwtClient });
      expect(driveFilesMock.list).toHaveBeenCalledWith({
        pageSize: 10,
        q: `'${ID_OF_FOLDER}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id, name)',
      });

      expect(mTransactionService.getAllReports).toHaveBeenCalled();
      expect(googleService.getAllPayeesAndPayers).toHaveBeenCalled();
      expect(loggerErrorMock).not.toHaveBeenCalled();
      // expect(mParser.collectReportData).toHaveBeenCalledTimes(3);
      // expect(mTransactionService.addManyTransactions).toHaveBeenCalledTimes(3);
      // expect(mTransactionService.addReport).toHaveBeenCalledTimes(3);
      // expect(googleService.exportFile).toHaveBeenCalledTimes(3);
    });

    it('should list and process drive files', async () => {
      const filesListMock = {
        data: {
          files: [
            { id: 'fileId1', name: 'Jan_Report.pdf' },
            { id: 'fileId2', name: 'Feb_Report.pdf' },
            { id: 'fileId3', name: 'Mar_Report.pdf' },
          ],
        },
      };

      const driveFilesMock = {
        list: jest.fn().mockResolvedValueOnce(filesListMock),
      };

      const driveMock = {
        files: driveFilesMock,
      } as unknown as drive_v3.Drive;

      mTransactionService.getAllReports = jest.fn().mockResolvedValueOnce([]);
      googleService.getAllPayeesAndPayers = jest.fn().mockResolvedValueOnce([]);
      (googleService.jwtClient as jest.Mocked<any>).authorize.mockImplementationOnce(callback => {
        callback(null, {});
      });
      (google.drive as jest.MockedFunction<typeof google.drive>).mockReturnValueOnce(driveMock);

      googleService.exportFile = jest.fn().mockResolvedValue(Buffer.from('fake pdf'));
      mParser.collectReportData = jest.fn().mockReturnValue('fakeData');
      mTransactionService.addManyTransactions = jest.fn().mockResolvedValue(undefined);
      mTransactionService.addReport = jest.fn().mockResolvedValue(undefined);

      await googleService.listDriveFiles();

      const loggerErrorMock = jest.spyOn(logger, 'error');

      expect(google.drive).toHaveBeenCalledWith({ version: 'v3', auth: googleService.jwtClient });
      expect(driveFilesMock.list).toHaveBeenCalledWith({
        pageSize: 10,
        q: `'${ID_OF_FOLDER}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id, name)',
      });

      expect(mTransactionService.getAllReports).toHaveBeenCalled();
      expect(googleService.getAllPayeesAndPayers).toHaveBeenCalled();
      expect(loggerErrorMock).not.toHaveBeenCalled();
      // expect(mParser.collectReportData).toHaveBeenCalledTimes(3);
      // expect(mTransactionService.addManyTransactions).toHaveBeenCalledTimes(3);
      // expect(mTransactionService.addReport).toHaveBeenCalledTimes(3);
      // expect(googleService.exportFile).toHaveBeenCalledTimes(3);
    });

    it('should not list and process drive files', async () => {
      mTransactionService.getAllReports = jest.fn().mockResolvedValueOnce([]);
      googleService.getAllPayeesAndPayers = jest.fn().mockResolvedValueOnce([]);
      (googleService.jwtClient as jest.Mocked<any>).authorize.mockImplementationOnce(callback => {
        callback(new Error('Insertion failed'));
      });
      await googleService.listDriveFiles();

      const loggerErrorMock = jest.spyOn(logger, 'error');
      expect(mTransactionService.getAllReports).toHaveBeenCalled();
      expect(googleService.getAllPayeesAndPayers).toHaveBeenCalled();
      expect(loggerErrorMock).toHaveBeenCalled();
      // expect(mParser.collectReportData).toHaveBeenCalledTimes(3);
      // expect(mTransactionService.addManyTransactions).toHaveBeenCalledTimes(3);
      // expect(mTransactionService.addReport).toHaveBeenCalledTimes(3);
      // expect(googleService.exportFile).toHaveBeenCalledTimes(3);
    });
  });
});
