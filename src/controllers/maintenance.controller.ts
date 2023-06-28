import MaintenanceService from '@services/maintenance.service';
import { NextFunction, Request, Response } from 'express';
import { MaintenanceRequest } from '@interfaces/request.interface';

class MaintenanceController {
  public maintenanceService = new MaintenanceService();

  public saveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestData: MaintenanceRequest = req.body;
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
