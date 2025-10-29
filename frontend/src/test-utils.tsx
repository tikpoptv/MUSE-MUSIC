import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data
export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  fullName: 'Test User',
  country: 'Thailand',
  timezone: 'Asia/Bangkok',
  language: 'th',
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockAuthToken = 'mock-jwt-token'

export const mockApiResponse = {
  success: true,
  data: mockUser,
  message: 'Success',
}

export const mockErrorResponse = {
  success: false,
  error: 'Something went wrong',
  message: 'Error occurred',
}

// Mock functions
export const mockFetch = jest.fn()
export const mockNavigate = jest.fn()
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

// Helper functions
export const createMockEvent = (type: string, value?: string) => ({
  target: { value: value || '' },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
})

export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

