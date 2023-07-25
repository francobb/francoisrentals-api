import { config } from 'dotenv';
import s3Client from './aws.config';
import stripe from './stripe.config';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'same-origin';
const {
  AWS_BUCKET,
  AWS_REGION,
  BUCKET_NAME,
  CLIENT_EMAIL,
  PRIVATE_KEY,
  DB_MEMORY,
  NODE_ENV,
  PORT,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  APP_SECRET,
  APP_ID,
  REDIRECT_URI,
  MONGO_URI,
  ROOT_URI,
  STRIPE_ACCESS_KEY,
  STRIPE_PUBLISHABLE_KEY,
  TWILIO_AUTH_TOKEN,
  TWILIO_ACCOUNT_SID,
} = process.env;

export {
  stripe,
  APP_ID,
  APP_SECRET,
  AWS_BUCKET,
  AWS_REGION,
  BUCKET_NAME,
  CLIENT_EMAIL,
  DB_MEMORY,
  LOG_DIR,
  LOG_FORMAT,
  MONGO_URI,
  NODE_ENV,
  ORIGIN,
  PORT,
  PRIVATE_KEY,
  REDIRECT_URI,
  ROOT_URI,
  SECRET_KEY,
  STRIPE_ACCESS_KEY,
  STRIPE_PUBLISHABLE_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  s3Client,
};
