import cron from 'node-cron';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import GoogleRoute from '@routes/google.route';
import IndexRoute from '@routes/index.route';
import MaintenanceRoute from '@routes/maintenance.route';
import StripeRoute from '@routes/stripe.route';
import TenantsRoute from '@routes/tenants.route';
import TransactionsRoute from '@routes/transactions.route';
import TwilioRoute from '@routes/twilio.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import { logger } from '@utils/logger';

validateEnv();

const app = new App([
  new AuthRoute(),
  new GoogleRoute(),
  new IndexRoute(),
  new MaintenanceRoute(),
  new StripeRoute(),
  new TenantsRoute(),
  new TransactionsRoute(),
  new TwilioRoute(),
  new UsersRoute(),
]);

// cron.schedule('*/1 * * * *', async () => {
cron.schedule('0 0 1 * *', async () => {
  await app.updateRentalBalance();
  logger.info('Rental balances updated.');
});

app.listen();
