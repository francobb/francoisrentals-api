import App from '@/app';
import AuthRoute from '@routes/auth.route';
import GoogleRoute from '@routes/google.route';
import IndexRoute from '@routes/index.route';
import MaintenanceRoute from '@routes/maintenance.route';
import TenantsRoute from '@routes/tenants.route';
import TransactionsRoute from '@routes/transactions.route';
import TwilioRoute from '@routes/twilio.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([
  new AuthRoute(),
  new GoogleRoute(),
  new IndexRoute(),
  new MaintenanceRoute(),
  new TenantsRoute(),
  new TransactionsRoute(),
  new TwilioRoute(),
  new UsersRoute(),
]);

app.listen();
