import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

const USERNAME = process.env.E2E_USERNAME;
const PASSWORD = process.env.E2E_PASSWORD;

if (!USERNAME || !PASSWORD) {
  throw new Error('Please set E2E_USERNAME and E2E_PASSWORD environment variables');
}

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(USERNAME, PASSWORD);

    // Should be redirected to reports page
    await expect(page).toHaveURL(/reports$/);
    await expect(page.locator('h1')).toHaveText('Twoje Raporty');
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Error message should be displayed
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(/Nieprawidłowy email lub hasło/);
  });
}); 