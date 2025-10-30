import apiService from './api';
import type { LyricsRecord } from '@/types/lyrics';

export const lyricsService = {
  async search(params: { q?: string; track_name?: string; artist_name?: string; album_name?: string }): Promise<LyricsRecord[]> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.track_name) query.set('track_name', params.track_name);
    if (params.artist_name) query.set('artist_name', params.artist_name);
    if (params.album_name) query.set('album_name', params.album_name);
    const url = `/api/lyrics/search?${query.toString()}`;
    // Delay 1 second intentionally to avoid rapid fetch during typing or early calls
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = await apiService.get<unknown>(url);
    if (!res.success || !res.data) return [];
    const body = res.data as unknown;
    // Our BE wraps with { success, message, data } → unwrap to array
    if (Array.isArray(body)) return body as LyricsRecord[];
    if (typeof body === 'object' && body !== null && Array.isArray((body as { data?: unknown }).data)) {
      return (body as { data: LyricsRecord[] }).data;
    }
    return [];
  },
};


