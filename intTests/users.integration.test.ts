import bcrypt from 'bcrypt';
import request from 'supertest';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import UserService from '@services/users.service';
import UsersRoute from '@routes/users.route';
import { CreateUserDto } from '@dtos/users.dto';
import { clearDatabase } from './setup/db-handler';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
});

describe('Testing Users', () => {
  let app;
  let authRoute;
  let authUser;
  let cookies;
  let email;
  let password;
  let usersRoute;
  let userData;
  let expectedUser;

  beforeAll(async () => {
    authRoute = new AuthRoute();
    usersRoute = new UsersRoute();
    app = new App([usersRoute, authRoute]);

    email = 'j@j.com';
    password = 'password';
    userData = {
      email: email,
      password: password,
    };
  });

  describe('[GET] METHODS', function () {
    beforeAll(async () => {
      authUser = await new UserService().createUser({
        email: email,
        password: password,
        name: 'Bill',
        role: 'ADMIN',
      });

      expectedUser = {
        _id: expect.any(String),
        __v: authUser._doc.__v,
        email: authUser._doc.email,
        password: authUser._doc.password,
        name: 'Bill',
        role: 'ADMIN',
      };
      const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      cookies = loginReq.headers['set-cookie'];
    });

    afterAll(async () => {
      await clearDatabase();
    });

    describe('[GET] /users', () => {
      it('response findAll Users', async () => {
        const getAllReq = await request(app.getServer()).get(`${usersRoute.path}`).set('Accept', 'application/json').set('Cookie', cookies);

        expect(getAllReq.status).toBe(200);
        expect(getAllReq.body.data).toEqual([expectedUser]);
      });
    });

    describe('[GET] /users/:id', () => {
      it('response findOne User', async () => {
        const userId = authUser._id;

        const req: request.Response = await request(app.getServer())
          .get(`${usersRoute.path}/${userId}`)
          .set('Accept', 'application/json')
          .set('Cookie', cookies);

        expect(req.status).toBe(200);
        expect(req.body.data).toStrictEqual(expectedUser);
      });
    });
  });

  describe('[POST] /users', () => {
    afterAll(async () => {
      await clearDatabase();
    });

    it('response Create User', async () => {
      const userData: CreateUserDto = {
        email: 'test@email.com',
        password: 'q1w2e3r4',
        name: 'Bill',
        role: 'ADMIN',
      };

      const req = await request(app.getServer()).post(`${usersRoute.path}`).send(userData);

      expect(req.status).toBe(201);
    });
  });

  describe('[PUT] /users/:id', () => {
    beforeAll(async () => {
      expectedUser = await new UserService().createUser({
        email: 'updatee@mail.com',
        password: 'password',
        name: 'Bill',
        role: 'ADMIN',
      });
    });

    afterAll(async () => {
      await clearDatabase();
    });

    it('response Update User', async () => {
      const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send({ email: 'updatee@mail.com', password: 'password' });
      cookies = loginReq.headers['set-cookie'];
      const userId = expectedUser._id;
      const userData: CreateUserDto = {
        email: expectedUser.email,
        password: 'peUpdated',
        name: 'Bill',
        role: 'ADMIN',
      };

      const req = await request(app.getServer()).put(`${usersRoute.path}/${userId}`).set('Cookie', cookies).send(userData).expect(200);

      expect(req.status).toBe(200);
      expect(req.body.data).toStrictEqual({
        _id: expect.any(String),
        __v: expectedUser._doc.__v,
        email: expectedUser._doc.email,
        password: expectedUser._doc.password,
        name: 'Bill',
        role: 'ADMIN',
      });
    });
  });

  describe('[DELETE] /users/:id', () => {
    beforeAll(async () => {
      expectedUser = await new UserService().createUser({
        email: 'user2delete@mail.com',
        password: 'password',
        name: 'Bill',
        role: 'ADMIN',
      });
    });

    it('response Delete User', async () => {
      const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send({ email: 'user2delete@mail.com', password: 'password' });
      cookies = loginReq.headers['set-cookie'];
      const userId = expectedUser._id;
      return request(app.getServer()).delete(`${usersRoute.path}/${userId}`).set('Cookie', cookies).expect(204);
    });
  });
});
