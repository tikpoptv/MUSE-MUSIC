import { test, expect } from '@playwright/test';

// E2E-004 (current stage): Search/Recommendation card navigation goes to not-found (detail page not implemented yet)
test.describe('Search/Recommendation card navigation', () => {
  test('clicking a music card navigates to /songs/:id and shows not-found', async ({ page }) => {
    await page.goto('/test', { waitUntil: 'networkidle' });
    
    // Wait for page to fully load and React to hydrate
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for the loading state to disappear (albums are being fetched)
    // The fetchRecommendedAlbums function has a 500ms setTimeout, so we wait for "Loading..." text to disappear
    const loadingText = page.getByText('Loading...');
    try {
      await expect(loadingText).toBeVisible({ timeout: 1000 });
      // If loading text is visible, wait for it to disappear
      await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    } catch {
      // Loading text might not appear if data loads very quickly, which is fine
    }
    
    // Wait for recommend section and at least one music card link to appear
    // The data is fetched asynchronously, so we need to wait for it to load
    const firstCardLink = page.locator('a[href^="/songs/"]').first();
    
    // Wait for the link to be visible (data has loaded)
    await expect(firstCardLink).toBeVisible({ timeout: 20000 });

    // Navigate to the song detail (not implemented yet)
    const targetHref = await firstCardLink.getAttribute('href');
    expect(targetHref).toBeTruthy();
    
    await firstCardLink.click();

    // URL should change to /songs/<id>
    await page.waitForURL(new RegExp(`${targetHref?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), { timeout: 10000 });
    await expect(page).toHaveURL(/\/songs\//);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // NotFound page should be displayed for now
    await expect(page.getByText('Page not found')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('The page you are looking for does not exist.')).toBeVisible({ timeout: 5000 });
  });
});
