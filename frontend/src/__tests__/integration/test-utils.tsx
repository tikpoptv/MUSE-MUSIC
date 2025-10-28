import { render, RenderOptions, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import '@testing-library/jest-dom'
import type { MockResponseInit } from 'jest-fetch-mock'

// Setup default fetch mocks for integration tests
beforeEach(() => {
  fetchMock.resetMocks()
})

// Mock providers for integration testing
const IntegrationProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const integrationRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: IntegrationProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { integrationRender as render }

// Integration test utilities
export const waitForApiCall = async (apiCall: () => Promise<unknown>) => {
  const result = await apiCall()
  await waitFor(() => {
    expect(result).toBeDefined()
  })
  return result
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'

export const mockApiResponse = (endpoint: string, response: unknown, init?: MockResponseInit) => {
  fetchMock.mockIf((req) => req.url === `${API_BASE_URL}${endpoint}`, async () => ({
    body: JSON.stringify(response),
    status: init?.status ?? 200,
    headers: init?.headers as Record<string, string> | undefined,
  }))
}

export const mockApiError = (endpoint: string, status: number = 500, errorMessage: string = 'Mock error') => {
  fetchMock.mockIf((req) => req.url === `${API_BASE_URL}${endpoint}`, async () => ({
    body: JSON.stringify({ success: false, error: errorMessage }),
    status,
    headers: { 'content-type': 'application/json' },
  }))
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

// Helper to simulate user interactions
export const simulateUserFlow = {
  async login(page: unknown) {
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
  },

  async navigateToSetup(page: unknown) {
    await page.goto('/setup/step1')
    await page.waitForLoadState('networkidle')
  },

  async completeSetupStep1(page: unknown) {
    await page.fill('input[name="password"]', integrationTestData.setupData.step1.password)
    await page.fill('input[name="confirmPassword"]', integrationTestData.setupData.step1.confirmPassword)
    await page.click('button:has-text("Next")')
  }
}
