import request from 'supertest';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import UserService from '@services/users.service';
import UsersRoute from '@routes/users.route';
import { CreateUserDto } from '@dtos/users.dto';
import { clearDatabase } from './setup/db-handler';
import { Routes } from '@interfaces/routes.interface';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
});

describe('Testing Users', () => {
  let app: App;
  let authRoute: Routes;
  let authUser;
  // let cookies: string[];
  let email: string;
  let password: string;
  let usersRoute: Routes;
  let userData: string | object;
  let expectedUser;

  beforeAll(async () => {
    authRoute = new AuthRoute();
    usersRoute = new UsersRoute();
    app = new App([usersRoute, authRoute]);

    email = 'users@test.com';
    password = 'password';
    userData = {
      email: email,
      password: password,
    };
  });

  describe('[GET] METHODS', function () {
    let cookies: string[];

    afterAll(async () => {
      await clearDatabase();
    });

    describe('[GET] /users', () => {
      beforeAll(async () => {
        authUser = await new UserService().createUser({
          email: email,
          password: password,
          name: 'Bill',
          role: 'ADMIN',
        });

        const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
        cookies = loginReq.headers['set-cookie'];
      });

      it('response findAll Users', async () => {
        const getAllReq = await request(app.getServer()).get(`${usersRoute.path}`).set('Accept', 'application/json').set('Cookie', cookies);

        expect(getAllReq.status).toBe(200);
        expect(getAllReq.body.data).toHaveLength(1);
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
        // expect(req.body.data).toStrictEqual(expectedUser);
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
    let userToUpdate;
    let cookies: string[];

    beforeAll(async () => {
      expectedUser = await new UserService().createUser({
        email: 'updatee@mail.com',
        password: 'password',
        name: 'Bill',
        role: 'ADMIN',
      });
      userToUpdate = await new UserService().createUser({
        email: 'user2update@mail.com',
        password: 'password',
        name: 'Tenant1',
        role: 'TENANT',
      });
      const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send({ email: expectedUser.email, password: 'password' });
      cookies = loginReq.headers['set-cookie'];
    });

    afterAll(async () => {
      await clearDatabase();
    });

    it('response Update User', async () => {
      const userId = userToUpdate._id;
      const userData: CreateUserDto = {
        email: userToUpdate.email,
        password: 'peUpdated',
        name: 'Tenant1Updated',
        role: 'TENANT',
      };

      const req = await request(app.getServer()).put(`${usersRoute.path}/${userId}`).set('Cookie', cookies).send(userData);

      expect(req.status).toBe(200);
      expect(req.body.data).toStrictEqual({
        _id: expect.any(String),
        __v: userToUpdate._doc.__v,
        email: userToUpdate._doc.email,
        password: userToUpdate._doc.password,
        name: userToUpdate.name,
        role: userToUpdate.role,
      });
    });
  });

  describe('[DELETE] /users/:id', () => {
    let userToDelete;
    let cookies: string[];
    beforeAll(async () => {
      expectedUser = await new UserService().createUser({
        email: 'user2delete@mail.com',
        password: 'password',
        name: 'Bill',
        role: 'ADMIN',
      });
      userToDelete = await new UserService().createUser({
        email: 'delete@user.com',
        password: 'password',
        name: 'USER',
        role: 'TENANT',
      });

      const loginReq = await request(app.getServer()).post(`${authRoute.path}login`).send({ email: 'user2delete@mail.com', password: 'password' });
      cookies = loginReq.headers['set-cookie'];
    });

    it('response Delete User', async () => {
      const userId = userToDelete._id;
      return request(app.getServer()).delete(`${usersRoute.path}/${userId}`).set('Cookie', cookies).expect(204);
    });
  });
});
