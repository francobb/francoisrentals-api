import bcrypt from 'bcrypt';
import mongoose, { Mongoose } from 'mongoose';
import request from 'supertest';
import App from '@/app';
import { CreateUserDto } from '@dtos/users.dto';
import UsersRoute from '@routes/users.route';
import AuthRoute from '@routes/auth.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Users', () => {
  let app: App;
  let usersRoute: UsersRoute;
  let reqData: any;
  beforeAll(async () => {
    (mongoose as Mongoose).connect = jest.fn().mockImplementationOnce(() => Promise.resolve());

    const userData: CreateUserDto = {
      email: 'test@email.com',
      password: 'q1w2e3r4!',
    };

    const authRoute = new AuthRoute();
    const users = authRoute.authController.authService.users;

    usersRoute = new UsersRoute();
    app = new App([usersRoute]);

    users.findOne = jest.fn().mockReturnValue({
      _id: '60706478aad6c9ad19a31c84',
      email: userData.email,
      password: await bcrypt.hash(userData.password, 10),
    });
    reqData = request(app.getServer())
      .post(`${authRoute.path}login`)
      .send(userData)
      .expect('Set-Cookie', /^Authorization=.+/);
  });

  describe('[GET] /users', () => {
    it('response findAll Users', async () => {
      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;
      console.log({ reqData });
      users.find = jest.fn().mockReturnValue([
        {
          _id: 'qpwoeiruty',
          email: 'a@email.com',
          password: await bcrypt.hash('q1w2e3r4!', 10),
        },
        {
          _id: 'alskdjfhg',
          email: 'b@email.com',
          password: await bcrypt.hash('a1s2d3f4!', 10),
        },
        {
          _id: 'zmxncbv',
          email: 'c@email.com',
          password: await bcrypt.hash('z1x2c3v4!', 10),
        },
      ]);

      (mongoose as Mongoose).connect = jest.fn().mockImplementationOnce(() => Promise.resolve());
      const app = new App([usersRoute]);
      // return request(app.getServer())
      //   .get(`${usersRoute.path}`)
      //   .set('Accept', 'application/json')
      //   .set(
      //     'Cookie',
      //     'Authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ5ZDlhZDEyMjJjZGU4MjgwN2U0ZjciLCJpYXQiOjE2ODMyMjUzMjcsImV4cCI6MTY4MzIyODkyN30.Lw0XRAlajjHT-ZQbccZEVFJvbubPLdEkG3011A2veo8',
      //   )
      //   .expect(201);
    });
  });

  describe('[GET] /users/:id', () => {
    it('response findOne User', async () => {
      const userId = 'qpwoeiruty';

      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;

      users.findOne = jest.fn().mockReturnValue({
        _id: 'qpwoeiruty',
        email: 'a@email.com',
        password: await bcrypt.hash('q1w2e3r4!', 10),
      });

      (mongoose as Mongoose).connect = jest.fn().mockImplementationOnce(() => Promise.resolve());
      const app = new App([usersRoute]);
      const req = request(app.getServer())
        .get(`${usersRoute.path}/${userId}`)
        .set('Accept', 'application/json')
        .set('Cookie', [
          'Authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ5ZDlhZDEyMjJjZGU4MjgwN2U0ZjciLCJpYXQiOjE2ODMyMjUzMjcsImV4cCI6MTY4MzIyODkyN30.Lw0XRAlajjHT-ZQbccZEVFJvbubPLdEkG3011A2veo8',
        ])
        .send();
      expect(req).toBe(201);
    });
  });

  describe('[POST] /users', () => {
    it('response Create User', async () => {
      const userData: CreateUserDto = {
        email: 'test@email.com',
        password: 'q1w2e3r4',
      };

      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;

      users.findOne = jest.fn().mockReturnValue(null);
      users.create = jest.fn().mockReturnValue({
        _id: '60706478aad6c9ad19a31c84',
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });

      (mongoose as Mongoose).connect = jest.fn().mockImplementationOnce(() => Promise.resolve());
      const app = new App([usersRoute]);
      // const req= request(app.getServer()).post(`${usersRoute.path}`).send(userData).expect(201);
      const req = await request(app.getServer()).post(`${usersRoute.path}`).send(userData);
      expect(req.status).toBe(201);
      // return
    });
  });

  describe('[PUT] /users/:id', () => {
    it('response Update User', async () => {
      const userId = '60706478aad6c9ad19a31c84';
      const userData: CreateUserDto = {
        email: 'test@email.com',
        password: 'q1w2e3r4',
      };

      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;

      if (userData.email) {
        users.findOne = jest.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          password: await bcrypt.hash(userData.password, 10),
        });
      }

      users.findByIdAndUpdate = jest.fn().mockReturnValue({
        _id: userId,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });

      (mongoose as Mongoose).connect = jest.fn().mockImplementationOnce(() => Promise.resolve());
      const app = new App([usersRoute]);
      return request(app.getServer()).put(`${usersRoute.path}/${userId}`).send(userData).expect(200);
    });
  });

  describe('[DELETE] /users/:id', () => {
    it('response Delete User', async () => {
      const userId = '60706478aad6c9ad19a31c84';

      const usersRoute = new UsersRoute();
      const users = usersRoute.usersController.userService.users;

      users.findByIdAndDelete = jest.fn().mockReturnValue({
        _id: '60706478aad6c9ad19a31c84',
        email: 'test@email.com',
        password: await bcrypt.hash('q1w2e3r4!', 10),
      });

      (mongoose as Mongoose).connect = jest.fn().mockImplementationOnce(() => Promise.resolve());
      const app = new App([usersRoute]);
      return request(app.getServer()).delete(`${usersRoute.path}/${userId}`).expect(204);
    });
  });
});
