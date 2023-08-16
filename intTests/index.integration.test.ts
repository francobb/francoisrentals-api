import request from 'supertest';
import App from '@/app';
import IndexRoute from '@routes/index.route';
import AuthRoute from '../src/routes/auth.route';
import GoogleRoute from '../src/routes/google.route';
import MaintenanceRoute from '../src/routes/maintenance.route';
import StripeRoute from '../src/routes/stripe.route';
import TenantsRoute from '../src/routes/tenants.route';
import TransactionsRoute from '../src/routes/transactions.route';
import TwilioRoute from '../src/routes/twilio.route';
import UsersRoute from '../src/routes/users.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

// describe('Testing Index', () => {
//   describe('[GET] /', () => {
//     it('response statusCode 200', () => {
//       const indexRoute = new IndexRoute();
//       const app = new App([indexRoute]);
//
//       return request(app.getServer()).get(`${indexRoute.path}`).expect(200);
//     });
//   });
// });

describe('Integration Test', () => {
  let app;

  beforeAll(() => {
    const routes = [
      // new AuthRoute(),
      // new GoogleRoute(),
      new IndexRoute(),
      // new MaintenanceRoute(),
      // new StripeRoute(),
      // new TenantsRoute(),
      // new TransactionsRoute(),
      // new TwilioRoute(),
      // new UsersRoute(),
    ]; // Define your routes here
    app = new App(routes).getServer();
  });

  it('should return a successful response', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});
