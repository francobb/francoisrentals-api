import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import SessionRoute from '@routes/session.route';
import TwilioRoute from '@routes/twilio.route';
import validateEnv from '@utils/validateEnv';
import TenantsRoute from '@routes/tenants.route';
import TransactionsRoute from '@routes/transactions.route';

validateEnv();

const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new SessionRoute(),
  new TwilioRoute(),
  new TenantsRoute(),
  new TransactionsRoute(),
]);

app.listen();
