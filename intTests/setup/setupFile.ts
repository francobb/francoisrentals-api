import mongoose from 'mongoose';
import { clearDatabase } from './db-handler';

beforeAll(async () => {
  // mongoose.set('strictQuery', false);
  // await mongoose.connect(process.env['MONGO_URI']);
});

afterAll(async () => {
  await mongoose.disconnect();
});
