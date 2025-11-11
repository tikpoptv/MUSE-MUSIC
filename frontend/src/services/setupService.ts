import apiService from './api';
import { SetupStatusResponse } from '../types/setup';

export const setupService = {
  async getSetupStatus(): Promise<SetupStatusResponse['data']> {
    const response = await apiService.get<{
      success: boolean;
      message?: string;
      data: SetupStatusResponse['data'];
    }>('/api/setup/status');

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch setup status');
    }

    // Handle nested response structure from apiService
    const backendResponse = response.data as {
      success?: boolean;
      message?: string;
      data?: SetupStatusResponse['data'];
    };

    if (backendResponse.data) {
      return backendResponse.data;
    }

    // If data is directly in response.data (not nested)
    if ('setupCompleted' in response.data || 'allStatus' in response.data) {
      // Type guard to ensure we have the correct structure
      const directData = response.data as unknown;
      if (
        typeof directData === 'object' &&
        directData !== null &&
        ('setupCompleted' in directData || 'allStatus' in directData)
      ) {
        return directData as SetupStatusResponse['data'];
      }
    }

    throw new Error('Invalid response structure from setup status API');
  },

  async saveSetupStep(step: string, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    const response = await apiService.post<{ success: boolean; message: string }>('/api/setup/save', {
      step,
      data
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to save setup step');
    }

    return response.data!;
  },

  async skipSetup(termsAccepted: boolean): Promise<{ success: boolean; message: string }> {
    const response = await apiService.post<{ success: boolean; message: string }>('/api/setup/skip', {
      termsAccepted
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to skip setup');
    }

    return response.data!;
  },

  async completeSetup(): Promise<{ success: boolean; message: string }> {
    const response = await apiService.post<{ success: boolean; message: string }>('/api/setup/complete');

    if (!response.success) {
      throw new Error(response.error || 'Failed to complete setup');
    }

    return response.data!;
  }
};
