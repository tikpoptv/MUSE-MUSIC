import { test, expect } from '@playwright/test';

test.describe('Form Validation Tests', () => {
  test('should handle form validation on login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);
    
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should handle form validation on register page', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    await page.waitForSelector('input[name="username"]', { state: 'visible' });
    await page.waitForSelector('button[type="submit"]', { state: 'visible' });
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled({ timeout: 5000 });
    
    await page.fill('input[name="username"]', 'testuser123');
    await page.waitForTimeout(200);
    
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.waitForTimeout(200);
    
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.waitForTimeout(200);
    
    const termsCheckbox = page.locator('input[type="checkbox"][id="acceptTerms"]');
    await expect(termsCheckbox).toBeVisible({ timeout: 5000 });
    await termsCheckbox.check();
    await page.waitForTimeout(200);
    
    await page.waitForFunction(() => {
      const button = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      return button && !button.disabled;
    }, { timeout: 15000 });
    
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('input[name="password"]', { state: 'visible' });
    
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toHaveAttribute('type', 'password', { timeout: 5000 });
    
    const passwordContainer = passwordInput.locator('..');
    const toggleButton = passwordContainer.locator('button[type="button"]');
    await expect(toggleButton).toBeVisible({ timeout: 5000 });
    
    await toggleButton.click({ force: true });
    await page.waitForTimeout(300);
    
    await expect(passwordInput).toHaveAttribute('type', 'text', { timeout: 5000 });
  });
});
