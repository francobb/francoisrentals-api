import cron from 'node-cron';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import GoogleRoute from '@routes/google.route';
import IndexRoute from '@routes/index.route';
import MaintenanceRoute from '@routes/maintenance.route';
import PropertiesRoute from '@routes/properties.route';
import StripeRoute from '@routes/stripe.route';
import TenantsRoute from '@routes/tenants.route';
import TenantChargesRoute from '@routes/tenant-charges.route';
import TransactionsRoute from '@routes/transactions.route';
import TwilioRoute from '@routes/twilio.route';
import validateEnv from '@utils/validateEnv';
import { logger } from '@utils/logger';
import { runScraperTask, runTenantChargeScraperTask } from '@/tasks/scraper.task';

validateEnv();

const app = new App([
  new AuthRoute(),
  new GoogleRoute(),
  new IndexRoute(),
  new MaintenanceRoute(),
  new PropertiesRoute(),
  new StripeRoute(),
  new TenantsRoute(),
  new TenantChargesRoute(),
  new TransactionsRoute(),
  new TwilioRoute()
]);

export const initializeScheduler = () => {
  logger.info('🟢 Scheduler initialized');

  cron.schedule(
    '30 23 * * *',
    async () => {
      logger.info('--- Running scheduled job: Scrape Transactions ---');
      try {
        await runScraperTask();
        logger.info('--- Scheduled job: Scrape Transactions completed ---');

        await runTenantChargeScraperTask({});
        logger.info('--- Scheduled job: Scrape Tenant Charges completed ---');
      } catch (error) {
        // This catch is a safeguard to ensure a failed job doesn't crash the server.
        logger.error('--- Scheduled job: Scrape Transactions failed ---', error);
      }
    },
    {
      scheduled: true,
      timezone: 'America/New_York', // Important: Set to your local timezone
    },
  );
};

app.listen();
initializeScheduler();
