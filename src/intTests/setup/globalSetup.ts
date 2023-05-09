import { config } from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
config({ path: `.env.test.local` });

export = async function globalSetup() {
  let uri;
  if (process.env.DB_MEMORY) {
    // Config to decided if an mongodb-memory-server instance should be used
    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create();
    uri = instance.getUri();
    (global as any).__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  } else {
    process.env.MONGO_URI = `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}`;
  }

  // The following is to make sure the database is clean before an test starts
  // await mongoose.connect(uri);
  // await mongoose.connection.db.dropDatabase();
  // await mongoose.disconnect();
};
