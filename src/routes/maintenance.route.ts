import multer from 'multer';
import { Router } from 'express';
import MaintenanceController from '@controllers/maintenance.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { MaintenanceRequestDto } from '@dtos/request.dto';
import { Routes } from '@interfaces/routes.interface';
import { ImageDto } from '@dtos/images.dto';
import authMiddleware, { checkClient, checkRole } from '@middlewares/auth.middleware';

class MaintenanceRoute implements Routes {
  public path = '/maintenance';
  public router = Router();
  public maintenanceController = new MaintenanceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const memoryStorage = multer.memoryStorage();
    const uploader = multer({
      storage: memoryStorage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
      },
    });

    this.router.post(
      `${this.path}`,
      uploader.array('images', 10),
      checkClient,
      authMiddleware,
      checkRole(['ADMIN', 'OWNER', 'TENANT']),
      validationMiddleware(MaintenanceRequestDto, 'body'),
      validationMiddleware(ImageDto, 'files'),
      this.maintenanceController.saveRequest,
    );
  }
}

export default MaintenanceRoute;
