import apiService from './api';

interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: boolean;
}

export const healthService = {
  async getHealth(): Promise<HealthData | null> {
    const response = await apiService.get<HealthData>('/api/health');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    console.error('Health check failed:', response.error);
    return null;
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
