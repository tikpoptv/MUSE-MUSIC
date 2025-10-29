import { test, expect } from '@playwright/test';

test.describe('Protected route access control', () => {
  test('redirects unauthenticated visitor from account to login', async ({ page }) => {
    // Ensure no persisted auth state bleeds into this run
    await page.addInitScript(() => {
      window.localStorage?.clear();
      window.sessionStorage?.clear();
    });

    await page.goto('/account', { waitUntil: 'domcontentloaded' });

    await page.waitForURL('**/login', { timeout: 4000 });
    await expect(page).toHaveURL(/\/login/);

    // Verify login form is present after redirect
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
