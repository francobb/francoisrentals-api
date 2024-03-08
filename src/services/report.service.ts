import { IReport } from '@interfaces/report.interface';
import reportModel from '@models/report.model';
import { IFile } from '@utils/interfaces';
import { logger } from '@utils/logger';

class ReportService {
  reports = reportModel;

  public async getAllReports(): Promise<IReport[]> {
    return this.reports.find();
  }

  public async findReportByMonthYear(params: { month: string; year: string }): Promise<IReport> {
    const { month, year } = params;
    return this.reports.findOne({ month, year });
  }

  public async addReport(report: IFile) {
    const [month, year] = report.name.split('_');

    this.reports.insertMany({ month, year: year.replace(/.pdf/gi, ''), data: report.pdf }, error => {
      error ? logger.error(error) : logger.info(':::::reports inserted::::: ', report.name);
    });
  }
}

export default ReportService;
