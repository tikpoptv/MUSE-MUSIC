import apiService from './api';
import type { AdminAnalysisData, AdminAnalysisResponse } from '@/types/adminAnalysis';

export type {
  MoodStat,
  Suggestion,
  SubMoodDatum,
  AdminAnalysisData,
  AdminAnalysisResponse
} from '@/types/adminAnalysis';

export const adminAnalysisService = {
  async getAnalysisData(): Promise<AdminAnalysisData | null> {
    try {
      const response = await apiService.get<AdminAnalysisResponse>('/api/admin/analysis');

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: AdminAnalysisData;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('totalSongs' in response.data && 'moodStats' in response.data) {
          return response.data as unknown as AdminAnalysisData;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch analysis data:', error);
      return null;
    }
  }
};

