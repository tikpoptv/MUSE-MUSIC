import { test, expect } from '@playwright/test';

test.describe('Protected route access control', () => {
  test('redirects unauthenticated visitor from account to login', async ({ page }) => {
    // Ensure no persisted auth state bleeds into this run
    await page.addInitScript(() => {
      window.localStorage?.clear();
      window.sessionStorage?.clear();
    });

    await page.goto('/account', { waitUntil: 'networkidle' });
    
    // Wait for client-side redirect to complete
    // AuthGuard uses router.push() which is client-side navigation
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);

    // Wait for page to be fully loaded and forms to be visible
    await page.waitForLoadState('networkidle');
    
    // Verify login form is present after redirect
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="password"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });
});
