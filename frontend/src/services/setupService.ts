import apiService from './api';

// API Response Structure จาก Backend
interface SetupStatusResponse {
  success: boolean;
  data: {
    allStatus: boolean;
    stepStatus: {
      step1: boolean;
      step2: boolean;
      step3: boolean;
      step4: boolean;
    };
    stepData: {
      step1: {
        hasPassword: boolean;
      } | null;
      step2: {
        birthday: string;
      } | null;
      step3: {
        country: string;
        timezone: string;
        language: string;
      } | null;
      step4: {
        genres: string[];
      } | null;
    };
    setupCompleted: boolean;
    setupSkipped: boolean;
    provider: string;
  };
}

// ไม่ต้องมี SetupStatusResponse interface แยก

export const setupService = {
  async getSetupStatus(): Promise<SetupStatusResponse['data']> {
    const response = await apiService.get<SetupStatusResponse>('/api/setup/status');

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch setup status');
    }

    return response.data.data;
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
