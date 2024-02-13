import { NextFunction, Response } from 'express';

import TransactionsController from '@controllers/transactions.controller';
import TransactionService from '@services/transactions.service';
import { HttpException } from '@exceptions/HttpException';

describe('Transactions Controller', function () {
  let mRes: Partial<Response>;
  let mReq;
  let mNext: NextFunction;
  let transactionsController: TransactionsController;
  let mTransactionService: TransactionService;

  beforeAll(() => {
    mNext = jest.fn();
    mReq = {
      query: {},
    };
    mRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Partial<Response>;
    transactionsController = new TransactionsController();
    mTransactionService = transactionsController.transactionService;
  });

  describe('getTransactions()', function () {
    it('should get tenants', async () => {
      mTransactionService.searchTransaction = jest.fn().mockResolvedValue([]);

      await transactionsController.getTransactions(mReq, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        message: 'transactions',
        transactions: [],
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not get transactions', async () => {
      const error = new HttpException(401, 'error');
      mTransactionService.searchTransaction = jest.fn().mockRejectedValueOnce(error);
      await transactionsController.getTransactions(mReq, mRes as Response, mNext);
      expect(mNext).toHaveBeenCalledWith(error);
    });
  });
});
