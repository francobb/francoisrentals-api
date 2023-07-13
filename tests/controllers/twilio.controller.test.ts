import { NextFunction, Response } from 'express';
import TwilioController from '@controllers/twilio.controller';
import TwilioService from '@services/twilio.service';
import { HttpException } from '@exceptions/HttpException';

describe('Twilio Controller', function () {
  let mNext: NextFunction;
  let mReq;
  let mRes: Partial<Response>;
  let mTwilioService: TwilioService;
  let twilioController: TwilioController;

  beforeAll(() => {
    mNext = jest.fn();
    mReq = { query: { to: '1234567890', body: 'Test message' } };
    mRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Partial<Response>;
    twilioController = new TwilioController();
    mTwilioService = twilioController.twilioService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendRentReminder', () => {
    it('should return 200', async () => {
      mTwilioService.createRentReminder = jest.fn().mockImplementationOnce(() => Promise.resolve());
      await twilioController.sendRentReminder(mReq, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({ data: 'success' });
    });

    it('should return error', async () => {
      mTwilioService.createRentReminder = jest.fn().mockRejectedValueOnce(new HttpException(404, 'error'));
      await twilioController.sendRentReminder(mReq, mRes as Response, mNext);

      expect(mNext).toHaveBeenCalled();
    });
  });
});
