import { test, expect } from '@playwright/test';

test.describe('Search/Recommendation card navigation', () => {
  test('clicking a music card navigates to /songs/:id and shows not-found', async ({ page }) => {
    await page.goto('/test', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    const loadingText = page.getByText('Loading...');
    try {
      await expect(loadingText).toBeVisible({ timeout: 1000 });
      await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    } catch {
      // Loading text might not appear if data loads very quickly
    }
    
    const firstCardLink = page.locator('a[href^="/songs/"]').first();
    await expect(firstCardLink).toBeVisible({ timeout: 20000 });

    const targetHref = await firstCardLink.getAttribute('href');
    expect(targetHref).toBeTruthy();
    await firstCardLink.click();

    await page.waitForURL(new RegExp(`${targetHref?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), { timeout: 10000 });
    await expect(page).toHaveURL(/\/songs\//);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Page not found')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('The page you are looking for does not exist.')).toBeVisible({ timeout: 5000 });
  });
});
