import { MONGO_URI } from '@config';

export const dbConnection = {
  url: MONGO_URI,
  options: {
    autoCreate: true,
    autoIndex: true,
    // useFindAndModify: false,
  },
};