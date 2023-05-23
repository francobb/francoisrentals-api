import TwilioClient from '@clients/twilio.client';
import { logger } from '@utils/logger';
import { IQuery } from '@utils/interfaces';

class TwilioService {
  public twilioClient = TwilioClient.getClient();
  constructor() {
    // nothing
  }

  public async createRentReminder({ body, to }: IQuery) {
    const OG_MESSAGE = 'You are behind on your rent. Please make your rent payment to the Real Property Management Office. Thank You';
    try {
      await this.twilioClient.messages.create({
        body: body || OG_MESSAGE,
        from: '+18449992404',
        to: to,
      });
    } catch (err: any) {
      logger.error(err);
      throw Error(err);
    }
  }
}

export default TwilioService;
