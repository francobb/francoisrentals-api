import transactionsModel from '@models/transactions.model';
import { ITransaction } from '@interfaces/transactions.interface';
import { logger } from '@utils/logger';
import { IReport } from '@interfaces/report.interface';
import reportModel from '@models/report.model';

interface IFile {
  id: string;
  name: string;
  pdf: string;
}

class TransactionService {
  public transactions = transactionsModel;
  public reports = reportModel;
  public async getAllTransactionsByMonth(month?: number, year?: number): Promise<ITransaction[]> {
    month = month ?? new Date().getMonth() + 1;
    year = year ?? new Date().getFullYear();

    const startOfMonth = new Date(`${year}-${month}-01T00:00:00Z`);
    const endOfMonth = new Date(`${year}-${month}-${this.getLastDayOfMonth(year, month)}T00:00:00Z`);

    const [transactions] = await Promise.all([
      this.transactions
        .find({
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        })
        .lean(),
    ]);
    return transactions;
  }

  public async getAllTransactions(): Promise<ITransaction[]> {
    const [transactions] = await Promise.all([this.transactions.find().lean()]);
    return transactions;
  }

  public getLastDayOfMonth(year, monthNumber) {
    // Convert 1-indexed month number to 0-indexed value
    const month = monthNumber - 1;
    // Month parameter is 0-indexed, so we need to add 1 to get the next month
    const nextMonth = new Date(year, month + 1, 1);
    // Subtract one day in milliseconds to get the last day of the current month
    const lastDayOfMonth = new Date(nextMonth.getTime() - 86400000);
    // Return the date component of the last day of the month
    return lastDayOfMonth.getDate();
  }

  public getFirstDayOfMonth(year, monthNumber) {
    // Convert 1-indexed month number to 0-indexed value
    const month = monthNumber - 1;
    // Create a new Date object for the first day of the given month
    const firstDayOfMonth = new Date(year, month, 1);
    // Return the Date object for the first day of the month
    return firstDayOfMonth;
  }

  public async addTransaction(transaction: ITransaction): Promise<ITransaction> {
    return this.transactions.create(transaction);
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

  public async addReport(report: IFile): Promise<IReport> {
    logger.info(`${report.name} (${report.id})`);
    const [month, year] = report.name.split('_');
    const reportToSave = new reportModel({ month, year: year.replace(/.pdf/gi, ''), data: report.pdf });
    return new Promise((resolve, reject) => {
      reportToSave.save((error, result) => {
        if (error) {
          // logger.error(error);
          // throw error;
          reject(error);
        }
        resolve(result);
      });
    });
  }
}

export default TransactionService;
