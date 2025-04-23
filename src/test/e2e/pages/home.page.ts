import { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly body: Locator;
  readonly anyLink: Locator;
  readonly anyImage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.body = page.locator('body');
    this.anyLink = page.locator('a');
    this.anyImage = page.locator('img');
  }

  async goto() {
    await this.page.goto('/');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad() {
    // Czekaj na jakikolwiek element w body, co oznacza, że strona się załadowała
    await this.body.waitFor({ state: 'visible' });
  }

  async getPageContent(): Promise<string> {
    return this.body.innerText();
  }
} 