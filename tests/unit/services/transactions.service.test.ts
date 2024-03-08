import TransactionsService from '@services/transactions.service';
import { IFile, IQuery } from '@utils/interfaces';
import { logger } from '@utils/logger';

jest.mock('../../../src/search/transactions.search', () => {
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
describe('Transactions Service', () => {
  let mTransactionRepository;
  let query: IQuery;
  let transactionData;
  let transactionsService: TransactionsService;

  beforeAll(() => {
    transactionsService = new TransactionsService();
    mTransactionRepository = transactionsService.transactions;
    transactionData = {
      _id: 'fakeId',
      balance: Array<string>,
      date: Date.now(),
      desc: 'fakeDescr',
      location: 'fakeLocation',
      outcome: 'fakeOutcome',
      payeePayer: 'fakePayeePayer',
    };
    query = {
      month: '03',
      year: '2023',
      location: 'fakeLocation',
      outcome: 'income',
      payeePayer: 'fakePayeePayer',
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('searchTransaction()', function () {
    it('should get transactions based on query info', async () => {
      mTransactionRepository.lean = jest.fn().mockReturnValueOnce([transactionData]);
      mTransactionRepository.find = jest.fn().mockReturnThis();

      const result = await transactionsService.searchTransaction(query);
      expect(result).toEqual([transactionData]);
      expect(mTransactionRepository.lean).toBeCalled();
    });

    it('should not get transaction data', async () => {
      query = {};

      mTransactionRepository.lean = jest.fn().mockReturnValueOnce([transactionData]);
      mTransactionRepository.find = jest.fn().mockReturnThis();

      const result = await transactionsService.searchTransaction(query);

      expect(result).toEqual([transactionData]);
      expect(mTransactionRepository.lean).toBeCalled();
    });
  });

  describe('addManyTransactions()', function () {
    it('should not log error', async () => {
      const insertManyMock = jest.spyOn(mTransactionRepository, 'insertMany').mockImplementationOnce((data, callback: Function) => {
        callback(null, 'success');
      });
      logger.info = jest.fn();
      await transactionsService.addManyTransactions(transactionData);
      expect(insertManyMock).toHaveBeenCalledWith(transactionData, expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith(':::::transactions inserted:::::', 'success');
    });

    it('should log error', async () => {
      logger.error = jest.fn();
      const error = new Error('Insertion failed');
      const insertManyMock = jest.spyOn(mTransactionRepository, 'insertMany').mockImplementationOnce((data, callback: Function) => {
        callback(error);
      });

      await transactionsService.addManyTransactions(transactionData);
      expect(insertManyMock).toHaveBeenCalledWith(transactionData, expect.any(Function));
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });
});
