import { describe, it } from 'node:test';
import { strictEqual, equal } from 'node:assert';
import { deepStrictEqual } from 'assert';

const BASE_URL = process.env.ROOT_URL || 'http://localhost:3000';
const API_USER_EMAIL = process.env.USER_EMAIL;
const API_USER_PASSWORD = process.env.USER_PASSWORD;

describe('API Workflow', () => {
  it('should receive not authorized given wrong user and password', async () => {
    const data = {
      email: 'tenantDoesNotExist@gmail.com',
      password: 'iL!v3un!7',
    };

    // let response: request.Response;
    const request = await global.fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    strictEqual(request.status, 409);
    const response = await request.json();
    deepStrictEqual(response, { message: 'Your email tenantDoesNotExist@gmail.com is not found' });
  });

  it('should login successfully given user and password then logout', async () => {
    const data = {
      email: API_USER_EMAIL,
      password: API_USER_PASSWORD,
    };
    const request = await global.fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    strictEqual(request.status, 200);
    const response = await request.json();
    strictEqual(response.message, 'accessToken');
  });

  it('should logout successfully', async () => {
    const _globalCookie = await retrieveAuthCookie();

    const request = await global.fetch(`${BASE_URL}/logout`, {
      method: 'GET',
      headers: {
        Cookie: _globalCookie,
      },
    });

    strictEqual(request.status, 200);
    const response = await request.json();
    deepStrictEqual(response, { message: 'logged out' });
  });

  it('should receive a forgot password link', async () => {
    const data = {
      email: API_USER_EMAIL,
    };

    const request = await global.fetch(`${BASE_URL}/forgot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    strictEqual(request.status, 200);
    const response = await request.json();
    deepStrictEqual(response, { message: 'Password reset email sent successfully' });
  });
});

async function retrieveAuthCookie() {
  const data = {
    email: API_USER_EMAIL,
    password: API_USER_PASSWORD,
  };
  const request = await global.fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  strictEqual(request.status, 200);
  const response = await request.json();
  // const response = await request.json().then((response: any) => response);
  strictEqual(response.message, 'accessToken');
  equal(typeof response.cookie, typeof '');
  equal(true, response.cookie.length > 0);
  return response.cookie;
}