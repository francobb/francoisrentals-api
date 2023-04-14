// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
import { NextFunction, Request, Response } from 'express';

const accountSid = 'ACd2bed8c8566ac11b83949bd10cff458d';
const authToken = '4b71f01ebb418c6f93eb049da21bdf14';
const client = require('twilio')(accountSid, authToken);

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
