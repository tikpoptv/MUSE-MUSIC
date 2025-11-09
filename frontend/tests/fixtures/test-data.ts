/**
 * Test Data Fixtures for MUSE-MUSIC E2E Tests
 */

export const testUsers = {
  validUser: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    fullName: 'Test User'
  },
  newUser: {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'NewPassword123!',
    fullName: 'New User'
  },
  invalidUser: {
    username: 'invaliduser',
    password: 'wrongpassword'
  }
};

export const testData = {
  setup: {
    step1: {
      password: 'SetupPassword123!',
      confirmPassword: 'SetupPassword123!'
    },
    step2: {
      fullName: 'Setup Test User',
      country: 'Thailand',
      timezone: 'Asia/Bangkok',
      language: 'th'
    },
    step5: {
      genres: ['pop', 'rock', 'jazz']
    }
  },
  settings: {
    updatedName: 'Updated Test User',
    updatedCountry: 'United States',
    updatedTimezone: 'America/New_York',
    updatedLanguage: 'en'
  }
};

export const selectors = {
  // Login page
  login: {
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    googleButton: '[data-testid="google-auth-button"]',
    forgotPasswordLink: 'a[href="/forgot-password"]',
    registerLink: 'a[href="/register"]'
  },
  
  // Register page
  register: {
    usernameInput: 'input[name="username"]',
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    confirmPasswordInput: 'input[name="confirmPassword"]',
    fullNameInput: 'input[name="fullName"]',
    submitButton: 'button[type="submit"]'
  },
  
  // Setup pages
  setup: {
    passwordInput: 'input[name="password"]',
    confirmPasswordInput: 'input[name="confirmPassword"]',
    nextButton: 'button:has-text("Next")',
    backButton: 'button:has-text("Back")',
    skipButton: 'button:has-text("Skip")',
    completeButton: 'button:has-text("Complete")'
  },
  
  // Account/Settings pages
  account: {
    profilePicture: '[data-testid="profile-picture"]',
    editButton: 'button:has-text("Edit")',
    saveButton: 'button:has-text("Save")',
    cancelButton: 'button:has-text("Cancel")'
  },
  
  // Common elements
  common: {
    navbar: 'nav',
    userMenu: '[data-testid="user-menu"]',
    logoutButton: 'button:has-text("Logout")',
    toast: '.toast',
    loadingSpinner: '[data-testid="loading-spinner"]'
  }
};

export const urls = {
  home: '/',
  login: '/login',
  register: '/register',
  account: '/account',
  settings: '/account/settings',
  setup: {
    step1: '/setup/step1',
    step2: '/setup/step2',
    step3: '/setup/step3',
    step4: '/setup/step4',
    step5: '/setup/step5'
  }
};
