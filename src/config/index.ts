import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'same-origin';
export const {
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
