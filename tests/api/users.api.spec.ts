import { test, expect } from '../../src/fixtures/api.fixture';

test.describe('Users API', () => {
  test('GET single user returns expected shape', async ({ usersEndpoints }) => {
    const res = await usersEndpoints.getUser(2);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.data).toHaveProperty('id', 2);
    expect(body.data).toHaveProperty('email');
  });

  test('GET user list supports pagination', async ({ usersEndpoints }) => {
    const res = await usersEndpoints.listUsers(2);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.page).toBe(2);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('POST creates a new user', async ({ usersEndpoints }) => {
    const res = await usersEndpoints.createUser('Jane Doe', 'QA Engineer');
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.name).toBe('Jane Doe');
    expect(body.id).toBeTruthy();
  });

  test('PUT updates an existing user', async ({ usersEndpoints }) => {
    const res = await usersEndpoints.updateUser(2, 'Jane Updated', 'Senior QA');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.name).toBe('Jane Updated');
  });

  test('DELETE removes a user', async ({ usersEndpoints }) => {
    const res = await usersEndpoints.deleteUser(2);
    expect(res.status()).toBe(204);
  });
});
