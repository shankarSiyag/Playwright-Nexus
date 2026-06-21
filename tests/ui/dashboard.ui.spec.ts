import { test, expect } from '../../src/fixtures/ui.fixture';

// This test runs as an already-authenticated user because the 'ui-chromium' /
// 'ui-firefox' / 'ui-webkit' projects inject storageState from auth/<env>.json,
// which was created once by tests/ui/auth.setup.ts.

test.describe('Dashboard (authenticated)', () => {
  test('shows the logged-in success page', async ({ page, dashboardPage }) => {
    await page.goto('/logged-in-successfully/');
    await expect(dashboardPage.congratsHeading).toBeVisible();
  });

  test('logout button is visible and works', async ({ page, dashboardPage, loginPage }) => {
    await page.goto('/logged-in-successfully/');
    await expect(dashboardPage.logoutBtn).toBeVisible();

    await dashboardPage.logout();
    await expect(loginPage.usernameInput).toBeVisible();
  });
});
