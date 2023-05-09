import { MongoMemoryServer } from 'mongodb-memory-server';
import { DB_MEMORY } from '../config';

export = async function globalTeardown() {
  if (DB_MEMORY) {
    // Config to decided if a mongodb-memory-server instance should be used
    const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
    await instance.stop();
  }
};
