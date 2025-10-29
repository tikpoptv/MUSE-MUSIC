import { test, expect } from '@playwright/test';

test.describe('Form Validation Tests', () => {
  test('should handle form validation on login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should stay on login page (no redirect)
    await expect(page).toHaveURL(/\/login/);
    
    // Form should still be visible
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should handle form validation on register page', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for form to be fully hydrated
    await page.waitForSelector('input[name="username"]', { state: 'visible' });
    await page.waitForSelector('button[type="submit"]', { state: 'visible' });
    
    // Check that submit button is disabled initially
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled({ timeout: 5000 });
    
    // Fill username first
    await page.fill('input[name="username"]', 'testuser123');
    await page.waitForTimeout(200); // Small delay for React state update
    
    // Fill password
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.waitForTimeout(200); // Small delay for React state update
    
    // Fill confirm password
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Wait for React to process the form validation and enable the button
    // The button should be enabled when:
    // 1. username is filled
    // 2. password meets all requirements
    // 3. passwords match
    // This may take time in CI environments due to React state updates
    await page.waitForFunction(() => {
      const button = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      return button && !button.disabled;
    }, { timeout: 15000 });
    
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    
    // Try to submit form
    await submitButton.click();
    
    // Should stay on register page (no redirect)
    await expect(page).toHaveURL(/\/register/);
    
    // Form should still be visible
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for form to be fully hydrated
    await page.waitForSelector('input[name="password"]', { state: 'visible' });
    
    // Check password field
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    
    // Ensure password field starts as password type
    await expect(passwordInput).toHaveAttribute('type', 'password', { timeout: 5000 });
    
    // Find password visibility toggle button - it's a button with type="button" inside the relative container
    // The button should be near the password input, typically positioned absolutely
    const passwordContainer = passwordInput.locator('..');
    const toggleButton = passwordContainer.locator('button[type="button"]');
    
    // Wait for toggle button to be visible
    await expect(toggleButton).toBeVisible({ timeout: 5000 });
    
    // Click toggle button
    await toggleButton.click({ force: true });
    
    // Wait for React to update the input type
    await page.waitForTimeout(300); // Small delay for state update
    
    // Password should be visible (type="text")
    await expect(passwordInput).toHaveAttribute('type', 'text', { timeout: 5000 });
  });
});
