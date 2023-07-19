import { config } from 'dotenv';
import s3Client from './aws.config';
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
  TWILIO_AUTH_TOKEN,
  TWILIO_ACCOUNT_SID,
} = process.env;

export {
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
  s3Client,
  TWILIO_AUTH_TOKEN,
  TWILIO_ACCOUNT_SID,
};
