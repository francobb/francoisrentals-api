import { config } from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
config({ path: `.env.test.local` });
export = async function globalTeardown() {
  if (process.env.DB_MEMORY) {
    // Config to decided if a mongodb-memory-server instance should be used
    const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
    await instance.stop();
  }
};
