import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';

describe('MaintenanceController', () => {
  const mNext: NextFunction = jest.fn();
  let err: HttpException;
  let mReq: Partial<Request>;
  let mRes: Partial<Response>;
  let maintenanceController: MaintenanceController;

  it('should receive request', async () => {
    await maintenanceController.saveRequest(mReq as Request, mRes as Response, mNext);
    // expect(response.statusCode).toBe(201);
    // expect(response.body).toEqual({ message: 'Maintenance request received.' });
  });

  it('should get request ', async () => {
    await maintenanceController.getRequest(mReq as Request, mRes as Response, mNext);
    // expect(response.statusCode).toBe(200);
    // expect(response.body).toEqual({ message: 'Successfully Retrieved request' });
  });
});
