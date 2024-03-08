import { IReport } from '@interfaces/report.interface';
import reportModel from '@models/report.model';
import { IFile } from '@utils/interfaces';
import { logger } from '@utils/logger';
import s3Client, { fetchPdfFromS3 } from '@clients/aws.client';
import { AWS_BUCKET, AWS_REGION } from '@config';
import { PutObjectCommand } from '@aws-sdk/client-s3';

class ReportService {
  reports = reportModel;
  public s3 = s3Client;

  public async getAllReports(): Promise<IReport[]> {
    const reports: IReport[] = await this.reports.find();
    const reportsWithLocation = reports.filter(r => r.location);
    for (const report of reportsWithLocation) {
      report.location = await fetchPdfFromS3(new URL(report.location).pathname.substring(1));
    }
    return reportsWithLocation;
  }

  public async findReportByMonthYear(params: { month: string; year: string }): Promise<IReport> {
    const { month, year } = params;
    return this.reports.findOne({ month, year });
  }

  public async addReport(report: IFile) {
    const [month, year] = report.name.split('_');

    const key = `reports/${month}_${year}`.toLowerCase();

    const params = {
      Bucket: AWS_BUCKET,
      Key: key,
      Body: report.pdf,
      ContentType: 'application/pdf',
    };

    const command = new PutObjectCommand(params);
    await this.s3.send(command);

    logger.info(`File uploaded successfully to S3: ${report.name}`);
    const location = `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    this.reports.insertMany({ month, year: year.replace(/.pdf/gi, ''), data: report.pdf, location }, error => {
      error ? logger.error(error) : logger.info(':::::reports inserted::::: ', report.name);
    });
  }
}

export default ReportService;
