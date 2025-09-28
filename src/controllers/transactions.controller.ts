import { NextFunction, Response } from 'express';
import TransactionService from '@services/transactions.service';
import { IRequest } from '@utils/interfaces';
import { FindAllTransactionsDto } from '@dtos/findAllTransactions';
import { Transaction } from '@models/transactions.pg_model';
import { logger } from '@utils/logger';
import {
  runScraperTask,
  runPropertyScraperTask,
  runTenantChargeScraperTask,
  authenticateAndGetCookie,
  fetchTransactionPage,
} from '@/tasks/scraper.task';

class TransactionsController {
  public transactionService = new TransactionService();

  public getTransactions = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const query: FindAllTransactionsDto = req.query;
      const findAllTransactionsData: Transaction[] = await this.transactionService.findAllTransactions(query);

      const transactionsForClient = findAllTransactionsData.map(transaction => {
        const roundedAmount = Number(Number(transaction.amount).toFixed(2));

        return {
          ...transaction,
          amount: roundedAmount,
        };
      });
      res.status(200).json({ data: transactionsForClient, message: 'findAll' });
    } catch (e) {
      next(e);
    }
  };

  public runScraper = async (req: IRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const historic = req.query.historic === 'true';
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const jobType = historic || year ? 'Historic' : 'Standard';

      logger.info(`--- Manually triggering job: ${jobType} Scrape Transactions ---`);

      await runScraperTask({ historic, year });

      logger.info(`--- Manual job: ${jobType} Scrape Transactions finished successfully ---`);
      res.status(200).json({ message: `Scraper task (${jobType}) completed successfully.` });
    } catch (error) {
      logger.error('--- Manual job: Scrape Transactions failed ---', error);
      next(error);
    }
  };

  public runPropertyScraper = async (req: IRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info(`--- Manually triggering job: Property Scraper ---`);

      await runPropertyScraperTask();

      logger.info(`--- Manual job: Property Scraper finished successfully ---`);
      res.status(200).json({ message: `Property Scraper task completed successfully.` });
    } catch (error) {
      logger.error('--- Manual job: Property Scraper failed ---', error);
      next(error);
    }
  };

  public runTenantChargeScraper = async (req: IRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      logger.info(`--- Manually triggering job: Tenant Charge Scraper ---`);

      await runTenantChargeScraperTask({ startDate: startDate as string, endDate: endDate as string });

      logger.info(`--- Manual job: Tenant Charge Scraper finished successfully ---`);
      res.status(200).json({ message: `Tenant Charge Scraper task completed successfully.` });
    } catch (error) {
      logger.error('--- Manual job: Tenant Charge Scraper failed ---', error);
      next(error);
    }
  };

  public testPaginatedFetch = async (req: IRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('--- Running Scraper Paginated Fetch Test (10 records) --- ');
      const sessionCookie = await authenticateAndGetCookie();

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const formattedStartDate = `${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getDate().toString().padStart(2, '0')}/${startDate.getFullYear()}`;
      const formattedEndDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

      logger.info(`Testing with date range: ${formattedStartDate} to ${formattedEndDate}`);

      const transactions = await fetchTransactionPage(sessionCookie, formattedStartDate, formattedEndDate, 10, 0);

      logger.info('--- Raw data from Appfolio API: ---');
      console.log(JSON.stringify(transactions, null, 2));

      res.status(200).json({ message: 'Test fetch successful', data: transactions });
    } catch (error) {
      logger.error('--- Scraper Paginated Fetch Test failed ---', error);
      next(error);
    }
  };
}

export default TransactionsController;
