import apiService from './api';
import type {
  AdminSongsResponse,
  PendingCountResponse,
  ApproveRejectResponse,
  BulkApproveRejectResponse,
  StatusFilter,
  UpdateLyricsResponse
} from '@/types/adminSongs';

export type {
  AdminSong,
  AdminSongsResponse,
  PendingCountResponse,
  ApproveRejectRequest,
  BulkApproveRejectRequest,
  ApproveRejectResponse,
  BulkApproveRejectResponse,
  StatusFilter,
  UpdateLyricsRequest,
  UpdateLyricsResponse
} from '@/types/adminSongs';

export const adminSongsService = {
  async getSongs(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: StatusFilter = 'all'
  ): Promise<AdminSongsResponse | null> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: status,
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await apiService.get<{
        success: boolean;
        message?: string;
        data: AdminSongsResponse;
      }>(`/api/admin/songs?${params.toString()}`);

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: AdminSongsResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('songs' in response.data && 'pagination' in response.data) {
          return response.data as unknown as AdminSongsResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch songs:', error);
      return null;
    }
  },

  async getPendingCount(): Promise<number> {
    try {
      const response = await apiService.get<{
        success: boolean;
        message?: string;
        data: PendingCountResponse;
      }>('/api/admin/songs/pending-count');

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: PendingCountResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data.count;
        }

        if ('count' in response.data) {
          return (response.data as unknown as PendingCountResponse).count;
        }
      }

      return 0;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch pending count:', error);
      return 0;
    }
  },

  async approveSong(
    processingID: string,
    note?: string | null
  ): Promise<ApproveRejectResponse | null> {
    try {
      const response = await apiService.post<{
        success: boolean;
        message?: string;
        data: ApproveRejectResponse;
      }>(`/api/admin/songs/${processingID}/approve`, { note: note || null });

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: ApproveRejectResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('processingID' in response.data) {
          return response.data as unknown as ApproveRejectResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to approve song:', error);
      return null;
    }
  },

  async rejectSong(
    processingID: string,
    note?: string | null
  ): Promise<ApproveRejectResponse | null> {
    try {
      const response = await apiService.post<{
        success: boolean;
        message?: string;
        data: ApproveRejectResponse;
      }>(`/api/admin/songs/${processingID}/reject`, { note: note || null });

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: ApproveRejectResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('processingID' in response.data) {
          return response.data as unknown as ApproveRejectResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to reject song:', error);
      return null;
    }
  },

  async bulkApprove(
    processingIDs: string[],
    note?: string | null
  ): Promise<BulkApproveRejectResponse | null> {
    try {
      const response = await apiService.post<{
        success: boolean;
        message?: string;
        data: BulkApproveRejectResponse;
      }>('/api/admin/songs/bulk-approve', {
        processingIDs,
        note: note || null,
      });

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: BulkApproveRejectResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('processingIDs' in response.data) {
          return response.data as unknown as BulkApproveRejectResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to bulk approve songs:', error);
      return null;
    }
  },

  async bulkReject(
    processingIDs: string[],
    note?: string | null
  ): Promise<BulkApproveRejectResponse | null> {
    try {
      const response = await apiService.post<{
        success: boolean;
        message?: string;
        data: BulkApproveRejectResponse;
      }>('/api/admin/songs/bulk-reject', {
        processingIDs,
        note: note || null,
      });

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: BulkApproveRejectResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('processingIDs' in response.data) {
          return response.data as unknown as BulkApproveRejectResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to bulk reject songs:', error);
      return null;
    }
  },

  async updateLyrics(
    processingID: string,
    lyrics: string
  ): Promise<UpdateLyricsResponse | null> {
    try {
      const response = await apiService.put<{
        success: boolean;
        message?: string;
        data: UpdateLyricsResponse;
      }>(`/api/admin/songs/${processingID}/lyrics`, {
        lyrics,
      });

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: UpdateLyricsResponse;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('processingID' in response.data) {
          return response.data as unknown as UpdateLyricsResponse;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update lyrics:', error);
      return null;
    }
  },
};

