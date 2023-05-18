// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
import { NextFunction, Request, Response } from 'express';
import TwilioService from '@services/Twilio.service';

export interface IRequest extends Request {
  query: IQuery;
}

export interface IQuery {
  [key: string]: string;
}
class TwilioController {
  public twilioService = new TwilioService();
  public async sendRentReminder(req: IRequest, res: Response, next: NextFunction) {
    try {
      await this.twilioService.createRentReminder(req.query);
      res.status(200).json({ data: 'success' });
    } catch (err) {
      next(err);
    }
  }
}

export default TwilioController;
