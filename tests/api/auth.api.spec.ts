import { test, expect } from '../../src/fixtures/api.fixture';
import { envConfig } from '../../config/env.config';

test.describe('Auth API', () => {
  test('successful login returns a token', async ({ authEndpoints }) => {
    const res = await authEndpoints.login(envConfig.apiUserEmail, envConfig.apiUserPassword);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    console.log(body)
    expect(body.token).toBeTruthy();
  });

  test('login fails with missing password', async ({ authEndpoints }) => {
    const res = await authEndpoints.login(envConfig.apiUserEmail, '');


    const body = await res.json();
    console.log(body)
    expect(res.status()).toBe(400);
    expect(body.error).toBeTruthy();
  });

  test('authToken fixture provides a ready-to-use token', async ({ authToken }) => {
    expect(authToken).toBeTruthy();
    expect(typeof authToken).toBe('string');
  });
});
