import transactionsModel from '@models/transactions.model';
import { ITransaction } from '@interfaces/transactions.interface';
import { logger } from '@utils/logger';
import reportModel from '@models/report.model';
import { IReport } from '@interfaces/report.interface';
import { FilterQuery, Document } from 'mongoose';

interface IFile {
  id: string;
  name: string;
  pdf: string;
}

class TransactionService {
  public transactions = transactionsModel;
  public reports = reportModel;

  public async searchTransactionsByQuery(query: FilterQuery<ITransaction & Document<any, any, any>>) {
    const [transactions] = await Promise.all([this.transactions.find(query).lean()]);
    return transactions;
  }

  public async addManyTransactions(transactions: ITransaction[]) {
    transactionsModel.insertMany(transactions, (error, result) => {
      if (error) {
        logger.error(error);
      } else {
        logger.info('Report inserted');
      }
    });
  }

  public async addReport(report: IFile) {
    const [month, year] = report.name.split('_');
    new reportModel({ month, year: year.replace(/.pdf/gi, ''), data: report.pdf }).save(error => {
      if (error) {
        logger.error(error);
        throw error;
      }
    });
  }
  public async getAllReports(): Promise<IReport[]> {
    return this.reports.find();
  }
}

export default TransactionService;
