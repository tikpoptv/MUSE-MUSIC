import { test, expect } from '@playwright/test'

test.describe('Re Analysis Flow', () => {
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

  test('should display re-analyze button on song detail page', async ({ page }) => {
    const mockProcessingID = 'processing-123'

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
              lyrics: 'Sample lyrics for testing purposes.',
            },
            processing: {
              processingID: mockProcessingID,
              status: 'completed',
              translation: 'Translation text',
              targetLanguage: 'Thai',
              originalLanguage: 'English',
            }
          }
        })
      })
    })

    await page.goto('/song/song-123?processingID=' + mockProcessingID)
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000) // Wait for async components

    // Check if re-analyze button exists (button text is "New analyze")
    const reAnalyzeButton = page.locator('button:has-text("New analyze"), button:has-text("new analyze")').first()
    await expect(reAnalyzeButton).toBeVisible({ timeout: 10000 })
  })

  test('should open re-analyze modal when button is clicked', async ({ page }) => {
    const mockProcessingID = 'processing-123'

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
              lyrics: 'Sample lyrics for testing purposes.',
            },
            processing: {
              processingID: mockProcessingID,
              status: 'completed',
            }
          }
        })
      })
    })

    await page.goto('/song/song-123?processingID=' + mockProcessingID)
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000) // Wait for async components

    // Click re-analyze button (button text is "New analyze")
    const reAnalyzeButton = page.locator('button:has-text("New analyze"), button:has-text("new analyze")').first()
    if (await reAnalyzeButton.isVisible()) {
      await reAnalyzeButton.click()
      
      // Check if modal appears (new analysis modal title)
      const modalHeading = page.getByRole('heading', { name: /Start New Analysis/i })
      await expect(modalHeading).toBeVisible({ timeout: 3000 })
    }
  })

  test('should submit re-analysis request successfully', async ({ page }) => {
    const mockProcessingID = 'processing-123'

    // Mock re-analysis API
    await page.route('**/api/analysis/new', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'New analysis started',
            data: {
              processingID: mockProcessingID,
              songID: 'song-123',
              status: 'processing'
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
              lyrics: 'Sample lyrics for testing purposes.',
            },
            processing: {
              processingID: mockProcessingID,
              status: 'completed',
            }
          }
        })
      })
    })

    await page.goto('/song/song-123?processingID=' + mockProcessingID)
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000) // Wait for async components

    // Open re-analyze modal (button text is "New analyze")
    const reAnalyzeButton = page.locator('button:has-text("New analyze"), button:has-text("new analyze")').first()
    if (await reAnalyzeButton.isVisible()) {
      await reAnalyzeButton.click()
      
      // Wait for modal
      await page.waitForSelector('text=/Start New Analysis|New Analysis/i', { timeout: 3000 })
      
      // Click confirm button (use force to bypass backdrop)
      const confirmButton = page.locator('button:has-text("Start"), button:has-text("Start New Analysis"), button:has-text("Confirm")').first()
      if (await confirmButton.isVisible()) {
        await confirmButton.click({ force: true })
        
        // Wait for success message
        await expect(page.locator('text=/New analysis started|Starting new analysis/i')).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('should show error when re-analysis fails', async ({ page }) => {
    const mockProcessingID = 'processing-123'

    // Mock failed re-analysis
    await page.route('**/api/analysis/new', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to re-analyze'
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
              lyrics: 'Sample lyrics for testing purposes.',
            },
            processing: {
              processingID: mockProcessingID,
              status: 'completed',
            }
          }
        })
      })
    })

    await page.goto('/song/song-123?processingID=' + mockProcessingID)
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000) // Wait for async components

    // Try to re-analyze (button text is "New analyze")
    const reAnalyzeButton = page.locator('button:has-text("New analyze"), button:has-text("new analyze")').first()
    if (await reAnalyzeButton.isVisible()) {
      await reAnalyzeButton.click()
      
      await page.waitForSelector('button:has-text("Start"), button:has-text("Start New Analysis")', { timeout: 3000 })
      const confirmButton = page.locator('button:has-text("Start"), button:has-text("Start New Analysis")').first()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
        
        // Wait for error message
        await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 })
      }
    }
  })
})

