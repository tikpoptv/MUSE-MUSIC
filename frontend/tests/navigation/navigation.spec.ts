import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should load home page with correct content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MUSE MUSIC/);
    await expect(page.locator('h1')).toContainText('Discover the soul of music!');
    
    // Wait for loading to complete - wait until h2 does not contain "Loading..."
    await page.waitForFunction(
      () => {
        const h2Elements = Array.from(document.querySelectorAll('h2'));
        return h2Elements.length === 0 || !h2Elements.some(el => el.textContent?.trim() === 'Loading...');
      },
      { timeout: 15000 }
    );
    
    // Wait a bit more to ensure content is fully rendered
    await page.waitForTimeout(500);
    
    // Check if there are sections or no data message
    const h2Count = await page.locator('h2').count();
    const hasNoDataMessage = await page.locator('text=No recommended songs available at this time').count() > 0;
    
    if (h2Count > 0) {
      // If sections exist, check that h2 contains valid language names (not "Loading...")
      const firstH2Text = await page.locator('h2').first().textContent();
      expect(firstH2Text).not.toBe('Loading...');
      await expect(page.locator('h2').first()).toContainText(/English|Korean|Thai|Japanese|Chinese|Spanish|French|German|Italian|Portuguese|Russian|Vietnamese|Indonesian|Malay|Hindi|Recommended/i);
    } else if (hasNoDataMessage) {
      // If no data, verify the message is shown
      await expect(page.locator('text=No recommended songs available at this time')).toBeVisible();
    }
    
    await expect(page.locator('text=Coming Soon')).toHaveCount(0);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/MUSE MUSIC/);
    await expect(page.locator('h1')).toContainText('Sign in');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/MUSE MUSIC/);
    await expect(page.locator('h1')).toContainText('Create your account');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    const viewport = page.viewportSize();
    if (viewport && viewport.width > 1100) {
      await expect(page.locator('a[href="/login"]').first()).toBeVisible();
    } else {
      await expect(page.locator('#hamburger-button')).toBeVisible();
    }
  });

  test('should show navbar with correct elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav span:has-text("MUSE MUSIC")')).toBeVisible();
    
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width <= 1100;
    
    if (isMobile) {
      await expect(page.locator('#hamburger-button')).toBeVisible();
      await page.click('#hamburger-button');
      
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();
      await expect(mobileMenu.locator('a[href="/"]')).toBeVisible();
      await expect(mobileMenu.locator('a[href="/for-you"]')).toBeVisible();
      await expect(mobileMenu.locator('a[href="/archive"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="Find song or paste YouTube link"]').first()).toBeVisible();
      await expect(mobileMenu.locator('a[href="/login"]').first()).toBeVisible();
    } else {
      await expect(page.locator('a[href="/"]').first()).toBeVisible();
      await expect(page.locator('a[href="/for-you"]').first()).toBeVisible();
      await expect(page.locator('a[href="/archive"]').first()).toBeVisible();
      await expect(page.locator('input[placeholder*="Find song or paste YouTube link"]').first()).toBeVisible();
      await expect(page.locator('a[href="/login"]').first()).toBeVisible();
    }
  });

  test('should handle navigation between pages', async ({ page }) => {
    await page.goto('/');
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width <= 1100;
    
    if (isMobile) {
      await page.click('#hamburger-button');
      await page.click('#mobile-menu a[href="/login"]');
      await expect(page).toHaveURL(/\/login/);
      await page.click('a[href="/register"]');
      await expect(page).toHaveURL('/register');
      await page.click('#hamburger-button');
      await page.click('#mobile-menu a[href="/login"]');
      await expect(page).toHaveURL(/\/login/);
    } else {
      await page.click('a[href="/login"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/login');
      await page.click('a[href="/register"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/register/);
      await page.click('a[href="/login"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should show responsive mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    const hamburgerButton = page.locator('#hamburger-button');
    await page.waitForFunction(() => {
      const el = document.querySelector('#hamburger-button');
      if (!el) return false;
      const style = getComputedStyle(el);
      return style.display !== 'none';
    }, { timeout: 15000 });
    
    await expect(hamburgerButton).toBeVisible({ timeout: 5000 });
    await hamburgerButton.click();
    await page.waitForTimeout(300);
    
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });
    await expect(mobileMenu.locator('a[href="/"]')).toBeVisible({ timeout: 5000 });
    await expect(mobileMenu.locator('a[href="/for-you"]')).toBeVisible({ timeout: 5000 });
    await expect(mobileMenu.locator('a[href="/archive"]')).toBeVisible({ timeout: 5000 });
  });
});
