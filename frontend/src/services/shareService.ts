import apiService from './api';
import type { ShareLinkResponse, ProcessingByShareLink } from '@/types/share';

export const shareService = {
  async createShareLink(processingID: string): Promise<ShareLinkResponse> {
    const url = '/api/share/create';
    const res = await apiService.post<{ success: boolean; message?: string; data: ShareLinkResponse }>(
      url,
      { processingID }
    );

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || 'Failed to create share link');
    }

    const backendResponse = res.data as { success?: boolean; message?: string; data?: ShareLinkResponse };

    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }

    return backendResponse.data;
  },

  async getProcessingByShortLink(shortLink: string): Promise<ProcessingByShareLink> {
    const url = `/api/share/${shortLink}`;
    const res = await apiService.get<{ success: boolean; message?: string; data: { processing: ProcessingByShareLink } }>(url);

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || 'Failed to fetch processing by share link');
    }

    const backendResponse = res.data as { success?: boolean; message?: string; data?: { processing: ProcessingByShareLink } };

    if (!backendResponse.data || !backendResponse.data.processing) {
      throw new Error('Missing processing data in response');
    }

    return backendResponse.data.processing;
  }
};

export default shareService;

