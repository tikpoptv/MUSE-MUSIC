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

export const authService = {
  setToken(token: string) {
    apiService.setAuthToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  removeToken() {
    apiService.removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
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

  logout() {
    this.removeToken();
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
  }
};
