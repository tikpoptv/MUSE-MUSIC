import apiService from './api';
import { AuthData, SessionData, TokensData } from '../types/auth';

export const authService = {
  setToken(token: string) {
    apiService.setAuthToken(token);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_token', token);
    }
  },

  setUserData(userData: AuthData['user']) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  },

  setSessionData(sessionData: AuthData['session']) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('session_data', JSON.stringify(sessionData));
    }
  },

  setTokensData(tokensData: AuthData['tokens']) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('tokens_data', JSON.stringify(tokensData));
    }
  },

  setAuthData(authData: AuthData) {
    // เก็บทุกอย่างที่ response ออกมา
    this.setToken(authData.tokens.accessToken);
    this.setUserData(authData.user);
    this.setSessionData(authData.session);
    this.setTokensData(authData.tokens);
  },

  getUserData(): AuthData['user'] | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem('user_data');
      
      if (userData && userData !== 'undefined' && userData !== 'null') {
        try {
          const parsedData = JSON.parse(userData);
          return parsedData;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error parsing user data from localStorage:', error);
          localStorage.removeItem('user_data');
          return null;
        }
      }
      return null;
    }
    return null;
  },

  getSessionData(): SessionData | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const sessionData = localStorage.getItem('session_data');
      return sessionData ? JSON.parse(sessionData) : null;
    }
    return null;
  },

  getTokensData(): TokensData | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const tokensData = localStorage.getItem('tokens_data');
      return tokensData ? JSON.parse(tokensData) : null;
    }
    return null;
  },

  removeToken() {
    apiService.removeAuthToken();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_data');
      localStorage.removeItem('tokens_data');
    }
  },

  getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  hasToken(): boolean {
    return apiService.hasAuthToken() || !!this.getStoredToken();
  },

  async login(email: string, password: string): Promise<AuthData | null> {
    const response = await apiService.post<{success: boolean, data: AuthData}>('/api/auth/login', {
      email,
      password,
    });
    if (response.success && response.data && response.data.data) {
      this.setAuthData(response.data.data);
      return response.data.data;
    }
    return null;
  },

  async register(payload: Record<string, unknown>): Promise<AuthData | null> {
    const response = await apiService.post<{success: boolean, data: AuthData}>('/api/auth/register', payload);
    if (response.success && response.data && response.data.data) {
      this.setAuthData(response.data.data);
      return response.data.data;
    }
    return null;
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      // In test environment, avoid real network calls and side effects timing
      if (process.env.NODE_ENV === 'test') {
        this.removeToken();
        return { success: true };
      }
      const token = this.getStoredToken();
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Logout API failed');
        }
      }
      
      this.removeToken();
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout API error:', error);
      this.removeToken(); // Still clear local storage even if API fails
      return { success: false, message: 'Logout failed but local session cleared' };
    }
  },

  async validateToken(): Promise<AuthData['user'] | null> {
    if (!this.hasToken()) {
      return null;
    }

    if (!apiService.hasAuthToken()) {
      const storedToken = this.getStoredToken();
      if (storedToken) {
        apiService.setAuthToken(storedToken);
      }
    }

    const response = await apiService.get<AuthData['user']>('/api/auth/me');

    if (response.success && response.data) {
      return response.data;
    }

    this.removeToken();
    return null;
  },

  async autoLogin(): Promise<AuthData['user'] | null> {
    const storedToken = this.getStoredToken();
    if (storedToken) {
      apiService.setAuthToken(storedToken);
      return await this.validateToken();
    }
    return null;
  },

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const userData = this.getUserData();
    return !!(token && userData);
  },

  getCurrentUser(): AuthData['user'] | null {
    return this.getUserData();
  },

  getCurrentSession(): SessionData | null {
    return this.getSessionData();
  },

  getCurrentTokens(): TokensData | null {
    return this.getTokensData();
  },

  async googleAuth(googleToken: string): Promise<AuthData | null> {
    const response = await apiService.post<{success: boolean, data: AuthData}>('/api/auth/google', {
      token: googleToken,
    });
    if (response.success && response.data && response.data.data) {
      this.setAuthData(response.data.data);
      return response.data.data;
    }
    return null;
  },

  async refreshAccessToken(): Promise<boolean> {
    const tokensData = this.getTokensData();
    if (!tokensData?.refreshToken) {
      return false;
    }
    try {
      const response = await apiService.post<{success: boolean, data: { tokens: TokensData }}>(
        '/api/auth/refresh',
        { refreshToken: tokensData.refreshToken }
      );
      if (response.success && response.data && response.data.data) {
        const { tokens } = response.data.data;
        this.setToken(tokens.accessToken);
        this.setTokensData(tokens);
        return true;
      }
    } catch {
      // ...
    }
    return false;
  },

  async fetchUserData(): Promise<AuthData['user']> {
    const response = await apiService.get<{success: boolean, data: {user: AuthData['user']}}>('/api/user/me');
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user data');
    }
    
    if (!response.data?.data?.user) {
      throw new Error('No user data received from API');
    }
    
    return response.data.data.user;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message: string; data: { email: string } }>('/api/auth/forgot-password', {
        email
      });

      if (response.success) {
        return { 
          success: true, 
          message: response.data?.message || 'Password reset link sent to your email' 
        };
      } else {
        return { 
          success: false, 
          message: response.error || 'Failed to send password reset email' 
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        message: 'An error occurred while sending password reset email' 
      };
    }
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message: string }>('/api/auth/reset-password', {
        token,
        password
      });

      if (response.success) {
        return { 
          success: true, 
          message: response.data?.message || 'Password reset successfully' 
        };
      } else {
        return { 
          success: false, 
          message: response.error || 'Failed to reset password' 
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Reset password error:', error);
      return { 
        success: false, 
        message: 'An error occurred while resetting password' 
      };
    }
  },

  async validateResetToken(token: string): Promise<{ success: boolean; message?: string; data?: { email: string; username: string } }> {
    try {
      const response = await apiService.get<{ success: boolean; message: string; data: { email: string; username: string } }>(`/api/auth/validate-reset-token/${token}`);

      if (response.success) {
        return { 
          success: true, 
          message: response.data?.message || 'Reset token is valid',
          data: response.data?.data
        };
      } else {
        return { 
          success: false, 
          message: response.error || 'Invalid or expired reset token' 
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Validate reset token error:', error);
      return { 
        success: false, 
        message: 'An error occurred while validating reset token' 
      };
    }
  }
};
