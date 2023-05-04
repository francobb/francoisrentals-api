import { NextFunction, Request, Response } from 'express';
import TransactionService from '@services/transactions.service';
import SearchQueryBuilder from '@search/transactions.search';

interface Req extends Request {
  query: any;
}
class TransactionsController {
  public transactionService = new TransactionService();
  public getTransactions = async (req: Req, res: Response, next: NextFunction) => {
    try {
      let transactions = [];
      const month = Number(req.query.month ?? new Date().getMonth());
      const year = Number(req.query.year ?? new Date().getFullYear());
      const location = req.query.location ?? undefined;
      const outcome = req.query.outcome ?? undefined;
      const payeePayer = req.query.payeePayer ?? undefined;

      const sq = new SearchQueryBuilder().withDate({ month, year }).withLocation(location).withOutcome(outcome).withPayeePayer(payeePayer).build();

      transactions = await this.transactionService.searchTransactionsByQuery(sq);

      res.status(200).json({ body: transactions });
    } catch (e) {
      next(e);
    }
  };
}

export default TransactionsController;
