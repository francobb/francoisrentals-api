import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import TransactionsController from '@controllers/transactions.controller';
import PayeePayerController from '@controllers/payeePayer.controller';
import { apiKeyMiddleware } from '@middlewares/auth.middleware';

class TransactionsRoute implements Routes {
  public path = '/transactions';
  public router = Router();
  public transactionsController = new TransactionsController();
  public payeePayerController = new PayeePayerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, apiKeyMiddleware, this.transactionsController.getTransactions);
    this.router.get(`${this.path}/run-scraper`, this.transactionsController.runScraper);
    this.router.get(`${this.path}/scraper/properties`, this.transactionsController.runPropertyScraper);
    this.router.get(`${this.path}/scraper/tenant-charges`, this.transactionsController.runTenantChargeScraper);
    this.router.get(`${this.path}/scraper/test-paginated-fetch`, this.transactionsController.testPaginatedFetch);
  }
}

export default TransactionsRoute;
