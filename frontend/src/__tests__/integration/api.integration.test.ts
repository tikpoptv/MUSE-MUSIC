import apiService from '@/services/api'
import { authService } from '@/services/authService'
import { integrationTestData, mockApiResponse, mockApiError } from './test-utils'

// Type definitions for test responses
interface TestApiResponse {
  data?: {
    data?: {
      status?: string
      user?: {
        userID: string
        email: string
      }
      message?: string
    }
  }
}

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('AuthService Integration', () => {
    it('should handle complete login flow', async () => {
      // Mock successful login
      mockApiResponse('/api/auth/login', {
        token: integrationTestData.authToken,
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }
      })

      const result = await authService.login('test@example.com', 'password123')
      
      expect(result).toBeTruthy()
      expect(result?.token).toBe(integrationTestData.authToken)
      expect(authService.getStoredToken()).toBe(integrationTestData.authToken)
    })

    it('should handle login failure', async () => {
      // Mock failed login
      mockApiError('/api/auth/login', 401, 'Invalid credentials')

      const result = await authService.login('wrong@example.com', 'wrongpassword')
      
      expect(result).toBeNull()
      expect(authService.getStoredToken()).toBeNull()
    })

    it('should handle token validation', async () => {
      // Set up valid token
      authService.setToken(integrationTestData.authToken)
      
      // Mock successful validation
      mockApiResponse('/api/auth/me', {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      })

      const result = await authService.validateToken()
      
      expect(result).toBeTruthy()
      expect(result?.email).toBe('test@example.com')
    })

    it('should handle logout flow', async () => {
      // Set up authenticated state
      authService.setToken(integrationTestData.authToken)
      authService.setUserData(integrationTestData.user)
      
      // Mock successful logout
      mockApiResponse('/api/auth/logout', { success: true })

      const result = await authService.logout()
      
      expect(result.success).toBe(true)
      expect(authService.getStoredToken()).toBeNull()
      expect(authService.getUserData()).toBeNull()
    })
  })

  describe('ApiService Integration', () => {
    it('should handle successful GET request', async () => {
      mockApiResponse('/api/health', { 
        success: true,
        data: { status: 'healthy' }
      })
      const response = await apiService.get('/api/health')
      
      expect(response.success).toBe(true)
      expect((response.data as TestApiResponse['data'])?.data).toHaveProperty('status')
      expect((response.data as TestApiResponse['data'])?.data?.status).toBe('healthy')
    })

    it('should handle successful POST request', async () => {
      const testData = { name: 'Test', email: 'test@example.com' }
      
      mockApiResponse('/api/test', { 
        success: true, 
        data: testData
      })

      const response = await apiService.post('/api/test', testData)
      
      expect(response.success).toBe(true)
      expect((response.data as TestApiResponse['data'])?.data).toEqual(testData)
    })

    it('should handle API errors', async () => {
      mockApiResponse('/api/error', { success: false, error: 'Test error' }, { status: 500 })
      const response = await apiService.get('/api/error')
      
      expect(response.success).toBe(false)
      expect(response.error).toBe('Test error')
    })

    it('should handle unauthorized requests', async () => {
      mockApiResponse('/api/unauthorized', { success: false, error: 'Unauthorized' }, { status: 401 })
      const response = await apiService.get('/api/unauthorized')
      
      expect(response.success).toBe(false)
      expect(response.error).toBe('Unauthorized')
    })

    it('should include auth token in requests when available', async () => {
      // Set auth token
      apiService.setAuthToken(integrationTestData.authToken)
      
      let capturedHeaders: HeadersInit = {}
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'
      fetchMock.mockIf(
        (req) => req.url === `${API_BASE_URL}/api/protected`,
        async (req) => {
          capturedHeaders = Object.fromEntries(req.headers.entries())
          return {
            body: JSON.stringify({ success: true }),
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        }
      )

      await apiService.get('/api/protected')
      
      expect(capturedHeaders).toHaveProperty('authorization')
      expect(capturedHeaders.authorization).toBe(`Bearer ${integrationTestData.authToken}`)
    })
  })

  describe('User Service Integration', () => {
    it('should fetch user profile', async () => {
      // Set auth token
      authService.setToken(integrationTestData.authToken)
      
      mockApiResponse('/api/user/me', { 
        success: true,
        data: { user: integrationTestData.user }
      })
      const response = await apiService.get('/api/user/me')
      
      expect(response.success).toBe(true)
      expect((response.data as TestApiResponse['data'])?.data?.user).toHaveProperty('userID')
      expect((response.data as TestApiResponse['data'])?.data?.user?.email).toBe('test@example.com')
    })

    it('should handle user profile fetch failure', async () => {
      // Mock API error
      mockApiResponse('/api/user/me', { success: false, error: 'User not found' }, { status: 404 })

      const response = await apiService.get('/api/user/me')
      
      expect(response.success).toBe(false)
      expect(response.error).toBe('User not found')
    })
  })

  describe('Setup Service Integration', () => {
    it('should complete setup step 1', async () => {
      const setupData = integrationTestData.setupData.step1
      
      mockApiResponse('/api/setup/step1', { 
        success: true,
        data: { message: 'Setup completed successfully' }
      })
      const response = await apiService.post('/api/setup/step1', setupData)
      
      expect(response.success).toBe(true)
      expect((response.data as TestApiResponse['data'])?.data?.message).toBe('Setup completed successfully')
    })

    it('should complete setup step 2', async () => {
      const setupData = integrationTestData.setupData.step2
      
      mockApiResponse('/api/setup/step2', { 
        success: true,
        data: { message: 'Setup completed successfully' }
      })
      const response = await apiService.post('/api/setup/step2', setupData)
      
      expect(response.success).toBe(true)
      expect((response.data as TestApiResponse['data'])?.data?.message).toBe('Setup completed successfully')
    })

    it('should complete setup step 5', async () => {
      const setupData = integrationTestData.setupData.step5
      
      mockApiResponse('/api/setup/step5', { 
        success: true,
        data: { message: 'Setup completed successfully' }
      })
      const response = await apiService.post('/api/setup/step5', setupData)
      
      expect(response.success).toBe(true)
      expect((response.data as TestApiResponse['data'])?.data?.message).toBe('Setup completed successfully')
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      fetchMock.mockRejectOnce(new Error('Network error'))

      const response = await apiService.get('/api/network-error')
      
      expect(response.success).toBe(false)
      expect(response.error).toContain('Network error')
    })

    it('should handle malformed JSON responses', async () => {
      // Mock malformed JSON
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'
      fetchMock.mockIf(
        (req) => req.url === `${API_BASE_URL}/api/malformed`,
        async () => ({
          body: 'invalid json',
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      const response = await apiService.get('/api/malformed')
      
      expect(response.success).toBe(false)
      expect(response.error).toContain('invalid json')
    })
  })
})
