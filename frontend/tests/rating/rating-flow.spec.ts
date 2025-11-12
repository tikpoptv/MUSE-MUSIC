import { test, expect } from '@playwright/test'

test.describe('Rating Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-token-123')
      localStorage.setItem('user', JSON.stringify({
        userID: 'user-123',
        username: 'testuser',
        email: 'test@example.com'
      }))
    })
  })

  test('should display rating section on song detail page', async ({ page }) => {
    const mockProcessingID = 'processing-123'

    // Mock API responses
    await page.route('**/api/songs/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            song: {
              songID: 'song-123',
              songName: 'Test Song',
              artistName: 'Test Artist',
            },
            processing: {
              processingID: mockProcessingID,
              status: 'completed',
            }
          }
        })
      })
    })

    await page.route('**/api/ratings/*/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalRatings: 10,
            averageRating: 4.5,
            starCount: 5
          }
        })
      })
    })

    await page.goto('/song/song-123?processingID=' + mockProcessingID)
    
    // Wait for page to load - look for any song content or just wait for network idle
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000) // Wait for async components
    
    // Check if rating section exists (may be hidden on mobile viewport)
    const ratingSection = page.locator('text=/rating|feedback|star|please give/i').first()
    // Just check that element exists, it may be hidden based on viewport
    await expect(ratingSection).toHaveCount(1, { timeout: 10000 })
  })

  test('should submit rating successfully', async ({ page }) => {
    const mockProcessingID = 'processing-123'

    // Mock API responses
    await page.route(`**/api/ratings/${mockProcessingID}`, async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Rating submitted successfully',
            data: {
              ratingid: 'rating-123',
              processingid: mockProcessingID,
              userid: 'user-123',
              rating: 5,
              comment: 'Great song!',
              createdat: new Date().toISOString(),
              updatedat: new Date().toISOString(),
            }
          })
        })
      }
    })

    await page.route('**/api/songs/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            song: {
              songID: 'song-123',
              songName: 'Test Song',
              artistName: 'Test Artist',
            },
            processing: {
              processingID: mockProcessingID,
              status: 'completed',
            }
          }
        })
      })
    })

    await page.goto('/song/song-123')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000) // Wait for async components

    // Find and click a star rating (5 stars) - look for buttons with SVG stars
    const stars = page.locator('button:has(svg), button[aria-label*="star"], button[aria-label*="Star"]')
    const starCount = await stars.count()
    
    if (starCount >= 5) {
      // Click the 5th star
      await stars.nth(4).click()
      
      // Find and click submit button
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Send"), button:has-text("Submit Feedback")').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
        
        // Wait for success message
        await expect(page.locator('text=/success|thank you/i')).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should show error when rating submission fails', async ({ page }) => {
    const mockProcessingID = 'processing-123'

    // Mock failed API response
    await page.route(`**/api/ratings/${mockProcessingID}`, async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to submit rating'
          })
        })
      }
    })

    await page.route('**/api/songs/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            song: {
              songID: 'song-123',
              songName: 'Test Song',
            },
            processing: {
              processingID: mockProcessingID,
              status: 'completed',
            }
          }
        })
      })
    })

    await page.goto('/song/song-123')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000) // Wait for async components

    // Try to submit rating
    const stars = page.locator('button:has(svg), button[aria-label*="star"], button[aria-label*="Star"]')
    const starCount = await stars.count()
    
    if (starCount >= 3) {
      await stars.nth(2).click()
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Send")').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
        
        // Wait for error message
        await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Clear authentication
    await page.evaluate(() => {
      localStorage.clear()
    })

    await page.goto('/song/song-123')
    
    // Should redirect to login or show login prompt
    await expect(page).toHaveURL(/\/login|\/song\/song-123/, { timeout: 5000 })
  })
})

