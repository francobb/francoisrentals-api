import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { Router } from 'express';
import MaintenanceController from '@controllers/maintenance.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { AWS_BUCKET } from '@config';
import { ImageDto } from '@dtos/images.dto';
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
    const s3 = new S3Client({});
    const upload = multer({
      storage: multerS3({
        s3,
        bucket: AWS_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        // acl: 'public-read',
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.mimetype.split('/')[1];
          // const key = 'requestImages/' + req['body'].location + '-' + uniqueSuffix + '.' + extension;
          const key = `requestImages/${req['body'].location}/${uniqueSuffix}.${extension}`;
          cb(null, key);
        },
      }),
    });

    this.router.post(
      `${this.path}`,
      upload.array('images', 10),
      validationMiddleware(MaintenanceRequestDto, 'body'),
      validationMiddleware(ImageDto, 'files'),
      this.maintenanceController.saveRequest,
    );
  }
}

export default MaintenanceRoute;
