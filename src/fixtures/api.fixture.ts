import { test as base } from '@playwright/test';
import { ApiClient } from '../api/clients/api-client';
import { AuthEndpoints } from '../api/endpoints/auth.endpoints';
import { UsersEndpoints } from '../api/endpoints/users.endpoints';
import { envConfig } from '../../config/env.config';

type ApiFixtures = {
  apiClient: ApiClient;
  authEndpoints: AuthEndpoints;
  usersEndpoints: UsersEndpoints;
  authToken: string;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ }, use) => {
    const client = await new ApiClient().init();
    await use(client);
    await client.dispose();
  },

  authEndpoints: async ({ apiClient }, use) => {
    await use(new AuthEndpoints(apiClient));
  },

  usersEndpoints: async ({ apiClient }, use) => {
    await use(new UsersEndpoints(apiClient));
  },

  // Ready-to-use token for tests that need an authenticated API session
  authToken: async ({ authEndpoints }, use) => {
    const token = await authEndpoints.loginAndGetToken(
      envConfig.apiUserEmail,
      envConfig.apiUserPassword
    );
    await use(token);
  },
});

export const expect = test.expect;
