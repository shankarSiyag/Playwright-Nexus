import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
  }
}
