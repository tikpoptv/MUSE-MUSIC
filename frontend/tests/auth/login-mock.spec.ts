import { test, expect } from '@playwright/test';

// E2E-001: User completes login and lands on account dashboard (mocked)
// Strategy: seed localStorage with minimal auth values that satisfy authService.isAuthenticated()
// and avoid SetupRedirect by setting setupCompleted=true.
test.describe('Login (mocked) and account access', () => {
  test('shows account page for authenticated user via storage state', async ({ page }) => {
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
      setupCompleted: true, // avoid SetupRedirect
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

    // Seed storage explicitly on same-origin before visiting /account
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(([u, t]) => {
      localStorage.setItem('auth_token', (t as any).accessToken);
      localStorage.setItem('user_data', JSON.stringify(u));
      localStorage.setItem('session_data', JSON.stringify({ sessionID: 's_001', expiresAt: new Date(Date.now()+3600_000).toISOString() }));
      localStorage.setItem('tokens_data', JSON.stringify(t));
    }, [user, tokens] as any);

    await page.goto('/account', { waitUntil: 'domcontentloaded' });

    // Assert we stayed on /account and see account UI elements
    await expect(page).toHaveURL(/\/account$/);
    // Wait up to 15s for client effects to populate user UI
    const logoutBtn = page.locator('button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible({ timeout: 15000 });
    await expect(page.locator('a[href="/account/settings"]')).toBeVisible();
  });
});
