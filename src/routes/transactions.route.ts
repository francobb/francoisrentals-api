import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import TransactionsController from '@controllers/transactions.controller';
import authMiddleware, { checkRole } from '@middlewares/auth.middleware';
import PayeePayerController from '@controllers/payeePayer.controller';
import { authenticate } from '@middlewares/firebase.auth.middleware';

class TransactionsRoute implements Routes {
  public path = '/transactions';
  public router = Router();
  public transactionsController = new TransactionsController();
  public payeePayerController = new PayeePayerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authenticate, this.transactionsController.getTransactions);
    this.router.post(`/payee-payer`, authMiddleware, checkRole(['ADMIN']), this.payeePayerController.createPayeePayer);
  }
}

export default TransactionsRoute;
