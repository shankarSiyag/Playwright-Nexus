import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly successMessage: Locator;
  readonly logoutBtn: Locator;
  readonly congratsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.successMessage = page.locator('.post-title');
    this.congratsHeading = page.getByRole('heading', { name: /Logged In Successfully/i });
    this.logoutBtn = page.locator('a:has-text("Log out")');
  }

  async isLoaded(): Promise<boolean> {
    return this.congratsHeading.isVisible();
  }

  async logout(): Promise<void> {
    await this.logoutBtn.click();
  }
}
