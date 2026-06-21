import { test, expect } from '../../src/fixtures/ui.fixture';
import { envConfig } from '../../config/env.config';

// Runs in the 'ui-unauthenticated' project — fresh browser context, no storageState.
// Use this pattern for any flow that specifically needs to start logged-out
// (e.g. testing the login form itself, error states, "remember me", etc.)

test.describe('Login page (unauthenticated)', () => {


  test('logs in successfully with valid credentials', async ({ loginPage, dashboardPage }) => {
    await loginPage.open('practice-test-login/');
    await loginPage.login(envConfig.userEmail, envConfig.userPassword);
    await expect(dashboardPage.congratsHeading).toBeVisible();
  });

  test('shows an error with invalid password', async ({ loginPage }) => {
    await loginPage.goto('practice-test-login/')
    await loginPage.login(envConfig.userEmail, 'WrongPassword!');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Your password is invalid');
  });

  test('shows an error with unknown username', async ({ loginPage }) => {
    await loginPage.goto('practice-test-login/')
    await loginPage.login('not_a_real_user', envConfig.userPassword);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Your username is invalid');
  });
});
