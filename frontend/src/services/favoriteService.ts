import apiService from './api';
import type {
  AddFavoriteRequest,
  AddFavoriteResponse,
  RemoveFavoriteRequest,
  UserFavoritesResponse,
  CheckFavoriteResponse
} from '@/types/favorites';

export const favoriteService = {
  async addFavorite(request: AddFavoriteRequest): Promise<AddFavoriteResponse | null> {
    try {
      const response = await apiService.post<{
        success: boolean;
        message?: string;
        data: AddFavoriteResponse;
      }>('/api/favorites', request);

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: AddFavoriteResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('favoriteID' in response.data && 'isNew' in response.data) {
          return response.data as unknown as AddFavoriteResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to add favorite:', error);
      return null;
    }
  },

  async removeFavorite(request: RemoveFavoriteRequest): Promise<boolean> {
    try {
      const response = await apiService.delete<{
        success: boolean;
        message?: string;
        data: { removed: boolean };
      }>('/api/favorites', request);

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: { removed: boolean };
        };

        if (backendResponse.data) {
          return backendResponse.data.removed;
        }

        if ('removed' in response.data) {
          return (response.data as unknown as { removed: boolean }).removed;
        }
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to remove favorite:', error);
      return false;
    }
  },

  async getUserFavorites(page: number = 1, limit: number = 20): Promise<UserFavoritesResponse | null> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiService.get<{
        success: boolean;
        message?: string;
        data: UserFavoritesResponse;
      }>(`/api/favorites?${params.toString()}`);

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: UserFavoritesResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('favorites' in response.data && 'pagination' in response.data) {
          return response.data as unknown as UserFavoritesResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch user favorites:', error);
      return null;
    }
  },

  async checkFavorite(songID: string): Promise<boolean> {
    try {
      const response = await apiService.get<{
        success: boolean;
        message?: string;
        data: CheckFavoriteResponse;
      }>(`/api/favorites/check?songID=${songID}`);

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: CheckFavoriteResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data.isFavorite;
        }

        if ('isFavorite' in response.data) {
          return (response.data as unknown as CheckFavoriteResponse).isFavorite;
        }
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to check favorite:', error);
      return false;
    }
  }
};

