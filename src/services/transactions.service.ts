import transactionsModel from '@models/transactions.model';
import { ITransaction } from '@interfaces/transactions.interface';
import { logger } from '@utils/logger';
import SearchQueryBuilder from '@search/transactions.search';
import { IQuery } from '@utils/interfaces';

type IDate = string | number | Date;

class TransactionService {
  public transactions = transactionsModel;

  public async searchTransaction(query: IQuery) {
    const { from, to } = query;
    let { location, outcome, payeePayer } = query;

    location = location ?? undefined;
    outcome = outcome ?? 'income';
    payeePayer = payeePayer ?? undefined;

    const queryDates = getDateRange(from, to);
    const sq = new SearchQueryBuilder().withDate(queryDates).withLocation(location).withOutcome(outcome).withPayeePayer(payeePayer).build();
    const [transactions] = await Promise.all([this.transactions.find(sq).lean()]);

    return transactions;
  }

  public async addManyTransactions(transactions: ITransaction[]) {
    this.transactions.insertMany(transactions, (error, result) => {
      error ? logger.error(error) : logger.info(':::::transactions inserted:::::', result);
    });
  }
}

const getDateRange = (from: IDate, to: IDate) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  let fromDate = from ? new Date(from) : thirtyDaysAgo;
  let toDate = to ? new Date(to) : today;

  if (from && !to) {
    toDate = new Date(fromDate);
    toDate.setDate(fromDate.getDate() + 30);
  } else if (to && !from) {
    fromDate = new Date(toDate);
    fromDate.setDate(toDate.getDate() - 30);
  }

  return { from: fromDate, to: toDate };
};

export default TransactionService;
