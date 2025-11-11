import apiService from './api';
import { DashboardData } from '../types/dashboard';

export const dashboardService = {
  async getDashboardData(days: number = 30): Promise<DashboardData | null> {
    try {
      const sanitizedDays = Math.max(1, Math.min(365, Math.floor(days) || 30));
      const response = await apiService.get<{ success: boolean; message?: string; data: DashboardData }>(`/api/dashboard?days=${sanitizedDays}`);
      
      if (response.success && response.data) {
        const backendResponse = response.data as { success?: boolean; message?: string; data?: DashboardData };
        if (backendResponse.data) {
          return backendResponse.data;
        }
        if ('stats' in response.data && 'trafficData' in response.data && 'songsByMood' in response.data) {
          return response.data as unknown as DashboardData;
        }
      }
      
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Dashboard data fetch failed:', error);
      return null;
    }
  }
};

