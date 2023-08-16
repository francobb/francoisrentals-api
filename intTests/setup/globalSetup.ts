import { config } from 'dotenv';
import { clearDatabase } from './db-handler';

config({ path: `.env.test.local` });

export = async function globalSetup() {
  console.log('CHECK IF DB IS RUNNING OR NOT');
  //todo: start app once here
  await clearDatabase();

  // let uri;
  // if (process.env.DB_MEMORY) {
  //   const instance = await MongoMemoryServer.create();
  //   uri = instance.getUri();
  //   (global as any).__MONGOINSTANCE = instance;
  //   process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  // } else {
  //   process.env.MONGO_URI = `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}`;
  // }
};
