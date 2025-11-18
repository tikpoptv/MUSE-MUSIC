import { render, RenderOptions, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import '@testing-library/jest-dom'
import type { MockResponseInit } from 'jest-fetch-mock'
import { localStorageKeys } from '@/utils/localStorageKeys'

// Setup default fetch mocks for integration tests
beforeEach(() => {
  fetchMock.resetMocks()
})

// Mock providers for integration testing
const IntegrationProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

/**
 * Renders a React element wrapped in integration test providers
 */
const integrationRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: IntegrationProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { integrationRender as render }

/**
 * Waits for an API call (promise function) and returns result after assertion
 */
export const waitForApiCall = async (apiCall: () => Promise<unknown>) => {
  const result = await apiCall()
  await waitFor(() => {
    expect(result).toBeDefined()
  })
  return result
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'

/**
 * Mocks a successful API response for a given endpoint
 */
export const mockApiResponse = (endpoint: string, response: unknown, init?: MockResponseInit) => {
  fetchMock.mockIf((req) => req.url === `${API_BASE_URL}${endpoint}`, async () => ({
    body: JSON.stringify(response),
    status: init?.status ?? 200,
    headers: init?.headers as Record<string, string> | undefined,
  }))
}

/**
 * Mocks an error API response for a given endpoint
 */
export const mockApiError = (endpoint: string, status: number = 500, errorMessage: string = 'Mock error') => {
  fetchMock.mockIf((req) => req.url === `${API_BASE_URL}${endpoint}`, async () => ({
    body: JSON.stringify({ success: false, error: errorMessage }),
    status,
    headers: { 'content-type': 'application/json' },
  }))
}

/**
 * Seeds authentication tokens and user/session into localStorage for testing.
 */
export const seedAuth = (token: string, user?: unknown, tokensObj?: unknown) => {
  localStorage.setItem(localStorageKeys.AUTH_TOKEN, token)
  if (user) localStorage.setItem(localStorageKeys.USER_DATA, JSON.stringify(user))
  if (tokensObj) localStorage.setItem(localStorageKeys.TOKENS_DATA, JSON.stringify(tokensObj))
}

/**
 * Clears authentication/session related keys from localStorage.
 */
export const clearAuth = () => {
  localStorage.removeItem(localStorageKeys.AUTH_TOKEN)
  localStorage.removeItem(localStorageKeys.USER_DATA)
  localStorage.removeItem(localStorageKeys.SESSION_DATA)
  localStorage.removeItem(localStorageKeys.TOKENS_DATA)
}

// Add a dummy test to prevent "no tests" error
describe('Integration Test Utils', () => {
  it('should export test utilities', () => {
    expect(integrationTestData).toBeDefined()
    expect(mockApiResponse).toBeDefined()
    expect(mockApiError).toBeDefined()
  })
})

// Test data for integration tests
export const integrationTestData = {
  user: {
    userID: '1',
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    profilePicture: '',
    provider: 'local',
    providerID: '',
    providerEmail: '',
    role: 'user',
    loginStatus: 'active',
    setupCompleted: true,
    setupSkipped: false,
    termsAccepted: true,
    registerDate: '2024-01-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  
  authToken: 'mock-jwt-token',
  
  setupData: {
    step1: {
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    },
    step2: {
      fullName: 'Test User',
      country: 'Thailand',
      timezone: 'Asia/Bangkok',
      language: 'th'
    },
    step5: {
      genres: ['pop', 'rock', 'jazz']
    }
  }
}

// Type definition for Playwright page
interface PlaywrightPage {
  fill: (selector: string, value: string) => Promise<void>
  click: (selector: string) => Promise<void>
  goto: (url: string) => Promise<void>
  waitForLoadState: (state: string) => Promise<void>
}

/**
 * Simulates basic user flows for Playwright-based tests
 */
export const simulateUserFlow = {
  async login(page: PlaywrightPage) {
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
  },

  async navigateToSetup(page: PlaywrightPage) {
    await page.goto('/setup/step1')
    await page.waitForLoadState('networkidle')
  },

  async completeSetupStep1(page: PlaywrightPage) {
    await page.fill('input[name="password"]', integrationTestData.setupData.step1.password)
    await page.fill('input[name="confirmPassword"]', integrationTestData.setupData.step1.confirmPassword)
    await page.click('button:has-text("Next")')
  }
}
