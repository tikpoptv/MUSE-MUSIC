import apiService from './api';
import { AuthData, SessionData, TokensData } from '../types/auth';
import { UserData } from '../types/user';
import { LocalStorageManager } from '../utils/localStorageManager';
import { localStorageKeys } from '../utils/localStorageKeys';

export const authService = {
  setToken(token: string) {
    apiService.setAuthToken(token);
    LocalStorageManager.set(localStorageKeys.AUTH_TOKEN, token);
  },

  setUserData(userData: UserData) {
    LocalStorageManager.set(localStorageKeys.USER_DATA, userData);
  },

  setSessionData(sessionData: SessionData) {
    LocalStorageManager.set(localStorageKeys.SESSION_DATA, sessionData);
  },

  setTokensData(tokensData: TokensData) {
    LocalStorageManager.set(localStorageKeys.TOKENS_DATA, tokensData);
  },

  setAuthData(authData: AuthData) {
    this.setToken(authData.tokens.accessToken);
    this.setUserData(authData.user);
    this.setSessionData(authData.session);
    this.setTokensData(authData.tokens);
  },

  getUserData(): UserData | null {
    return LocalStorageManager.get<UserData>(localStorageKeys.USER_DATA);
  },

  getSessionData(): SessionData | null {
    return LocalStorageManager.get<SessionData>(localStorageKeys.SESSION_DATA);
  },

  getTokensData(): TokensData | null {
    return LocalStorageManager.get<TokensData>(localStorageKeys.TOKENS_DATA);
  },

  removeToken() {
    apiService.removeAuthToken();
    LocalStorageManager.remove(localStorageKeys.AUTH_TOKEN);
    LocalStorageManager.remove(localStorageKeys.USER_DATA);
    LocalStorageManager.remove(localStorageKeys.SESSION_DATA);
    LocalStorageManager.remove(localStorageKeys.TOKENS_DATA);
  },

  getStoredToken(): string | null {
    return LocalStorageManager.get<string>(localStorageKeys.AUTH_TOKEN);
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
      // eslint-disable-next-line no-console
      console.error('Logout API error:', error);
      this.removeToken();
      return { success: false, message: 'Logout failed but local session cleared' };
    }
  },

  async validateToken(): Promise<UserData | null> {
    if (!this.hasToken()) {
      return null;
    }
    if (!apiService.hasAuthToken()) {
      const storedToken = this.getStoredToken();
      if (storedToken) {
        apiService.setAuthToken(storedToken);
      }
    }
    const response = await apiService.get<UserData>('/api/auth/me');
    if (response.success && response.data) {
      return response.data;
    }
    this.removeToken();
    return null;
  },

  async autoLogin(): Promise<UserData | null> {
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

  getCurrentUser(): UserData | null {
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

  async fetchUserData(): Promise<UserData> {
    const response = await apiService.get<{success: boolean, data: {user: UserData}}>('/api/user/me');
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
      const response = await apiService.post<{ success: boolean; message: string; data: { email: string } }>('/api/auth/forgot-password', { email });
      if (response.success) {
        return { success: true, message: response.data?.message || 'Password reset link sent to your email' };
      } else {
        return { success: false, message: response.error || 'Failed to send password reset email' };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.error('Forgot password error:', error);
      return { success: false, message: 'An error occurred while sending password reset email' };
    }
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message: string }>('/api/auth/reset-password', { token, password });
      if (response.success) {
        return { success: true, message: response.data?.message || 'Password reset successfully' };
      } else {
        return { success: false, message: response.error || 'Failed to reset password' };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.error('Reset password error:', error);
      return { success: false, message: 'An error occurred while resetting password' };
    }
  },

  async validateResetToken(token: string): Promise<{ success: boolean; message?: string; data?: { email: string; username: string } }> {
    try {
      const response = await apiService.get<{ success: boolean; message: string; data: { email: string; username: string } }>(`/api/auth/validate-reset-token/${token}`);
      if (response.success) {
        return { success: true, message: response.data?.message || 'Reset token is valid', data: response.data?.data };
      } else {
        return { success: false, message: response.error || 'Invalid or expired reset token' };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.error('Validate reset token error:', error);
      return { success: false, message: 'An error occurred while validating reset token' };
    }
  },

  async checkAdminStatus(): Promise<boolean> {
    try {
      const response = await apiService.get<{ 
        success: boolean; 
        data: { 
          isAdmin: boolean; 
          role: string; 
          user: UserData;
        } 
      }>('/api/auth/check-admin');

      if (response.success && response.data?.data) {
        const { isAdmin, user } = response.data.data;
        
        this.setUserData(user);
        
        return isAdmin;
      }
      
      return false;
    } catch {
      return false;
    }
  }
};
