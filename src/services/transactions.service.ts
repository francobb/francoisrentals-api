import transactionsModel from '@models/transactions.model';
import { ITransaction } from '@interfaces/transactions.interface';
import { logger } from '@utils/logger';
import reportModel from '@models/report.model';
import { IReport } from '@interfaces/report.interface';
import SearchQueryBuilder from '@search/transactions.search';
import { IFile, IQuery } from '@utils/interfaces';

class TransactionService {
  public transactions = transactionsModel;
  public reports = reportModel;

  public async searchTransaction(query: IQuery) {
    const month = Number(query.month ?? undefined);
    const year = Number(query.year ?? undefined);
    const location = query.location ?? undefined;
    const outcome = query.outcome ?? undefined;
    const payeePayer = query.payeePayer ?? undefined;
    const sq = new SearchQueryBuilder().withDate({ month, year }).withLocation(location).withOutcome(outcome).withPayeePayer(payeePayer).build();
    const [transactions] = await Promise.all([this.transactions.find(sq).lean()]);
    return transactions;
  }
  public async addManyTransactions(transactions: ITransaction[]) {
    this.transactions.insertMany(transactions, (error, result) => {
      error ? logger.error(error) : logger.info('Reports inserted');
    });
  }

  public async addReport(report: IFile) {
    const [month, year] = report.name.split('_');
    this.reports.insertMany({ month, year: year.replace(/.pdf/gi, ''), data: report.pdf }, error => {
      if (error) {
        logger.error(error);
      }
    });
  }
  public async getAllReports(): Promise<IReport[]> {
    return this.reports.find();
  }
}

export default TransactionService;
