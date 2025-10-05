const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7662';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Import authService for auto refresh
let authService: {
  refreshAccessToken: () => Promise<boolean>;
  logout: () => void;
} | null = null;

class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Auto-set token from localStorage if not already set
    const token = localStorage.getItem('auth_token');
    if (token && !this.hasAuthToken()) {
      this.setAuthToken(token);
    }
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // ตรวจสอบ 401 Unauthorized และพยายาม refresh token
      if (response.status === 401 && this.hasAuthToken()) {
        console.log('Token expired, attempting to refresh...');
        
        // Import authService dynamically to avoid circular dependency
        if (!authService) {
          const authServiceModule = await import('./authService');
          authService = authServiceModule.authService;
        }
        
        const refreshSuccess = await authService.refreshAccessToken();
        
        if (refreshSuccess) {
          console.log('Token refreshed successfully, retrying request...');
          // Retry the original request with new token
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              'Authorization': `Bearer ${this.getAuthToken()}`,
            },
          };
          
          const retryResponse = await fetch(url, retryConfig);
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            return {
              success: false,
              error: retryData.message || `HTTP ${retryResponse.status}`,
            };
          }
          
          return {
            success: true,
            data: retryData,
          };
        } else {
          console.log('Refresh token failed, redirecting to login...');
          // Clear auth data and redirect to login
          authService.logout();
          window.location.href = '/login';
          return {
            success: false,
            error: 'Session expired, please login again',
          };
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`,
    };
  }

  removeAuthToken() {
    const headers = { ...this.defaultHeaders } as Record<string, string>;
    delete headers.Authorization;
    this.defaultHeaders = headers;
  }

  hasAuthToken(): boolean {
    return 'Authorization' in this.defaultHeaders;
  }

  getAuthToken(): string | null {
    const authHeader = (this.defaultHeaders as Record<string, string>)['Authorization'];
    return authHeader ? authHeader.replace('Bearer ', '') : null;
  }
}

export const apiService = new ApiService();
export default apiService;
