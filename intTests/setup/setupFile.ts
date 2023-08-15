import mongoose from 'mongoose';

beforeAll(async () => {
  // mongoose.set('strictQuery', false);
  // await mongoose.connect(process.env['MONGO_URI']);
});

afterAll(async () => {
  // await mongoose.disconnect();
});
