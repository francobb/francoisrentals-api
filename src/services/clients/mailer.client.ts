import nodemailer from 'nodemailer';
import { EMAIL_ADDRESS, EMAIL_PASSWORD } from '@config';

const mailer = nodemailer.createTransport({
  // Your email service configuration (e.g., SMTP or other transport options)
  service: 'Gmail',
  auth: {
    user: EMAIL_ADDRESS, // Your email address
    pass: EMAIL_PASSWORD, // Your email password or an app-specific password
  },
});
export default mailer;
