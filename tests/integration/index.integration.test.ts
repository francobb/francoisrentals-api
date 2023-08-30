import request from 'supertest';
import App from '@/app';
import IndexRoute from '@routes/index.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Integration Test', () => {
  let app;

  beforeAll(() => {
    app = new App([new IndexRoute()]).getServer();
  });

  it('should return a successful response', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});
