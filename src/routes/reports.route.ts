import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import ReportController from '@controllers/report.controller';
import authMiddleware, { checkRole } from '@middlewares/auth.middleware';

class ReportRoute implements Routes {
  public path = '/reports';
  public router = Router();
  public reportController = new ReportController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, checkRole(['ADMIN']), this.reportController.getReportByMonthYear);
  }
}

export default ReportRoute;
