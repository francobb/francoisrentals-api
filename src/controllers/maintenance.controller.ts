import { NextFunction, Request, Response } from 'express';
import MaintenanceService from '@services/maintenance.service';
import s3Client from '@clients/aws.client';
import { AWS_BUCKET } from '@config';
import { MaintenanceRequest } from '@interfaces/request.interface';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '@utils/logger';

class MaintenanceController {
  public maintenanceService = new MaintenanceService();
  public s3 = s3Client;

  public saveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestData: MaintenanceRequest = req.body;
      const buffers = (req.files as Express.Multer.File[]).map(async (file: Express.Multer.File, index) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = file.mimetype.split('/')[1];
        const key = `maintenance/${req['body'].location}/${uniqueSuffix}.${extension}`;

        const params = {
          Bucket: AWS_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalname: file.originalname,
          },
        };
        const command = new PutObjectCommand(params);
        const response = await this.s3.send(command);
        logger.info(`File ${index + 1} uploaded successfully to S3:`);
        const location = `https://${AWS_BUCKET}.s3.amazonaws.com/${key}`;

        return { location, response };
      });

      const uploadResponse = await Promise.all(buffers);
      requestData.imagePaths = uploadResponse.map(items => items.location);

      const createdRequest = await this.maintenanceService.createRequest(requestData);

      res.status(201).json({ data: createdRequest, message: 'request created' });
    } catch (error) {
      next(error);
    }
  };

  public getRequestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqId = req.params.id;
      const requestData = await this.maintenanceService.findRequestById(reqId);

      res.status(200).json({ data: requestData, message: 'found request' });
    } catch (error) {
      next(error);
    }
  };
}

export default MaintenanceController;
