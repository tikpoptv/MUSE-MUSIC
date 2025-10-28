import { test, expect } from '@playwright/test';

test.describe('Form Validation Tests', () => {
  test('should handle form validation on login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should stay on login page (no redirect)
    await expect(page).toHaveURL('/login');
    
    // Form should still be visible
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should handle form validation on register page', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    // Check that submit button is disabled initially
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    // Fill valid data to enable the submit button
    await page.fill('input[name="username"]', 'testuser123');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Wait for button to be enabled
    await expect(submitButton).toBeEnabled();
    
    // Try to submit form
    await submitButton.click();
    
    // Should stay on register page (no redirect)
    await expect(page).toHaveURL('/register');
    
    // Form should still be visible
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    // Check password field
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    
    // Check password visibility toggle button
    const toggleButton = passwordInput.locator('..').locator('button[type="button"]');
    await expect(toggleButton).toBeVisible();
    
    // Click toggle button
    await toggleButton.click();
    
    // Password should be visible (type="text")
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
