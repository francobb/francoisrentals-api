// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
import { NextFunction, Request, Response } from 'express';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from '@config';

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

interface IRequest extends Request {
  query: { [key: string]: string };
}
class TwilioController {
  public async sendRentReminder(req: IRequest, res: Response, next: NextFunction) {
    const OG_MESSAGE = 'You are behind on your rent. Please make your rent payment to the Real Property Management Office. Thank You';
    try {
      const { to, body } = req.query;
      client.messages
        .create({
          body: body || OG_MESSAGE,
          from: '+18449992404',
          to,
        })
        .then(message => console.log(message.sid));

      res.status(200).json({ data: 'success' });
    } catch (err) {
      next(err);
    }
  }
}

export default TwilioController;
