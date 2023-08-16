import http from 'http';
import App from '../../src/app';
import { clearDatabase } from './db-handler'; // Adjust the path as needed

let server;
let app;

beforeAll(done => {
  const routes = []; // Define your routes here
  app = new App(routes).getServer();

  server = http.createServer(app);
  server.listen(0, () => {
    const { port } = server.address();
    process.env.TEST_SERVER_PORT = port.toString(); // Set a test environment variable with the port
    done();
  });
});

afterAll(async done => {
  server.close(() => {
    clearDatabase(); // Clear the database after the server is closed
    done();
  });
});
