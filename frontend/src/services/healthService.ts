import apiService from './api';
import { HealthData } from '../types/health';

export const healthService = {
  async getHealth(): Promise<HealthData | null> {
    try {
      const response = await apiService.get<{ success: boolean; message?: string; data: HealthData; statusCode?: number }>('/api/health');
    
      if (response.success && response.data) {
        const backendResponse = response.data as { success?: boolean; message?: string; data?: HealthData; statusCode?: number };
        if (backendResponse.data) {
          return backendResponse.data;
        }
        // Handle direct health data response
        if ('status' in response.data && 'database' in response.data) {
          return response.data as unknown as HealthData;
        }
      }
      
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Health check failed:', error);
      return null;
    }
  },

  async checkDatabaseStatus(): Promise<boolean> {
    const health = await this.getHealth();
    return health?.database || false;
  },

  async getServerStatus(): Promise<string> {
    const health = await this.getHealth();
    return health?.status || 'unknown';
  }
};
