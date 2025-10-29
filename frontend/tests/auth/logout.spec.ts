import { test, expect } from '@playwright/test';

// E2E-005: Logout from account page
test.describe('Logout flow', () => {
  test('logs out and redirects to home with navbar unauthenticated', async ({ page }) => {
    const user = {
      userID: 'u_001',
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      profilePicture: '',
      provider: 'google',
      providerID: 'gid_001',
      providerEmail: 'test@example.com',
      role: 'user',
      loginStatus: 'active',
      setupCompleted: true,
      setupSkipped: false,
      registerDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: '3600',
    };

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(([u, t]) => {
      localStorage.setItem('auth_token', (t as any).accessToken);
      localStorage.setItem('user_data', JSON.stringify(u));
      localStorage.setItem('session_data', JSON.stringify({ sessionID: 's_001', expiresAt: new Date(Date.now()+3600_000).toISOString() }));
      localStorage.setItem('tokens_data', JSON.stringify(t));
    }, [user, tokens] as any);

    await page.goto('/account', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/account$/);

    // Wait and click Logout button (ensure it rendered)
    const logoutBtn = page.locator('button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible({ timeout: 15000 });
    await logoutBtn.click();

    // Redirect to home should occur shortly after (regardless of API result)
    await page.waitForURL('**/', { timeout: 8000 });
    await expect(page).toHaveURL(/\/$/);

    // Navbar should show Sign in link
    await expect(page.locator('a[href="/login"]:has-text("Sign in")').first()).toBeVisible();

    // Auth storage should be cleared
    const hasToken = await page.evaluate(() => !!localStorage.getItem('auth_token'));
    expect(hasToken).toBeFalsy();
  });
});
