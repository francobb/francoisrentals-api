import { NextFunction, Response } from 'express';
import TransactionService from '@services/transactions.service';
import { IRequest } from '@utils/interfaces';
import { FindAllTransactionsDto } from '@dtos/findAllTransactions';
import { FindAllTenantChargesDto } from '@/dtos/findAllTenantCharges.dto';
import { Transaction } from '@models/transactions.pg_model';
import { TenantCharge } from '@/models/tenant-charge.pg_model';
import { logger } from '@utils/logger';
import { runScraperTask, runPropertyScraperTask, runTenantChargeScraperTask } from '@/tasks/scraper.task';
import DataEnrichmentService from '@/services/data-enrichment.service';

class TransactionsController {
  public transactionService = new TransactionService();
  public dataEnrichmentService = new DataEnrichmentService();

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

  public getTenantCharges = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const query: FindAllTenantChargesDto = req.query;
      const findAllTenantChargesData: TenantCharge[] = await this.transactionService.findAllTenantCharges(query);

      const chargesForClient = findAllTenantChargesData.map(charge => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { property, tenant, ...restOfCharge } = charge;

        const sanitizedTenant = tenant
          ? {
              id: tenant.id,
              externalId: tenant.externalId,
              name: tenant.name,
            }
          : null;

        return {
          ...restOfCharge,
          tenant: sanitizedTenant,
        };
      });

      res.status(200).json({ data: chargesForClient, message: 'findAllTenantCharges' });
    } catch (e) {
      next(e);
    }
  };

  public getMonthlyRentSnapshot = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const snapshotData = await this.transactionService.getMonthlyRentSnapshot();
      res.status(200).json({ data: snapshotData, message: 'getMonthlyRentSnapshot' });
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

  public populateTenants = async (req: IRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('--- Manually triggering job: Populate Tenants from Transactions ---');

      const result = await this.transactionService.populateTenantsFromTransactions();

      logger.info(`--- Manual job: Populate Tenants finished successfully. Created: ${result.created}, Existing: ${result.updated} ---`);
      res.status(200).json({
        message: `Populate Tenants task completed successfully.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public linkOccupanciesToTenants = async (req: IRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('--- Manually triggering job: Link Occupancies to Tenants ---');

      const result = await this.dataEnrichmentService.linkOccupanciesToTenants();

      logger.info(`--- Manual job: Link Occupancies to Tenants finished successfully. ---`);
      res.status(200).json({
        message: `Link Occupancies to Tenants task completed successfully.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TransactionsController;
