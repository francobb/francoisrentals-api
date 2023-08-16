import bcrypt from 'bcrypt';
import request from 'supertest';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import UserService from '@services/users.service';
import UsersRoute from '@routes/users.route';
import { CreateUserDto } from '@dtos/users.dto';
import { clearDatabase } from './setup/db-handler';
import userModel from '../src/models/users.model';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
});

function doesUserExist(user) {
  return Boolean(userModel.find({ email: user.email }))
}

xdescribe('Testing Users', () => {
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
    authUser = await new UserService().createUser({
      email: email,
      password: password,
    });
    expectedUser = {
      _id: expect.any(String),
      __v: authUser._doc.__v,
      email: authUser._doc.email,
      password: authUser._doc.password,
    };
  });

  describe('[GET] METHODS', function () {
    beforeAll(async () => {
      if (doesUserExist(authUser)) {
        const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
        cookies = loginReq.headers['set-cookie'];
      } else {
        authUser = await new UserService().createUser({
          email: email,
          password: password,
        });
        const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
        cookies = loginReq.headers['set-cookie'];
      };
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
      };

      const req = await request(app.getServer()).post(`${usersRoute.path}`).send(userData);

      expect(req.status).toBe(201);
    });
  });

  describe('[PUT] /users/:id', () => {
    beforeAll(async () => {
      expectedUser = await new UserService().createUser({
        email: 'user2updatee@mail.com',
        password: 'password',
      });
    });

    afterAll(async () => {
      await clearDatabase();
    });

    it('response Update User', async () => {
      const userId = expectedUser._id;
      const userData: CreateUserDto = {
        email: expectedUser.email,
        password: 'peUpdated',
      };

      const req = await request(app.getServer()).put(`${usersRoute.path}/${userId}`).send(userData).expect(200);

      expect(req.status).toBe(200);
      expect(req.body.data).toStrictEqual({
        _id: expect.any(String),
        __v: expectedUser._doc.__v,
        email: expectedUser._doc.email,
        password: expectedUser._doc.password,
      });
    });
  });

  describe('[DELETE] /users/:id', () => {
    beforeAll(async () => {
      expectedUser = await new UserService().createUser({
        email: 'user2delete@mail.com',
        password: await bcrypt.hash('pw2delete', 10),
      });
    });

    it('response Delete User', async () => {
      const userId = expectedUser._id;
      return request(app.getServer()).delete(`${usersRoute.path}/${userId}`).expect(204);
    });
  });
});
