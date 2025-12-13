import http from 'http';
import App from '@/app';
import { connectDatabase, clearDatabase, closeDatabase } from './db-handler';

let server: http.Server;

beforeAll(async () => {
  await connectDatabase();
  const app = new App([]).getServer();
  server = http.createServer(app);

  await new Promise<void>(resolve => {
    server.listen(0, () => {
      const { port } = server.address() as any;
      process.env.TEST_SERVER_PORT = port.toString();
      resolve();
    });
  });
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
  await closeDatabase();
});
