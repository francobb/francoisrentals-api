import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import GoogleRoute from '@routes/google.route';
import TwilioRoute from '@routes/twilio.route';
import validateEnv from '@utils/validateEnv';
import TenantsRoute from '@routes/tenants.route';
import TransactionsRoute from '@routes/transactions.route';

validateEnv();

const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new GoogleRoute(),
  new TwilioRoute(),
  new TenantsRoute(),
  new TransactionsRoute(),
]);

app.listen();
