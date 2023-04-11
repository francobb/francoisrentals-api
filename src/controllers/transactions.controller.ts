import TransactionService from '@services/transactions.service';
import { NextFunction, Request, Response } from 'express';

interface Req extends Request {
  query: any;
}
class TransactionsController {
  public transactionService = new TransactionService();
  public getTransactions = async (req: Req, res: Response, next: NextFunction) => {
    try {
      let transactions = [];
      if (req.query.month && req.query.year) {
        const month = Number(req.query.month);
        const year = Number(req.query.year);
        transactions = await this.transactionService.getAllTransactionsByMonth(month, year);
      } else {
        transactions = await this.transactionService.getAllTransactions();
      }
      res.status(200).json({ body: transactions });
    } catch (e) {
      next(e);
    }
  };
  // public async getTransactions(req: Req, res: Response, next: NextFunction) {
  //   try {
  //     let transactions = [];
  //     if (req.query.month && req.query.year) {
  //       const month = req.query.month;
  //       const year = Number(req.query.year);
  //       transactions = await this.transactionService.getAllTransactionsByMonth(month, year);
  //     } else {
  //       transactions = await this.transactionService.getAllTransactions();
  //     }
  //     res.status(200).json({ body: transactions });
  //   } catch (e) {
  //     next(e);
  //   }
  // }
}

export default TransactionsController;
