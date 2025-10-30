import apiService from './api';
import {
  UserSettings,
  UserSettingsResponse,
  UpdateUserSettingsRequest,
  UpdateUserSettingsResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/user';

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
  }
};
