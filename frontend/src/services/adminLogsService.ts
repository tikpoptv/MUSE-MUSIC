import apiService from './api';
import type { LogsResponse, LogStats, LogFilters } from '@/types/adminLogs';

export const adminLogsService = {
  async getLogs(filters: LogFilters = {}): Promise<LogsResponse | null> {
    try {
      const params = new URLSearchParams();
      
      if (filters.level) params.append('level', filters.level);
      if (filters.category) params.append('category', filters.category);
      if (filters.userID) params.append('userID', filters.userID);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await apiService.get<{
        success: boolean;
        message?: string;
        data: LogsResponse;
      }>(`/api/admin/logs?${params.toString()}`);

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: LogsResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('logs' in response.data && 'pagination' in response.data) {
          return response.data as unknown as LogsResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch logs:', error);
      return null;
    }
  },

  async getLogStats(): Promise<LogStats | null> {
    try {
      const response = await apiService.get<{
        success: boolean;
        message?: string;
        data: LogStats;
      }>('/api/admin/logs/stats');

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: LogStats;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('byLevel' in response.data && 'errorCount' in response.data) {
          return response.data as unknown as LogStats;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch log statistics:', error);
      return null;
    }
  }
};

