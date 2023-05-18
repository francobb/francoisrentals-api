import { NextFunction, Response } from 'express';
jest.mock('../../search/transactions.search', () => {
  return jest.fn().mockImplementation(() => {
    return {
      withDate: jest.fn().mockReturnThis(),
      withLocation: jest.fn().mockReturnThis(),
      withOutcome: jest.fn().mockReturnThis(),
      withPayeePayer: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue('mocked-search-query'),
    };
  });
});
import TransactionsController from '@controllers/transactions.controller';
import TransactionService from '@services/transactions.service';
import {HttpException} from "@exceptions/HttpException";

describe('Transactions Controller', function () {
  let mRes: Partial<Response>;
  let mReq;
  let mNext: NextFunction;
  let transactionsController: TransactionsController;
  let mTransactionService: TransactionService;

  beforeAll(() => {
    mNext = jest.fn();
    mReq = {
      query: {
        month: '',
        year: '',
        location: '',
        outcome: '',
        payeePayer: '',
      },
    };
    mRes = {
      cookie: jest.fn(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    } as unknown as Partial<Response>;
    transactionsController = new TransactionsController();
    mTransactionService = transactionsController.transactionService;
  });

  describe('getTransactions()', function () {
    it('should get tenants', async () => {
      mTransactionService.searchTransactionsByQuery = jest.fn().mockResolvedValue([]);

      await transactionsController.getTransactions(mReq, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        body: expect.any(Object),
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not get transactions', async () => {
      const error = new HttpException(401, 'error');
      mTransactionService.searchTransactionsByQuery = jest.fn().mockRejectedValueOnce(error);
      await transactionsController.getTransactions(mReq, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(error);
    });
  });
});
