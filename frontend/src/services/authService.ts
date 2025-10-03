import apiService from './api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface GoogleAuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
  };
}

interface UserData {
  userID: string;
  username: string;
  email: string;
  fullName: string;
  profilePicture: string;
  provider: string;
  providerID: string;
  providerEmail: string;
  role: string;
  loginStatus: string;
  setupCompleted: boolean;
  setupSkipped: boolean;
  registerDate: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  sessionID: string;
  expiresAt: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: string;
}

interface TokensData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

interface AuthData {
  user: UserData;
  session: SessionData;
  tokens: TokensData;
}

export const authService = {
  setToken(token: string) {
    apiService.setAuthToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  setUserData(userData: UserData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  },

  setSessionData(sessionData: SessionData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('session_data', JSON.stringify(sessionData));
    }
  },

  setTokensData(tokensData: TokensData) {
    if (typeof window !== 'undefined') {
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

  getUserData(): UserData | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  getSessionData(): SessionData | null {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('session_data');
      return sessionData ? JSON.parse(sessionData) : null;
    }
    return null;
  },

  getTokensData(): TokensData | null {
    if (typeof window !== 'undefined') {
      const tokensData = localStorage.getItem('tokens_data');
      return tokensData ? JSON.parse(tokensData) : null;
    }
    return null;
  },

  removeToken() {
    apiService.removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_data');
      localStorage.removeItem('tokens_data');
    }
  },

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  hasToken(): boolean {
    return apiService.hasAuthToken() || !!this.getStoredToken();
  },

  async login(email: string, password: string): Promise<LoginResponse | null> {
    const response = await apiService.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      return response.data;
    }

    return null;
  },

  async logout() {
    try {
      const token = this.getStoredToken();
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.removeToken();
    }
  },

  async validateToken(): Promise<User | null> {
    if (!this.hasToken()) {
      return null;
    }

    if (!apiService.hasAuthToken()) {
      const storedToken = this.getStoredToken();
      if (storedToken) {
        apiService.setAuthToken(storedToken);
      }
    }

    const response = await apiService.get<User>('/api/auth/me');

    if (response.success && response.data) {
      return response.data;
    }

    this.removeToken();
    return null;
  },

  async autoLogin(): Promise<User | null> {
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

  async googleAuth(googleToken: string): Promise<GoogleAuthResponse | null> {
    const response = await apiService.post<GoogleAuthResponse>('/api/auth/google', {
      token: googleToken,
    });

    if (response.success && response.data) {
      this.setToken(response.data.tokens.accessToken);
      return response.data;
    }

    return null;
  },

  async refreshAccessToken(): Promise<boolean> {
    const tokensData = this.getTokensData();
    
    if (!tokensData?.refreshToken) {
      return false;
    }

    try {
      const response = await apiService.post<{ tokens: { accessToken: string; tokenType: string; expiresIn: string } }>('/api/auth/refresh', {
        refreshToken: tokensData.refreshToken,
      });

      if (response.success && response.data) {
        // อัปเดต access token ใหม่
        this.setToken(response.data.tokens.accessToken);
        
        // อัปเดต tokens data
        const updatedTokensData = {
          ...tokensData,
          accessToken: response.data.tokens.accessToken,
          tokenType: response.data.tokens.tokenType,
          expiresIn: response.data.tokens.expiresIn,
        };
        this.setTokensData(updatedTokensData);
        
        return true;
      }
    } catch (error) {
      console.error('Refresh token failed:', error);
    }

    return false;
  }
};
