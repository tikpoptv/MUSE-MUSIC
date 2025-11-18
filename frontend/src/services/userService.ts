import apiService from './api';
import {
  UserSettings,
  UserSettingsResponse,
  UpdateUserSettingsRequest,
  UpdateUserSettingsResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserStats,
} from '../types/user';

interface UserStatsResponse {
  success: boolean;
  message: string;
  data: {
    stats: UserStats;
  };
}

export const userService = {
  async getUserSettings(): Promise<UserSettings> {
    const response = await apiService.get<UserSettingsResponse>('/api/user/settings');
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user settings');
    }
    
    if (!response.data?.data?.settings) {
      throw new Error('No settings data received from API');
    }
    
    return response.data.data.settings;
  },

  async updateUserSettings(settingsData: UpdateUserSettingsRequest): Promise<UserSettings> {
    const response = await apiService.put<UpdateUserSettingsResponse>('/api/user/settings', settingsData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user settings');
    }
    
    if (!response.data?.data?.settings) {
      throw new Error('No settings data received from API');
    }
    
    return response.data.data.settings;
  },

  async resetPassword(passwordData: ResetPasswordRequest): Promise<void> {
    const response = await apiService.post<ResetPasswordResponse>('/api/user/reset-password', passwordData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }
  },

  async getUserStats(): Promise<UserStats> {
    const response = await apiService.get<UserStatsResponse>('/api/user/stats');
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user stats');
    }
    
    if (!response.data?.data?.stats) {
      throw new Error('No stats data received from API');
    }
    
    return response.data.data.stats;
  },

  async acceptTerms(): Promise<void> {
    const response = await apiService.post<{ success: boolean; message: string }>('/api/user/accept-terms', {});
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to accept terms');
    }
  }
};
