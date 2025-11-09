import { userService } from '@/services/userService'
import { authService } from '@/services/authService'
import { integrationTestData, mockApiResponse } from './test-utils'

describe('Service Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('UserService Integration', () => {
    it('should fetch user settings successfully', async () => {
      // Set up authenticated state
      authService.setToken(integrationTestData.authToken)
      
      const mockSettings = {
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        profilePicture: null,
        country: 'Thailand',
        timezone: 'Asia/Bangkok',
        language: 'th',
        provider: 'local'
      }

      // Mock successful settings fetch
      mockApiResponse('/api/user/settings', {
        success: true,
        message: 'Settings fetched successfully',
        data: { settings: mockSettings },
      })

      const settings = await userService.getUserSettings()
      
      expect(settings).toEqual(mockSettings)
      expect(settings.username).toBe('testuser')
      expect(settings.country).toBe('Thailand')
    })

    it('should handle user settings fetch failure', async () => {
      // Mock API error
      mockApiResponse('/api/user/settings', { success: false, error: 'User not found' }, { status: 404 })

      await expect(userService.getUserSettings()).rejects.toThrow('User not found')
    })

    it('should update user settings successfully', async () => {
      // Set up authenticated state
      authService.setToken(integrationTestData.authToken)
      
      const updateData = {
        username: 'updateduser',
        fullName: 'Updated User',
        country: 'United States'
      }

      const updatedSettings = {
        username: 'updateduser',
        email: 'test@example.com',
        fullName: 'Updated User',
        profilePicture: null,
        country: 'United States',
        timezone: 'Asia/Bangkok',
        language: 'th',
        provider: 'local'
      }

      // Mock successful settings update
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'
      fetchMock.mockIf(
        (req) => req.url === `${API_BASE_URL}/api/user/settings` && req.method === 'PUT',
        async () => ({
          body: JSON.stringify({
            success: true,
            message: 'Settings updated successfully',
            data: { settings: updatedSettings },
          }),
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      const settings = await userService.updateUserSettings(updateData)
      
      expect(settings).toEqual(updatedSettings)
      expect(settings.username).toBe('updateduser')
      expect(settings.fullName).toBe('Updated User')
      expect(settings.country).toBe('United States')
    })

    it('should handle user settings update failure', async () => {
      const updateData = {
        username: 'invaliduser'
      }

      // Mock API error
      mockApiResponse('/api/user/settings', { success: false, error: 'Username already exists' }, { status: 400 })

      await expect(userService.updateUserSettings(updateData)).rejects.toThrow('Username already exists')
    })

    it('should reset password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
      }

      // Mock successful password reset
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'
      fetchMock.mockIf(
        (req) => req.url === `${API_BASE_URL}/api/user/reset-password` && req.method === 'POST',
        async () => ({
          body: JSON.stringify({ success: true, message: 'Password reset successfully' }),
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      await expect(userService.resetPassword(passwordData)).resolves.not.toThrow()
    })

    it('should handle password reset failure', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      }

      // Mock API error
      mockApiResponse('/api/user/reset-password', { success: false, error: 'Current password is incorrect' }, { status: 400 })

      await expect(userService.resetPassword(passwordData)).rejects.toThrow('Current password is incorrect')
    })
  })

  describe('AuthService Integration with UserService', () => {
    it('should maintain authentication state across service calls', async () => {
      // Set up authenticated state
      authService.setToken(integrationTestData.authToken)
      authService.setUserData(integrationTestData.user)

      // Mock user settings API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'
      fetchMock.mockIf(
        (req) => req.url === `${API_BASE_URL}/api/user/settings` && req.method === 'GET',
        async (req) => {
          const authHeader = req.headers.get('authorization')
          if (!authHeader || !authHeader.includes(integrationTestData.authToken)) {
            return {
              body: JSON.stringify({ success: false, error: 'Unauthorized' }),
              status: 401,
              headers: { 'content-type': 'application/json' },
            }
          }
          return {
            body: JSON.stringify({
              success: true,
              data: {
                settings: {
                  username: 'testuser',
                  email: 'test@example.com',
                  fullName: 'Test User',
                  profilePicture: null,
                  country: 'Thailand',
                  timezone: 'Asia/Bangkok',
                  language: 'th',
                  provider: 'local',
                },
              },
            }),
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        }
      )

      const settings = await userService.getUserSettings()
      
      expect(settings).toBeDefined()
      expect(settings.username).toBe('testuser')
    })

    it('should handle token expiration during service call', async () => {
      // Set up expired token
      authService.setToken('expired-token')

      // Mock token expiration
      mockApiResponse('/api/user/settings', { success: false, error: 'Token expired' }, { status: 401 })

      await expect(userService.getUserSettings()).rejects.toThrow('Session expired, please login again')
    })
  })

  describe('Service Error Handling Integration', () => {
    it('should handle network timeout', async () => {
      // Mock network timeout
      fetchMock.mockRejectOnce(new Error('Network error'))

      await expect(userService.getUserSettings()).rejects.toThrow()
    })

    it('should handle malformed response', async () => {
      // Mock malformed response
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'
      fetchMock.mockIf(
        (req) => req.url === `${API_BASE_URL}/api/user/settings` && req.method === 'GET',
        async () => ({
          body: 'invalid json',
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      await expect(userService.getUserSettings()).rejects.toThrow()
    })

    it('should handle server error', async () => {
      // Mock server error
      mockApiResponse('/api/user/settings', { success: false, error: 'Internal server error' }, { status: 500 })

      await expect(userService.getUserSettings()).rejects.toThrow('Internal server error')
    })
  })

  describe('Service State Management Integration', () => {
    it('should update local state after successful settings update', async () => {
      // Set up authenticated state
      authService.setToken(integrationTestData.authToken)
      authService.setUserData(integrationTestData.user)

      const updateData = {
        fullName: 'Updated Name'
      }

      const updatedSettings = {
        ...integrationTestData.user,
        fullName: 'Updated Name'
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'
      fetchMock.mockIf(
        (req) => req.url === `${API_BASE_URL}/api/user/settings` && req.method === 'PUT',
        async () => ({
          body: JSON.stringify({
            success: true,
            data: { settings: updatedSettings },
          }),
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      const settings = await userService.updateUserSettings(updateData)
      
      expect(settings.fullName).toBe('Updated Name')
      
      // Verify local state is still intact
      expect(authService.getUserData()).toBeTruthy()
      expect(authService.getStoredToken()).toBe(integrationTestData.authToken)
    })

    it('should maintain service consistency across multiple calls', async () => {
      // Set up authenticated state
      authService.setToken(integrationTestData.authToken)

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'
      let callCount = 0
      fetchMock.mockIf(
        (req) => req.url === `${API_BASE_URL}/api/user/settings` && req.method === 'GET',
        async () => {
          callCount++
          return {
            body: JSON.stringify({
              success: true,
              data: {
                settings: {
                  username: 'testuser',
                  email: 'test@example.com',
                  fullName: 'Test User',
                  profilePicture: null,
                  country: 'Thailand',
                  timezone: 'Asia/Bangkok',
                  language: 'th',
                  provider: 'local',
                },
              },
            }),
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        }
      )

      // Make multiple calls
      const settings1 = await userService.getUserSettings()
      const settings2 = await userService.getUserSettings()
      
      expect(settings1).toEqual(settings2)
      expect(callCount).toBe(2)
    })
  })
})
