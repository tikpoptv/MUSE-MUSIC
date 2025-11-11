import apiService from './api';
import { AdminUser } from '../types/adminManage';

export const adminManageService = {
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const response = await apiService.get<{ success: boolean; message?: string; data: AdminUser[] }>('/api/admin/manage');
      
      if (response.success && response.data) {
        const backendResponse = response.data as { success?: boolean; message?: string; data?: AdminUser[] };
        if (Array.isArray(backendResponse.data)) {
          return backendResponse.data;
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      return [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch admin users:', error);
      throw error;
    }
  },

  async addAdminUser(email: string, role: 'admin' | 'super_admin' = 'admin'): Promise<AdminUser> {
    try {
      const response = await apiService.post<{ success: boolean; message?: string; data: AdminUser }>(
        '/api/admin/manage',
        { email, role }
      );
      
      if (response.success && response.data) {
        const backendResponse = response.data as { success?: boolean; message?: string; data?: AdminUser };
        if (backendResponse.data && 'userID' in backendResponse.data) {
          return backendResponse.data;
        }
        if ('userID' in response.data && 'email' in response.data) {
          return response.data as unknown as AdminUser;
        }
      }
      
      throw new Error(response.error || 'Failed to add admin user');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to add admin user:', error);
      throw error;
    }
  },

  async updateUserRole(userID: string, role: 'customer' | 'admin' | 'super_admin'): Promise<AdminUser> {
    try {
      const response = await apiService.put<{ success: boolean; message?: string; data: AdminUser }>(
        `/api/admin/manage/${userID}`,
        { role }
      );
      
      if (response.success && response.data) {
        const backendResponse = response.data as { success?: boolean; message?: string; data?: AdminUser };
        if (backendResponse.data && 'userID' in backendResponse.data) {
          return backendResponse.data;
        }
        if ('userID' in response.data && 'email' in response.data) {
          return response.data as unknown as AdminUser;
        }
      }
      
      throw new Error(response.error || 'Failed to update user role');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update user role:', error);
      throw error;
    }
  },

  async removeAdmin(userID: string): Promise<AdminUser> {
    try {
      const response = await apiService.delete<{ success: boolean; message?: string; data: AdminUser }>(
        `/api/admin/manage/${userID}`
      );
      
      if (response.success && response.data) {
        const backendResponse = response.data as { success?: boolean; message?: string; data?: AdminUser };
        if (backendResponse.data && 'userID' in backendResponse.data) {
          return backendResponse.data;
        }
        if ('userID' in response.data && 'email' in response.data) {
          return response.data as unknown as AdminUser;
        }
      }
      
      throw new Error(response.error || 'Failed to remove admin');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to remove admin:', error);
      throw error;
    }
  }
};

