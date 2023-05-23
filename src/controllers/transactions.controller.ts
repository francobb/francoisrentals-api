import { NextFunction, Response } from 'express';
import TransactionService from '@services/transactions.service';
import { IRequest } from '@utils/interfaces';

class TransactionsController {
  public transactionService = new TransactionService();
  public getTransactions = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const transactions = await this.transactionService.searchTransaction(req.query);
      res.status(200).json({ body: transactions });
    } catch (e) {
      next(e);
    }
  };
}

export default TransactionsController;
