import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should show login form elements', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Check for form elements
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show register form elements', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Check for form elements
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show Google Auth button', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Check for Google Auth button (look for any button with Google text)
    const googleButton = page.locator('button:has-text("Google")').or(page.locator('text=Sign in with Google'));
    await expect(googleButton).toBeVisible();
  });
});
