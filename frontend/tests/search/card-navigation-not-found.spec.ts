import { test, expect } from '@playwright/test';

// E2E-004 (current stage): Search/Recommendation card navigation goes to not-found (detail page not implemented yet)
test.describe('Search/Recommendation card navigation', () => {
  test('clicking a music card navigates to /songs/:id and shows not-found', async ({ page }) => {
    await page.goto('/test', { waitUntil: 'domcontentloaded' });

    // Wait for recommend section and at least one music card link
    const firstCardLink = page.locator('a[href^="/songs/"]').first();
    await expect(firstCardLink).toBeVisible({ timeout: 20000 });

    // Navigate to the song detail (not implemented yet)
    const targetHref = await firstCardLink.getAttribute('href');
    await firstCardLink.click();

    // URL should change to /songs/<id>
    await expect(page).toHaveURL(new RegExp(`${targetHref?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), { timeout: 8000 });
    await expect(page).toHaveURL(/\/songs\//);

    // NotFound page should be displayed for now
    await expect(page.getByText('Page not found')).toBeVisible();
    await expect(page.getByText('The page you are looking for does not exist.')).toBeVisible();
  });
});
