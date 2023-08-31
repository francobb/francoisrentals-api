import request from 'supertest';
import App from '../../src/app';
import { Routes } from '../../src/interfaces/routes.interface';
import { clearDatabase } from './setup/db-handler';
import UserService from '../../src/services/users.service';
import AuthRoute from '../../src/routes/auth.route';
import { MaintenanceRoute } from '../../src/routes';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
});
describe('Testing Maintenance', function () {
  let app: App;
  let authRoute: Routes;
  let cookies: string[];
  let email: string;
  let password: string;
  let maintenancesRoute: Routes;
  let maintenanceData;
  let userData: string | object;

  beforeAll(async () => {
    authRoute = new AuthRoute();
    maintenancesRoute = new MaintenanceRoute();
    app = new App([maintenancesRoute, authRoute]);

    email = 'j@j.com';
    password = 'password';
    userData = {
      email: email,
      password: password,
    };
    maintenanceData = {
      details: 'string',
      location: 'string',
      room: 'string',
      unit: 'string',
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

      const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      cookies = loginReq.headers['set-cookie'];
    });

    afterAll(async () => {
      await clearDatabase();
    });

    describe('/maintenance', () => {
      afterAll(async () => {
        await clearDatabase();
      });

      it('should create request', async () => {
        const mockFile = Buffer.from('mock file content'); // You can replace this with actual file content

        const req = await request(app.getServer())
          .post(`${maintenancesRoute.path}`)
          .set('Cookie', cookies)
          .field('details', maintenanceData.details)
          .field('location', maintenanceData.location)
          .field('room', maintenanceData.room)
          .field('unit', maintenanceData.unit)
          .attach('images', mockFile, 'test-file.png');

        expect(req.status).toBe(201);
      });

      it('should not create a request when missing field', async () => {
        const mockFile = Buffer.from('mock file content'); // You can replace this with actual file content

        const req = await request(app.getServer())
          .post(`${maintenancesRoute.path}`)
          .set('Cookie', cookies)
          .field('details', maintenanceData.details)
          .field('room', maintenanceData.room)
          .field('unit', maintenanceData.unit)
          .attach('images', mockFile, 'test-file.png');

        expect(req.status).toBe(400);
      });
    });
  });
});
