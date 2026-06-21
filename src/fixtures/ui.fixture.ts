import { test as base } from '@playwright/test';
import { LoginPage } from '../ui/pages/login.page';
import { DashboardPage } from '../ui/pages/dashboard.page';

type UiFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export const expect = test.expect;
