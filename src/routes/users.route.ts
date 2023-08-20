import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware, { checkRole } from '@middlewares/auth.middleware';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.delete(`${this.path}/:id`, authMiddleware, checkRole(['ADMIN']), this.usersController.deleteUser);
    this.router.get(`${this.path}/:id`, authMiddleware, checkRole(['ADMIN']), this.usersController.getUserById);
    this.router.get(`${this.path}`, authMiddleware, checkRole(['ADMIN']), this.usersController.getUsers);
    this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      checkRole(['ADMIN']),
      validationMiddleware(CreateUserDto, 'body', true),
      this.usersController.updateUser,
    );
  }
}

export default UsersRoute;
