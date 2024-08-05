import request from 'supertest';
import App from '../../src/app';
import { clearDatabase } from './setup/db-handler';
import UserService from '../../src/services/users.service';
import AuthRoute from '../../src/routes/auth.route';
import { TenantsRoute } from '../../src/routes';
import { CreateTenantDto } from '../../src/dtos/tenants.dto';
import TenantService from '../../src/services/tenants.service';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
});
describe.skip('Testing Tenants', function () {
  let app: App;
  let cookies: string;
  let email: string;
  let password: string;
  let tenantsData: CreateTenantDto;
  let userData: string | object;

  beforeAll(async () => {
    app = new App([new TenantsRoute(), new AuthRoute()]);

    email = 'tenant@test.com';
    password = 'password';
    userData = {
      email: email,
      password: password,
    };
    tenantsData = {
      email: 'j@j.com',
      lease_to: '01/01/01',
      move_in: '01/01/01',
      name: 'Jimmy',
      phone: ['4018989090'],
      property: '212 Welles St',
      rentalAmount: 0,
      rentalBalance: 0,
      unit: '1',
    };
  });

  describe('[POST] Methods', function () {
    beforeAll(async () => {
      await new UserService().createUser({
        email: email,
        password: password,
        name: 'Bill',
        role: 'ADMIN',
      });

      const loginReq = await request(app.getServer()).post(`/login`).send(userData);
      cookies = loginReq.headers['set-cookie'];
    });

    afterAll(async () => {
      await clearDatabase();
    });

    describe('/tenants', () => {
      afterAll(async () => {
        await clearDatabase();
      });

      it('should create tenant', async () => {
        // const req = await request(app.getServer()).post(`/tenants`).send(userData);
        const req = await request(app.getServer()).post(`/tenants`).set('Cookie', cookies).send(tenantsData);

        expect(req.status).toBe(201);
      });
    });
  });

  describe('[GET] Methods', function () {
    describe('/tenants', () => {
      beforeAll(async () => {
        await new TenantService().createTenant(tenantsData);
        await new UserService().createUser({
          email: email,
          password: password,
          name: 'Bill',
          role: 'ADMIN',
        });

        const loginReq = await request(app.getServer()).post(`/login`).send(userData);
        cookies = loginReq.headers['set-cookie'];
      });

      afterAll(async () => {
        await clearDatabase();
      });

      it('should get all tenants', async () => {
        const req = await request(app.getServer()).get(`/tenants`).set('Cookie', cookies);
        expect(req.status).toBe(200);
      });
    });
  });
});
