import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'same-origin';
const {
  APP_ID,
  APP_SECRET,
  AWS_BUCKET,
  AWS_REGION,
  CLIENT_EMAIL,
  DB_DATABASE,
  EMAIL_ADDRESS,
  EMAIL_PASSWORD,
  FR_FIREBASE_PROJECT_ID,
  FR_FIREBASE_PRIVATE_NEW_KEY_ID,
  FR_FIREBASE_PRIVATE_NEW_KEY,
  FR_FIREBASE_CLIENT_ID,
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
  SECRET_CLIENT_KEY,
  STRIPE_ACCESS_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  STRIPE_WEBHOOK_SECRET,
} = process.env;

export {
  APP_ID,
  APP_SECRET,
  AWS_BUCKET,
  AWS_REGION,
  CLIENT_EMAIL,
  DB_DATABASE,
  EMAIL_ADDRESS,
  EMAIL_PASSWORD,
  FR_FIREBASE_PROJECT_ID,
  FR_FIREBASE_PRIVATE_NEW_KEY_ID,
  FR_FIREBASE_PRIVATE_NEW_KEY,
  FR_FIREBASE_CLIENT_ID,
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
  SECRET_CLIENT_KEY,
  STRIPE_ACCESS_KEY,
  STRIPE_WEBHOOK_SECRET,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
};
