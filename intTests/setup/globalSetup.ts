import { config } from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
config({ path: `.env.test.local` });

export = async function globalSetup() {
  let uri;
  if (process.env.DB_MEMORY) {
    const instance = await MongoMemoryServer.create();
    uri = instance.getUri();
    (global as any).__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  } else {
    process.env.MONGO_URI = `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}`;
  }
};
