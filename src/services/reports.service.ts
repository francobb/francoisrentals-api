import { logger } from '@utils/logger';
import reportModel from '@models/report.model';

class ReportsService {
  constructor() {
    // empty
  }

  public async saveReport(file: { name: { split: (arg0: string) => [any, any] }; id: any; pdf: any }) {
    logger.info(`${file.name} (${file.id})`);
    const [month, year] = file.name.split('_');
    const report = new reportModel({ month, year: year.replace(/.pdf/gi, ''), data: file.pdf });
    return new Promise((resolve, reject) => {
      report.save((error, result) => {
        if (error) {
          // logger.error(error);
          // throw error;
          reject(error);
        }
        resolve(result);
      });
    });
  }
}

export default ReportsService;
