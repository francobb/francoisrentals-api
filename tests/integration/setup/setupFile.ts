import { Application } from 'express';
import http from 'http';
import App from '../../../src/app';
import { closeDatabase } from './db-handler'; // Adjust the path as needed

let server;
let app: Application;

beforeAll(done => {
  app = new App([]).getServer();

  server = http.createServer(app);
  server.listen(0, () => {
    const { port } = server.address();
    process.env.TEST_SERVER_PORT = port.toString(); // Set a test environment variable with the port
    done();
  });
});

afterAll(async () => {
  await closeDatabase(); // Clear the database after the server is closed

  server.close(() => {
    // done();
  });
});
