import { MONGO_URI, DB_DATABASE } from '@config';

export const dbConnection = {
  url: MONGO_URI,
  options: {
    autoCreate: true,
    autoIndex: true,
    dbName: DB_DATABASE,
    // useFindAndModify: false,
  },
};
