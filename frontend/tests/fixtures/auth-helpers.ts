/**
 * Authentication Helper Functions for MUSE-MUSIC E2E Tests
 */

import { Page, expect } from '@playwright/test';
import { testUsers, selectors, urls } from './test-data';

export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Login with valid credentials
   */
  async loginWithValidUser() {
    await this.page.goto(urls.login);
    await this.page.fill(selectors.login.usernameInput, testUsers.validUser.username);
    await this.page.fill(selectors.login.passwordInput, testUsers.validUser.password);
    await this.page.click(selectors.login.submitButton);
    
    // Wait for redirect to home page
    await this.page.waitForURL(urls.home);
    await expect(this.page).toHaveURL(urls.home);
  }

  /**
   * Login with invalid credentials
   */
  async loginWithInvalidUser() {
    await this.page.goto(urls.login);
    await this.page.fill(selectors.login.usernameInput, testUsers.invalidUser.username);
    await this.page.fill(selectors.login.passwordInput, testUsers.invalidUser.password);
    await this.page.click(selectors.login.submitButton);
  }

  /**
   * Register a new user
   */
  async registerNewUser() {
    await this.page.goto(urls.register);
    await this.page.fill(selectors.register.usernameInput, testUsers.newUser.username);
    await this.page.fill(selectors.register.emailInput, testUsers.newUser.email);
    await this.page.fill(selectors.register.passwordInput, testUsers.newUser.password);
    await this.page.fill(selectors.register.confirmPasswordInput, testUsers.newUser.password);
    await this.page.fill(selectors.register.fullNameInput, testUsers.newUser.fullName);
    await this.page.click(selectors.register.submitButton);
  }

  /**
   * Logout from the application
   */
  async logout() {
    // Click on user menu if it exists
    const userMenu = this.page.locator(selectors.common.userMenu);
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await this.page.click(selectors.common.logoutButton);
    } else {
      // Clear localStorage as fallback
      try {
        await this.page.evaluate(() => {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        });
      } catch {
        console.log('localStorage access not available for logout');
      }
    }
  }

  /**
   * Clear authentication data
   */
  async clearAuth() {
    try {
      await this.page.evaluate(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('refresh_token');
        }
      });
    } catch {
      // Ignore localStorage access errors in test environment
      console.log('localStorage access not available in test environment');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.page.evaluate(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage.getItem('auth_token');
        }
        return null;
      });
      return token !== null;
    } catch {
      return false;
    }
  }

  /**
   * Wait for toast message to appear
   */
  async waitForToast(message?: string) {
    const toast = this.page.locator(selectors.common.toast);
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading() {
    const spinner = this.page.locator(selectors.common.loadingSpinner);
    if (await spinner.isVisible()) {
      await spinner.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }
}

/**
 * Setup Helper Functions
 */
export class SetupHelpers {
  constructor(private page: Page) {}

  /**
   * Complete setup step 1 (password setup)
   */
  async completeStep1(password: string = 'SetupPassword123!') {
    await this.page.goto(urls.setup.step1);
    await this.page.fill(selectors.setup.passwordInput, password);
    await this.page.fill(selectors.setup.confirmPasswordInput, password);
    await this.page.click(selectors.setup.nextButton);
  }

  /**
   * Complete setup step 2 (personal info)
   */
  async completeStep2() {
    await this.page.waitForURL(urls.setup.step2);
    // Fill personal information
    await this.page.fill('input[name="fullName"]', 'Setup Test User');
    await this.page.selectOption('select[name="country"]', 'Thailand');
    await this.page.selectOption('select[name="timezone"]', 'Asia/Bangkok');
    await this.page.selectOption('select[name="language"]', 'th');
    await this.page.click(selectors.setup.nextButton);
  }

  /**
   * Complete setup step 5 (music genres)
   */
  async completeStep5(genres: string[] = ['pop', 'rock', 'jazz']) {
    await this.page.waitForURL(urls.setup.step5);
    
    // Select genres
    for (const genre of genres) {
      await this.page.click(`[data-testid="genre-${genre}"]`);
    }
    
    await this.page.click(selectors.setup.completeButton);
  }

  /**
   * Complete entire setup flow
   */
  async completeSetupFlow() {
    await this.completeStep1();
    await this.completeStep2();
    // Skip steps 3 and 4 if they exist
    await this.completeStep5();
    
    // Wait for redirect to home
    await this.page.waitForURL(urls.home);
  }
}

/**
 * Common Helper Functions
 */
export class CommonHelpers {
  constructor(private page: Page) {}

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return await this.page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }
}
