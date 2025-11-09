import apiService from './api';

export interface RecommendedSong {
  id: string;
  processingID: string;
  title: string;
  artist: string;
  genre?: string;
  duration?: number;
  image: string;
  originalLanguage?: string;
  moodType?: string;
  totalRatings?: number;
  averageRating?: number | null;
  createdAt?: string;
}

export interface RecommendSongsResponse {
  songs: RecommendedSong[];
}

export const recommendSongsService = {
  async getRecommendedSongsByLanguageAndMood(
    language?: string,
    mood?: string,
    limit: number = 10,
    excludeSongID?: string
  ): Promise<RecommendedSong[]> {
    const params = new URLSearchParams();
    if (language) {
      params.append('language', language);
    }
    if (mood) {
      params.append('mood', mood);
    }
    params.append('limit', limit.toString());
    if (excludeSongID) {
      params.append('excludeSongID', excludeSongID);
    }

    const url = `/api/recommend/by-language-mood?${params.toString()}`;
    const res = await apiService.get<{ success: boolean; message?: string; data: RecommendSongsResponse }>(url);

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to fetch recommended songs');
    }

    const backendResponse = res.data as { data?: RecommendSongsResponse };

    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }

    return backendResponse.data.songs || [];
  }
};

export default recommendSongsService;

