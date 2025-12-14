import cron from 'node-cron';
import App from '@/app';
import IndexRoute from '@routes/index.route';
import PropertiesRoute from '@routes/properties.route';
import TenantsRoute from '@routes/tenants.route';
import TenantChargesRoute from '@routes/tenant-charges.route';
import TransactionsRoute from '@routes/transactions.route';
import TwilioRoute from '@routes/twilio.route';
import AssistantRoute from '@routes/assistant.route';
import validateEnv from '@utils/validateEnv';
import { logger } from '@utils/logger';
import { runScraperTask, runTenantChargeScraperTask } from '@/tasks/scraper.task';
import { runAiAnalystTask } from '@/tasks/ai_analyst.task';

validateEnv();

const app = new App([
  new IndexRoute(),
  new PropertiesRoute(),
  new TenantsRoute(),
  new TenantChargesRoute(),
  new TransactionsRoute(),
  new TwilioRoute(),
  new AssistantRoute(),
]);

export const initializeScheduler = () => {
  logger.info('🟢 Scheduler initialized');

  // Schedule the data scrapers to run nightly at 11:30 PM.
  cron.schedule(
    '30 23 * * *',
    async () => {
      logger.info('--- Running scheduled job: Scrape Transactions & Charges ---');
      try {
        await runScraperTask();
        logger.info('--- Scheduled job: Scrape Transactions completed ---');

        await runTenantChargeScraperTask({});
        logger.info('--- Scheduled job: Scrape Tenant Charges completed ---');
      } catch (error) {
        logger.error('--- Scheduled job: Nightly Scrape failed ---', error);
      }
    },
    {
      timezone: 'America/New_York',
    },
  );

  // Schedule the AI Analyst to run every morning at 9:00 AM.
  cron.schedule(
    '0 9 * * *',
    async () => {
      logger.info('--- Running scheduled job: AI Proactive Analyst ---');
      try {
        await runAiAnalystTask();
      } catch (error) {
        logger.error('--- Scheduled job: AI Proactive Analyst failed ---', error);
      }
    },
    {
      timezone: 'America/New_York',
    },
  );
};

app.listen();
initializeScheduler();
