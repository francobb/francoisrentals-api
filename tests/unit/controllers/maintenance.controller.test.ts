import { NextFunction, Request, Response } from 'express';
import { PutObjectCommand, S3Client, ServiceInputTypes, ServiceOutputTypes } from '@aws-sdk/client-s3';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { SmithyResolvedConfiguration } from '@smithy/smithy-client';
import { HttpHandlerOptions } from '@smithy/types';
import MaintenanceController from '@controllers/maintenance.controller';
import { MaintenanceRequestDto } from '@dtos/request.dto';
import MaintenanceService from '@services/maintenance.service';
import { MaintenanceRequest } from '@interfaces/request.interface';

describe('MaintenanceController', () => {
  const mNext: NextFunction = jest.fn();
  let mReq: Partial<Request>;
  let mRes: Partial<Response>;
  let maintenanceController: MaintenanceController;
  let mockRequestService: MaintenanceService;
  let mockS3: S3Client;
  let requestData: MaintenanceRequestDto;
  let responseData: MaintenanceRequest;
  const date: Date = new Date();
  let s3ClientMock: AwsStub<ServiceInputTypes, ServiceOutputTypes, SmithyResolvedConfiguration<HttpHandlerOptions>>;

  beforeEach(() => {
    requestData = {
      details: 'the counter is broken',
      location: '212 welles st',
      room: 'Kitchen',
      unit: '1',
    };
    responseData = {
      _id: 'fakeId',
      details: 'the counter is broken',
      location: '212 welles st',
      room: 'Kitchen',
      unit: '1',
      imagePaths: [],
      date: date,
    };
    maintenanceController = new MaintenanceController();
    mockRequestService = maintenanceController.maintenanceService;
    mockS3 = maintenanceController.s3;
    s3ClientMock = mockClient(mockS3);

    mReq = {
      params: {
        id: '123',
      },
      body: requestData,
      files: [
        <Express.Multer.File>{
          buffer: Buffer.alloc(23),
          mimetype: 'text/plain',
          originalname: 'fake name',
        },
      ],
    };
    mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create Request', () => {
    it('should receive request', async () => {
      s3ClientMock.on(PutObjectCommand).resolves({});
      jest.spyOn(mockS3, 'send');
      jest.spyOn(mockRequestService, 'createRequest').mockResolvedValue(responseData);

      await maintenanceController.saveRequest(mReq as Request, mRes as Response, mNext);

      expect(mockS3.send).toHaveBeenCalled();
      expect(mRes.status).toHaveBeenCalledWith(201);
      expect(mRes.json).toHaveBeenCalledWith({ data: responseData, message: 'request created' });
    });

    it('should not receive request', async () => {
      s3ClientMock.on(PutObjectCommand).rejects(new Error('failure'));

      await maintenanceController.saveRequest(mReq as Request, mRes as Response, mNext);

      expect(mNext).toHaveBeenCalledWith(new Error('failure'));
    });
  });

  describe('Get Request', () => {
    it('should get request ', async () => {
      const request: MaintenanceRequest = {
        _id: '123',
        room: 'Kitchen',
        unit: '1',
        imagePaths: [],
        location: '212 welles st',
        details: 'the counter is broken',
        date: new Date(),
      };

      jest.spyOn(mockRequestService, 'findRequestById').mockResolvedValueOnce(request);

      await maintenanceController.getRequestById(mReq as Request, mRes as Response, mNext);

      expect(mockRequestService.findRequestById).toHaveBeenCalledWith('123');
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        data: request,
        message: 'found request',
      });
    });

    it('should not get request ', async () => {
      jest.spyOn(mockRequestService, 'findRequestById').mockRejectedValue(new Error('failure'));

      await maintenanceController.getRequestById(mReq as Request, mRes as Response, mNext);

      expect(mockRequestService.findRequestById).toHaveBeenCalledWith('123');
      expect(mNext).toHaveBeenCalledWith(new Error('failure'));
    });
  });
});
