import ReportService from '@services/report.service';
import { NextFunction, Request, Response } from 'express';

class ReportController {
  public reportService = new ReportService();

  public getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reports = await this.reportService.getAllReports();
      res.status(200).json({ reports, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getReportByMonthYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reports = [];
      reports.push(await this.reportService.findReportByMonthYear(req.query as { month: string; year: string }));
      let message = 'findByMonthYear';
      if (!reports) {
        message = 'report not found';
      }
      res.status(200).json({ reports, message });
    } catch (error) {
      next(error);
    }
  };
}

export default ReportController;
