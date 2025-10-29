import { test, expect } from '@playwright/test';

// E2E-001: User completes login and lands on account dashboard (mocked)
// Strategy: seed localStorage with minimal auth values, reload, and assert account UI
test.describe('Login (mocked) and account access', () => {
  test.skip(process.env.CI === 'true', 'Synthetic login seed relies on local storage timing; skip on CI');

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

    await page.goto('/account', { waitUntil: 'domcontentloaded' });

    await page.evaluate(([u, t]) => {
      localStorage.setItem('auth_token', (t as any).accessToken);
      localStorage.setItem('user_data', JSON.stringify(u));
      localStorage.setItem('session_data', JSON.stringify({ sessionID: 's_001', expiresAt: new Date(Date.now() + 3600_000).toISOString() }));
      localStorage.setItem('tokens_data', JSON.stringify(t));
    }, [user, tokens] as any);

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByText(/Profile/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /favourite/i })).toBeVisible();
  });
});
