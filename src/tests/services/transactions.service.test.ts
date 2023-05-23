import TransactionsService from '@services/transactions.service';
import { IFile, IQuery } from '@utils/interfaces';
import { logger } from '@utils/logger';

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
describe('Transactions Service', () => {
  let fileData: IFile;
  let mReportsRepository;
  let mTransactionRepository;
  let query: IQuery;
  let transactionData;
  let transactionsService: TransactionsService;

  beforeAll(() => {
    transactionsService = new TransactionsService();
    mReportsRepository = transactionsService.reports;
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
    fileData = {
      id: 'fakeId',
      name: 'Mar_2023',
      pdf: 'fakePDF',
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
      const loggerInfoMock = jest.spyOn(logger, 'info');

      await transactionsService.addManyTransactions(transactionData);
      expect(insertManyMock).toHaveBeenCalledWith(transactionData, expect.any(Function));
      expect(loggerInfoMock).toHaveBeenCalledWith('Reports inserted');
    });

    it('should log error', async () => {
      const spyLoggerError = jest.spyOn(logger, 'error');
      const error = new Error('Insertion failed');
      const insertManyMock = jest.spyOn(mTransactionRepository, 'insertMany').mockImplementationOnce((data, callback: Function) => {
        callback(error);
      });

      await transactionsService.addManyTransactions(transactionData);
      expect(insertManyMock).toHaveBeenCalledWith(transactionData, expect.any(Function));
      expect(spyLoggerError).toHaveBeenCalledWith(error);
    });
  });

  describe('addReport()', () => {
    it('should not return an error', async () => {
      const insertManyMock = jest.spyOn(mReportsRepository, 'insertMany').mockImplementationOnce((data, callback: Function) => {
        callback(null, 'success');
      });
      const spyLoggerError = jest.spyOn(logger, 'error');
      await transactionsService.addReport(fileData);
      expect(spyLoggerError).not.toHaveBeenCalled();
      expect(insertManyMock).toHaveBeenCalledWith(
        {
          data: 'fakePDF',
          month: 'Mar',
          year: '2023',
        },
        expect.any(Function),
      );
    });

    it('should return an error', async () => {
      const spyLoggerError = jest.spyOn(logger, 'error');
      const error = new Error('Insertion failed');
      const insertManyMock = jest.spyOn(mReportsRepository, 'insertMany').mockImplementationOnce((data, callback: Function) => {
        callback(error);
      });
      await transactionsService.addReport(fileData);
      expect(insertManyMock).toHaveBeenCalledWith({ data: 'fakePDF', month: 'Mar', year: '2023' }, expect.any(Function));
      expect(spyLoggerError).toHaveBeenCalled();
    });
  });

  describe('getAllReports()', function () {
    it('should return all reports', async () => {
      jest.spyOn(mReportsRepository, 'find').mockReturnValueOnce([]);
      await transactionsService.getAllReports();
      expect(mReportsRepository.find).toBeCalled();
    });
  });
});
