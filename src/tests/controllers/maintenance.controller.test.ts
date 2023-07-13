import { NextFunction, Request, Response } from 'express';
import MaintenanceController from '@controllers/maintenance.controller';
import MaintenanceService from '@services/maintenance.service';
import { HttpException } from '@exceptions/HttpException';
import { MaintenanceRequest } from '@interfaces/request.interface';
import { MaintenanceRequestDto } from '@dtos/request.dto';

describe('MaintenanceController', () => {
  const mNext: NextFunction = jest.fn();
  let err: HttpException;
  let mReq: Partial<Request>;
  let mRes: Partial<Response>;
  let maintenanceController: MaintenanceController;
  let mockRequestService: MaintenanceService;
  let requestData: MaintenanceRequestDto;
  let responseData: MaintenanceRequest;
  const date: Date = new Date();

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
    err = new HttpException(404, 'Invalid Email');
    maintenanceController = new MaintenanceController();
    mockRequestService = maintenanceController.maintenanceService;
    mReq = {
      params: {
        id: '123',
      },
      body: requestData,
      files: [],
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
      jest.spyOn(mockRequestService, 'createRequest').mockResolvedValue(responseData);

      await maintenanceController.saveRequest(mReq as Request, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(201);
      expect(mRes.json).toHaveBeenCalledWith({ data: responseData, message: 'request created' });
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
  });
});
