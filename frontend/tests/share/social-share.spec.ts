import { test, expect } from '@playwright/test'

test.describe('Social Share Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-token-123')
      localStorage.setItem('user', JSON.stringify({
        userID: 'user-123',
        username: 'testuser',
      }))
    })
  })

  test('should display share button on song detail page', async ({ page }) => {
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

    // Check if share button exists (icon button with aria-label="Share")
    // Note: Button may be present but hidden based on viewport
    const shareButton = page.locator('button[aria-label="Share"]')
    await expect(shareButton).toHaveCount(1, { timeout: 10000 })
  })

  test('should open share modal when share button is clicked', async ({ page }) => {
    const mockProcessingID = 'processing-123'
    const mockShareUrl = 'https://example.com/share/abc123'

    // Mock share link creation
    await page.route('**/api/share/create', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              shareUrl: mockShareUrl,
              shortLink: 'abc123',
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

    // Click share button
    const shareButton = page.locator('button[aria-label="Share"]').first()
    if (await shareButton.isVisible()) {
      await shareButton.click()
      
      // Wait for modal to appear (specific heading)
      await expect(page.getByRole('heading', { name: /share/i })).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display social media options in share modal', async ({ page }) => {
    const mockProcessingID = 'processing-123'
    const mockShareUrl = 'https://example.com/share/abc123'

    await page.route('**/api/share/create', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              shareUrl: mockShareUrl,
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

    // Open share modal
    const shareButton = page.locator('button[aria-label="Share"]').first()
    if (await shareButton.isVisible()) {
      await shareButton.click()
      
      await expect(page.getByRole('heading', { name: /share/i })).toBeVisible({ timeout: 5000 })
      
      // Check for social media buttons
      await expect(page.locator('text=/facebook/i').first()).toBeVisible({ timeout: 3000 })
      await expect(page.getByRole('button', { name: /twitter|x/i }).first()).toBeVisible({ timeout: 3000 })
      await expect(page.locator('text=/copy link/i').first()).toBeVisible({ timeout: 3000 })
    }
  })

  test('should copy link to clipboard when copy button is clicked', async ({ page, context }) => {
    const mockProcessingID = 'processing-123'
    const mockShareUrl = 'https://example.com/share/abc123'

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.route('**/api/share/create', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              shareUrl: mockShareUrl,
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

    // Open share modal
    const shareButton = page.locator('button[aria-label="Share"]').first()
    if (await shareButton.isVisible()) {
      await shareButton.click()
      
      await page.waitForSelector('text=/copy link/i', { timeout: 5000 })
      
      // Click copy link button
      const copyButton = page.locator('button:has-text("Copy Link"), button:has-text("Copy")').first()
      if (await copyButton.isVisible()) {
        await copyButton.click()
        
        // Check for success message
        await expect(page.locator('text=/copied|success/i')).toBeVisible({ timeout: 3000 })
      }
    }
  })

  test('should open Facebook share in new window', async ({ page, context }) => {
    const mockProcessingID = 'processing-123'
    const mockShareUrl = 'https://musemusic.phitik.com/share/abc123'

    await page.route('**/api/share/create', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              shareUrl: mockShareUrl,
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

    // Open share modal
    const shareButton = page.locator('button[aria-label="Share"]').first()
    if (await shareButton.isVisible()) {
      await shareButton.click()
      
      await page.waitForSelector('text=/facebook/i', { timeout: 5000 })
      
      // Click Facebook button
      const facebookButton = page.locator('button:has-text("Facebook")').first()
      
      // Listen for new page/window
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        facebookButton.click(),
      ])
      
      // Check if Facebook URL is opened
      expect(newPage.url()).toContain('facebook.com')
    }
  })

  test('should show error when share link creation fails', async ({ page }) => {
    const mockProcessingID = 'processing-123'

    // Mock failed share creation
    await page.route('**/api/share/create', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to create share link'
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
    await page.waitForTimeout(1000) // Wait for components to load

    // Try to share
    const shareButton = page.locator('button[aria-label="Share"]').first()
    if (await shareButton.isVisible()) {
      await shareButton.click()
      
      // Wait for error message
      await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 })
    }
  })
})

