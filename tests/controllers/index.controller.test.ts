import IndexController from '@/controllers/index.controller';
import { Response } from 'express';

describe('index controller', function () {
  it('should return 200', function () {
    const mRes: Partial<Response> = {
      sendStatus: jest.fn(),
    };
    new IndexController().index(expect.any(Object), mRes as Response);
    expect(mRes.sendStatus).toHaveBeenCalledWith(200);
  });
});
