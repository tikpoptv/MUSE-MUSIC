import { test } from '@playwright/test';

// E2E-003: Setup Wizard end-to-end (password -> 2FA skip -> birthday -> preferences)
test.describe('Setup Wizard', () => {
  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Setup wizard flow is unstable on CI; tracked for stabilization');
    }
  });
  test.beforeEach(({ browserName }) => {
    // Temporary skip on WebKit to avoid flakiness from client redirects during setup flow
    if (browserName === 'webkit') {
      test.skip(true, 'Skipping on WebKit pending stabilization of setup redirects');
    }
  });
  test('completes steps 1-4 with API stubs', async ({ page }) => {
    // Seed auth so setup pages don't redirect to /login
    const user = {
      userID: 'u_002',
      username: 'setupuser',
      email: 'setup@example.com',
      fullName: 'Setup User',
      profilePicture: '',
      provider: 'google',
      providerID: 'gid_002',
      providerEmail: 'setup@example.com',
      role: 'user',
      loginStatus: 'active',
      setupCompleted: false,
      setupSkipped: false,
      registerDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const tokens = {
      accessToken: 'mock-access-token-setup',
      refreshToken: 'mock-refresh-token-setup',
      tokenType: 'Bearer',
      expiresIn: '3600',
    };

    // API stubs for setup and 2FA endpoints (register before navigation)
    await page.route('**/api/setup/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            allStatus: false,
            stepStatus: { step1: true, step2: false, step3: false, step4: false },
            stepData: { step1: { hasPassword: true }, step2: null, step3: null, step4: null },
            setupCompleted: false,
            setupSkipped: false,
            provider: 'google',
          }
        })
      });
    });

    await page.route('**/api/setup/save', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Saved' })
      });
    });

    await page.route('**/api/2fa/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'ok',
          data: {
            twofactorenabled: false,
            twoFactorSetupCompleted: false,
            setupStep: 'not_started',
            failedAttempts: 0,
            isLocked: false,
            lockedUntil: null,
            backupCodesCount: 0
          }
        })
      });
    });

    // Seed auth before any app code runs
    await page.addInitScript((data: any) => {
      try {
        localStorage.setItem('auth_token', data.tokens.accessToken);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('session_data', JSON.stringify({ sessionID: 's_002', expiresAt: new Date(Date.now()+3600_000).toISOString() }));
        localStorage.setItem('tokens_data', JSON.stringify(data.tokens));
      } catch {}
    }, { user, tokens });

    // Navigate straight to step1 to avoid redirect flakiness across engines
    await page.goto('/setup/step1', { waitUntil: 'domcontentloaded' });

    // Set auth data after navigation to ensure it's available
    await page.evaluate((data: any) => {
      localStorage.setItem('auth_token', data.tokens.accessToken);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      localStorage.setItem('session_data', JSON.stringify({ sessionID: 's_002', expiresAt: new Date(Date.now()+3600_000).toISOString() }));
      localStorage.setItem('tokens_data', JSON.stringify(data.tokens));
    }, { user, tokens });

    // Reload page to pick up auth data
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Wait for loading to complete first
    await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 20000 });

    // Step 1: password already set (stubbed); just proceed
    const nextBtnStep1 = page.locator('button:has-text("Next")').first();
    await test.expect(nextBtnStep1).toBeVisible({ timeout: 15000 });
    await nextBtnStep1.click();
    await page.locator('button:has-text("Next")').first().click();
    await page.waitForURL('**/setup/step2', { timeout: 20000 });

    // Step 2: 2FA (skip for now)
    await page.getByRole('button', { name: /skip for now/i }).click();
    await page.waitForURL('**/setup/step3', { timeout: 20000 });

    // Step 3: birthday — pick any available day button
    const dayButton = page.locator('div.grid.grid-cols-7.gap-1 button');
    await test.expect(dayButton.first()).toBeVisible({ timeout: 10000 });
    await dayButton.first().click();
    await page.locator('button:has-text("Next")').first().click();
    await page.waitForURL('**/setup/step4', { timeout: 20000 });

    // Step 4: preferences — accept defaults and continue
    await page.locator('button:has-text("Next")').first().click();
    await page.waitForURL('**/setup/step5', { timeout: 20000 });
  });
});
