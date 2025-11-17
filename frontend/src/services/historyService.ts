import apiService from './api';
import type {
  SaveTranslationRequest,
  SaveTranslationResponse,
  UserHistoryResponse
} from '@/types/history';

export const historyService = {
  async saveTranslation(request: SaveTranslationRequest): Promise<SaveTranslationResponse | null> {
    try {
      const response = await apiService.post<{
        success: boolean;
        message?: string;
        data: SaveTranslationResponse;
      }>('/api/history/save', request);

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: SaveTranslationResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('historyID' in response.data && 'timeStamp' in response.data) {
          return response.data as unknown as SaveTranslationResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save translation:', error);
      return null;
    }
  },

  async getUserHistory(page: number = 1, limit: number = 20, actionType?: 'view' | 'save'): Promise<UserHistoryResponse | null> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (actionType) {
        params.append('actionType', actionType);
      }

      const response = await apiService.get<{
        success: boolean;
        message?: string;
        data: UserHistoryResponse;
      }>(`/api/history?${params.toString()}`);

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: UserHistoryResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('history' in response.data && 'pagination' in response.data) {
          return response.data as unknown as UserHistoryResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch user history:', error);
      return null;
    }
  }
};

