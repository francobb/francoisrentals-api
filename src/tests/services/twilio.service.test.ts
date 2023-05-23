import TwilioService from '@services/twilio.service';
import { IQuery } from '@utils/interfaces';
import { logger } from '@utils/logger';

jest.mock('@clients/twilio.client', () => ({
  getClient: jest.fn(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}));

jest.mock('@utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Twilio Service', () => {
  let twilioService: TwilioService;
  let query: IQuery;

  describe('createRentReminder()', function () {
    beforeAll(() => {
      twilioService = new TwilioService();
      query = { body: 'text body', to: '1323453' };
    });

    it('should create a rent reminder message with provided parameters', async () => {
      const createMock = jest.fn();
      (twilioService.twilioClient.messages.create as jest.Mock) = createMock;

      await twilioService.createRentReminder(query);

      expect(createMock).toHaveBeenCalledWith({
        ...query,
        from: '+18449992404',
      });
    });

    it('should create a rent reminder message with default body if not provided', async () => {
      const createMock = jest.fn();
      (twilioService.twilioClient.messages.create as jest.Mock) = createMock;

      await twilioService.createRentReminder({ to: '1234567890' });

      expect(createMock).toHaveBeenCalledWith({
        body: 'You are behind on your rent. Please make your rent payment to the Real Property Management Office. Thank You',
        from: '+18449992404',
        to: '1234567890',
      });
    });

    it('should log an error and throw if an error occurs during message creation', async () => {
      const errorMessage = 'Failed to create message';
      (twilioService.twilioClient.messages.create as jest.Mock) = jest.fn().mockRejectedValueOnce(new Error(errorMessage));

      await expect(twilioService.createRentReminder({ body: 'Test message', to: '1234567890' })).rejects.toThrowError(errorMessage);

      expect(logger.error).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });
});
