import api from './api';
import type { ForYouResponse } from '@/types/forYou';

export async function fetchForYouContent(limit = 100, offset = 0): Promise<ForYouResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString()
  });
  const forYouRes = await api.get<{ success: boolean; message?: string; data: ForYouResponse; statusCode?: number }>(`/api/foryou?${params.toString()}`);

  if (forYouRes.success && forYouRes.data) {
    const backendResponse = forYouRes.data as { success?: boolean; message?: string; data?: ForYouResponse; statusCode?: number };
    
    if (backendResponse.data) {
      return backendResponse.data;
    }
    
    if ('moods' in forYouRes.data || 'recommendations' in forYouRes.data) {
      return forYouRes.data as unknown as ForYouResponse;
    }
  }

  throw new Error('Failed to fetch For You content');
}

const forYouApi = { fetchForYouContent };
export default forYouApi;

