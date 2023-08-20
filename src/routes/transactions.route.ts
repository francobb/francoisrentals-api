import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import TransactionsController from '@controllers/transactions.controller';
import authMiddleware, { checkRole } from '@middlewares/auth.middleware';

class TransactionsRoute implements Routes {
  public path = '/transactions';
  public router = Router();
  public transactionsController = new TransactionsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, checkRole(['ADMIN']), this.transactionsController.getTransactions);
  }
}

export default TransactionsRoute;
