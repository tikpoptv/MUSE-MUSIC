import { test, expect } from '@playwright/test';

test.describe('Protected route access control', () => {
  test('redirects unauthenticated visitor from account to login', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage?.clear();
      window.sessionStorage?.clear();
    });

    await page.goto('/archive', { waitUntil: 'networkidle' });
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="password"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });
});
