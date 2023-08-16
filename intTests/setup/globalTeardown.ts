import { config } from 'dotenv';
import mongoose from 'mongoose';
import { closeDatabase } from './db-handler';

// config({ path: `.env.test.local` });
export = async function globalTeardown() {
  await closeDatabase();
  // console.log('Tear the db down!');
  // if (process.env.DB_MEMORY) {
  //   // Config to decided if a mongodb-memory-server instance should be used
  //   const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
  //   await instance.stop();
  // }
};
