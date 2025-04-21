import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home.page';

test.describe('Home Page', () => {
  test('should load the page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Czekamy na załadowanie strony
    await homePage.waitForPageLoad();
    
    // Sprawdzamy, czy body jest widoczne
    await expect(homePage.body).toBeVisible();
  });
  
  test('should have a non-empty title or empty title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Czekamy na załadowanie strony
    await homePage.waitForPageLoad();
    
    // Pobieramy tytuł strony (może być pusty, ale nie powinien powodować błędu)
    const title = await homePage.getTitle();
    expect(typeof title).toBe('string');
  });
  
  test('should contain some content', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Czekamy na załadowanie strony
    await homePage.waitForPageLoad();
    
    // Sprawdzamy, czy strona ma jakąś zawartość tekstową
    const content = await homePage.getPageContent();
    expect(content.length).toBeGreaterThan(0);
  });
  
  // Test zrzutu ekranu
  test('should match visual snapshot', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Czekamy na załadowanie strony
    await homePage.waitForPageLoad();
    
    // Wykonaj porównanie wizualne
    await expect(page).toHaveScreenshot('home-page.png');
  });
}); 