import api from './api';
import type { HomeResponse, HomeSection, HomeTrackItem } from '@/types/home';

export async function fetchHomeContent(): Promise<HomeResponse> {
  const res = await api.get<{ success: boolean; message?: string; data: HomeResponse }>('/api/home');

  if (!res.success || !res.data) {
    throw new Error(res.error || 'Failed to fetch home content');
  }

  const backendResponse = res.data as { data?: HomeResponse };

  if (!backendResponse.data) {
    throw new Error('Missing data in response');
  }

  const payload = backendResponse.data;

  if (payload.sections && !Array.isArray(payload.sections)) {
    const sectionsObj: Record<string, HomeTrackItem[]> = payload.sections as unknown as Record<string, HomeTrackItem[]>;
    const sectionsArr: HomeSection[] = Object.entries(sectionsObj).map(([title, items]) => ({ title, items }));
    return { hero: payload.hero ?? [], sections: sectionsArr } as HomeResponse;
  }

  return payload as HomeResponse;
}
const homeApi = { fetchHomeContent };
export default homeApi;

