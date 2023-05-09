import request from 'supertest';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import UserService from '../services/users.service';
import { clearDatabase } from '@/intTests/setup/db-handler';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Auth', () => {
  let authRoute;
  let app;
  let userData;

  beforeAll(function () {
    authRoute = new AuthRoute();
    app = new App([authRoute]);
    userData = {
      email: 'test@email.com',
      password: 'q1w2e3r4!',
    };
  });

  describe('[POST] /signup', () => {
    afterAll(async () => {
      await clearDatabase();
    });

    it('response should have the Create userData', async () => {
      return request(app.getServer()).post(`${authRoute.path}signup`).send(userData).expect(201);
    });
  });

  describe('[POST] /login', () => {
    beforeAll(async () => {
      await new UserService().createUser(userData);
    });

    afterAll(async () => {
      await clearDatabase();
    });

    it('response should have the Set-Cookie header with the Authorization token', async () => {
      return request(app.getServer())
        .post(`${authRoute.path}login`)
        .send(userData)
        .expect('Set-Cookie', /^Authorization=.+/);
    });
  });

  describe('[POST] /logout', () => {
    let cookies;
    beforeEach(async () => {
      await new UserService().createUser(userData);

      const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      cookies = loginReq.headers['set-cookie'];
    });

    afterAll(async () => {
      await clearDatabase();
    });

    it('logout Set-Cookie Authorization=; Max-age=0', async () => {
      return request(app.getServer())
        .post(`${authRoute.path}logout`)
        .set('Cookie', cookies[0])
        .send(userData)
        .expect('Set-Cookie', /^Authorization=\; Max-age=0/);
    });
  });
});
