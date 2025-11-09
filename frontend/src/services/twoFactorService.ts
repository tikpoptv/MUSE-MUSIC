import apiService from './api';
import {
  TwoFactorSetupResponse,
  TwoFactorVerifyResponse,
  TwoFactorBackupCodesResponse,
  TwoFactorStatusResponse,
  TwoFactorDisableResponse
} from '../types/2fa';

export const twoFactorService = {
  async setup2FA(): Promise<TwoFactorSetupResponse['data']> {
    const response = await apiService.post<TwoFactorSetupResponse>('/api/2fa/setup');
    
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Failed to setup 2FA');
    }
    
    return response.data.data;
  },

  async verifySetupCode(token: string): Promise<TwoFactorVerifyResponse['data']> {
    const response = await apiService.post<TwoFactorVerifyResponse>('/api/2fa/verify-setup', {
      token
    });
    
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Failed to verify setup code');
    }
    
    return response.data.data;
  },

  async generateBackupCodes(): Promise<TwoFactorBackupCodesResponse['data']> {
    const response = await apiService.post<TwoFactorBackupCodesResponse>('/api/2fa/generate-backup-codes');
    
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Failed to generate backup codes');
    }
    
    return response.data.data;
  },

  async verify2FA(token: string): Promise<TwoFactorVerifyResponse['data']> {
    const response = await apiService.post<TwoFactorVerifyResponse>('/api/2fa/verify', {
      token
    });
    
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Failed to verify 2FA code');
    }
    
    return response.data.data;
  },

  async disable2FA(): Promise<TwoFactorDisableResponse['data']> {
    const response = await apiService.post<TwoFactorDisableResponse>('/api/2fa/disable');
    
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Failed to disable 2FA');
    }
    
    return response.data.data;
  },

  async get2FAStatus(): Promise<TwoFactorStatusResponse['data']> {
    const response = await apiService.get<TwoFactorStatusResponse>('/api/2fa/status');
    
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Failed to get 2FA status');
    }
    
    return response.data.data;
  },

  async verifyToken(token: string): Promise<TwoFactorVerifyResponse> {
    const response = await apiService.post<TwoFactorVerifyResponse>('/api/2fa/verify', {
      token
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to verify 2FA token');
    }
    
    return response.data;
  },

  async getBackupCodes(): Promise<TwoFactorBackupCodesResponse['data']> {
    const response = await apiService.get<TwoFactorBackupCodesResponse>('/api/2fa/backup-codes');
    
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Failed to get backup codes');
    }
    
    return response.data.data;
  },

  async regenerateBackupCodes(): Promise<TwoFactorBackupCodesResponse['data']> {
    const response = await apiService.post<TwoFactorBackupCodesResponse>('/api/2fa/regenerate-backup-codes');
    
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Failed to regenerate backup codes');
    }
    
    return response.data.data;
  }
};
