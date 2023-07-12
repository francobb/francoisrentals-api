import multer from 'multer';
import path from 'path';
import { Router } from 'express';
import MaintenanceController from '@controllers/maintenance.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { MaintenanceRequestDto } from '@dtos/request.dto';
import { Routes } from '@interfaces/routes.interface';

class MaintenanceRoute implements Routes {
  public path = '/maintenance';
  public router = Router();
  public maintenanceController = new MaintenanceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // todo: get s3 upload working

    // const upload = multer({
    //   storage: multerS3({
    //     s3: s3Client,
    //     bucket: AWS_BUCKET,
    //     contentType: multerS3.AUTO_CONTENT_TYPE,
    //     acl: 'public-read',
    //     metadata: function (req, file, cb) {
    //       cb(null, { fieldName: file.fieldname });
    //     },
    //     key: (req, file, cb) => {
    //       console.log('file from aws?:');
    //       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    //       const extension = file.mimetype.split('/')[1];
    //       const key = 'images/' + file.fieldname + '-' + uniqueSuffix + '.' + extension;
    //       cb(null, key);
    //     },
    //   }),
    // });

    const memoryStorage = multer({
      storage: multer.memoryStorage(),
    });

    const DIR = 'public/images';
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, DIR);
      },
      filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName + '_' + Date.now() + '-' + path.extname(file.originalname));
      },
    });
    const uploader = multer({
      storage: storage,
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
      validationMiddleware(MaintenanceRequestDto, 'body'),
      this.maintenanceController.saveRequest,
    );
  }
}

export default MaintenanceRoute;
