import request from 'supertest';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import UserService from '../../src/services/users.service';
import { clearDatabase } from './setup/db-handler';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
});

describe('Testing Auth', () => {
  let authRoute;
  let app: App;
  let userData;

  beforeAll(function () {
    authRoute = new AuthRoute();
    app = new App([authRoute]);
    userData = {
      email: 'test@email.com',
      password: 'q1w2e3r4!',
      name: 'Bill',
      role: 'ADMIN',
    };
  });

  afterAll(async () => {
    await clearDatabase();
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
      userData = await new UserService().createUser({ email: 'test1@email.com', password: 'fakePassword', name: 'Bill', role: 'ADMIN' });
    });

    afterAll(async () => {
      await clearDatabase();
    });

    it('response should have the Set-Cookie header with the Authorization token', async () => {
      return request(app.getServer())
        .post(`${authRoute.path}login`)
        .send({ email: 'test1@email.com', password: 'fakePassword' })
        .expect('Set-Cookie', /^Authorization=.+/);
    });
  });

  describe('[POST] /logout', () => {
    let cookies: string[];
    beforeAll(async () => {
      await new UserService().createUser({ email: 'testlogout@email.com', password: 'fakePassword', name: 'Bill', role: 'ADMIN' });

      const loginReq = await request(app.getServer())
        .post(`${authRoute.path}login`)
        .send({ email: 'testlogout@email.com', password: 'fakePassword' });
      cookies = loginReq.headers['set-cookie'];
    });

    afterEach(async () => {
      const users = await new UserService().findAllUsers();
      users.forEach(user => {
        new UserService().deleteUser(user._id).then(() => console.log('usr deleted'));
      });
      await clearDatabase();
    });

    it('logout Set-Cookie Authorization=; Max-age=0', async () => {
      return request(app.getServer())
        .post(`${authRoute.path}logout`)
        .set('Cookie', cookies)
        .expect('Set-Cookie', /^Authorization=\; Max-age=0/);
    });
  });
});
