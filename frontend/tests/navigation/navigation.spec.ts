import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should load home page with correct content', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/MUSE MUSIC/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('MUSE');
    await expect(page.locator('h2').first()).toContainText('Music');
    
    // Check "Coming Soon" indicator
    await expect(page.locator('text=Coming Soon')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page).toHaveTitle(/MUSE MUSIC/);
    
    // Check login form elements
    await expect(page.locator('h1')).toContainText('Sign in');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check navigation links
    await expect(page.locator('a[href="/register"]')).toBeVisible();
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    
    // Check page title
    await expect(page).toHaveTitle(/MUSE MUSIC/);
    
    // Check register form elements
    await expect(page.locator('h1')).toContainText('Create your account');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check navigation links - only visible on desktop
    const viewport = page.viewportSize();
    if (viewport && viewport.width > 1100) {
      await expect(page.locator('a[href="/login"]').first()).toBeVisible();
    } else {
      // On mobile, login link should be in mobile menu
      await expect(page.locator('#hamburger-button')).toBeVisible();
    }
  });

  test('should show navbar with correct elements', async ({ page }) => {
    await page.goto('/');
    
    // Check navbar elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav span:has-text("MUSE MUSIC")')).toBeVisible();
    
    // Check viewport size to determine which elements should be visible
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width <= 1100;
    
    if (isMobile) {
      // Mobile view - check hamburger menu and mobile menu
      await expect(page.locator('#hamburger-button')).toBeVisible();
      
      // Click hamburger menu to open mobile menu
      await page.click('#hamburger-button');
      
      // Check mobile menu items
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();
      await expect(mobileMenu.locator('a[href="/"]')).toBeVisible();
      await expect(mobileMenu.locator('a[href="/for-you"]')).toBeVisible();
      await expect(mobileMenu.locator('a[href="/archive"]')).toBeVisible();
      
      // Check search bar in mobile menu
      await expect(page.locator('input[placeholder*="Search song"]').first()).toBeVisible();
      
      // Check sign in button in mobile menu
      await expect(mobileMenu.locator('a[href="/login"]')).toBeVisible();
    } else {
      // Desktop view - check desktop navigation
      await expect(page.locator('a[href="/"]').first()).toBeVisible();
      await expect(page.locator('a[href="/for-you"]').first()).toBeVisible();
      await expect(page.locator('a[href="/archive"]').first()).toBeVisible();
      
      // Check search bar (should be visible on home page)
      await expect(page.locator('input[placeholder*="Search song"]').first()).toBeVisible();
      
      // Check sign in button
      await expect(page.locator('a[href="/login"]').first()).toBeVisible();
    }
  });

  test('should handle navigation between pages', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    
    // Check viewport size to determine navigation method
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width <= 1100;
    
    if (isMobile) {
      // Mobile navigation - use hamburger menu for login
      await page.click('#hamburger-button');
      await page.click('#mobile-menu a[href="/login"]');
      await expect(page).toHaveURL(/\/login/);
      
      // Navigate to register from login page using the "Create an account" link
      await page.click('a[href="/register"]');
      await expect(page).toHaveURL('/register');
      
      // Navigate back to login using hamburger menu
      await page.click('#hamburger-button');
      await page.click('#mobile-menu a[href="/login"]');
      await expect(page).toHaveURL(/\/login/);
    } else {
      // Desktop navigation - use navbar links
      await page.click('a[href="/login"]');
      
      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/login');
      
      // Navigate to register from login page
      await page.click('a[href="/register"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/register/);
      
      // Navigate back to login
      await page.click('a[href="/login"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should show responsive mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for page to fully load and React to hydrate
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for Navbar component to mount and resize handler to run
    // The resize handler sets display style via useEffect
    await page.waitForTimeout(1000); // Allow useEffect to run
    
    // Check if hamburger menu is visible on mobile
    const hamburgerButton = page.locator('#hamburger-button');
    
    // Wait for the element to exist and have display style set to inline-flex or block
    await page.waitForFunction(() => {
      const el = document.querySelector('#hamburger-button');
      if (!el) return false;
      const style = getComputedStyle(el);
      return style.display !== 'none';
    }, { timeout: 15000 });
    
    await expect(hamburgerButton).toBeVisible({ timeout: 5000 });
    
    // Click hamburger menu
    await hamburgerButton.click();
    
    // Wait for mobile menu animation to complete
    await page.waitForTimeout(300);
    
    // Check if mobile menu is expanded
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });
    
    // Check mobile menu items
    await expect(mobileMenu.locator('a[href="/"]')).toBeVisible({ timeout: 5000 });
    await expect(mobileMenu.locator('a[href="/for-you"]')).toBeVisible({ timeout: 5000 });
    await expect(mobileMenu.locator('a[href="/archive"]')).toBeVisible({ timeout: 5000 });
  });
});
