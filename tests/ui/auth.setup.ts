import { expect } from '@playwright/test';
import { test as setup } from '../../src/fixtures/ui.fixture';
import { envConfig } from '../../config/env.config';
import { logger } from '../../src/utils/logger';
import path from 'path';

const authFile = path.resolve(__dirname, `../../auth/${envConfig.env}.json`);

setup('authenticate via UI', async ({ page, loginPage, dashboardPage }) => {
  logger.info(`Authenticating against ${envConfig.env}`, { baseURL: envConfig.baseURL });

  await loginPage.open('practice-test-login/');
  await loginPage.login(envConfig.userEmail, envConfig.userPassword);

  // Assert something only visible post-login — never assume success silently
  await expect(dashboardPage.congratsHeading).toBeVisible({ timeout: envConfig.defaultTimeout });

  await page.context().storageState({ path: authFile });
  logger.info(`Saved storage state to ${authFile}`);
});
