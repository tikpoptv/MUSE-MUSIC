import apiService from './api';

interface UserSettings {
  username: string;
  email: string;
  fullName: string;
  profilePicture: string | null;
  country: string;
  timezone: string;
  language: string;
  provider: string;
}

interface UserSettingsResponse {
  success: boolean;
  message: string;
  data: {
    settings: UserSettings;
  };
}

interface UpdateUserSettingsRequest {
  username?: string;
  email?: string;
  fullName?: string;
  country?: string;
  timezone?: string;
  language?: string;
}

interface UpdateUserSettingsResponse {
  success: boolean;
  message: string;
  data: {
    settings: UserSettings;
  };
}

interface ResetPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const userService = {
  async getUserSettings(): Promise<UserSettings> {
    const response = await apiService.get<UserSettingsResponse>('/api/user/settings');
    
    if (!response.success || !response.data?.data?.settings) {
      throw new Error(response.error || 'Failed to fetch user settings');
    }
    
    return response.data.data.settings;
  },

  async updateUserSettings(settingsData: UpdateUserSettingsRequest): Promise<UserSettings> {
    const response = await apiService.put<UpdateUserSettingsResponse>('/api/user/settings', settingsData);
    
    if (!response.success || !response.data?.data?.settings) {
      throw new Error(response.error || 'Failed to update user settings');
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
