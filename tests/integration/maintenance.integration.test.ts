import request from 'supertest';
import App from '../../src/app';
import { Routes } from '../../src/interfaces/routes.interface';
import { clearDatabase } from './setup/db-handler';
import UserService from '../../src/services/users.service';
import AuthRoute from '../../src/routes/auth.route';
import { MaintenanceRoute } from '../../src/routes';
import { SECRET_CLIENT_KEY } from '../../src/config';
import crypto from 'crypto';

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
  let maintenanceData: { details: any; location: any; room: any; unit: any };
  let userData: string | object;
  let token: string;

  beforeAll(async () => {
    authRoute = new AuthRoute();
    maintenancesRoute = new MaintenanceRoute();
    app = new App([maintenancesRoute, authRoute]);

    email = 'maintenance@test.com';
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
      const timestamp = new Date().getHours();
      const dataToHash = `${SECRET_CLIENT_KEY}-${timestamp}`;
      // Recreate the token using the same logic as on the client-side
      token = crypto.createHash('sha256').update(dataToHash).digest('hex');
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
          .set('FR-TOKEN', token)
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
          .set('FR-TOKEN', token)
          .field('details', maintenanceData.details)
          .field('room', maintenanceData.room)
          .field('unit', maintenanceData.unit)
          .attach('images', mockFile, 'test-file.png');

        expect(req.status).toBe(400);
      });
    });
  });
});
