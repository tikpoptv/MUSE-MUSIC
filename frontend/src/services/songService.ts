import apiService from './api';

export interface SongDetail {
  songID: string;
  songName: string;
  songNameEnglish?: string;
  artistName: string;
  genre?: string;
  lyrics?: string;
  syncedLyrics?: string;
  duration?: number;
  country?: string;
  language?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoodItem {
  type: string;
  percentage: number;
}

export interface ProcessingDetail {
  processingID: string;
  songID: string;
  aiModel: string;
  status: 'processing' | 'completed' | 'failed';
  summary?: string;
  translation?: string;
  interpretation?: string;
  originalLanguage?: string;
  targetLanguage?: string;
  translationConfidence?: number;
  moodType?: string;
  moodScore?: number;
  moodConfidence?: number;
  mood?: MoodItem[] | Record<string, number>; // Array of mood items or object with mood types as keys
  processingTime?: number;
  isCompleteProcessing: boolean;
  createdAt: string;
  updatedAt: string;
  // User tracking
  createdBy?: string | null; // User ID who created this processing
  updatedBy?: string | null;
  // Rating System
  totalRatings?: number;
  averageRating?: number;
  starCount?: number;
  // Sharing & Approval System
  shareStatus?: 'private' | 'public_pending' | 'public_approved';
  approvalStatus?: 'pending' | 'approved' | 'rejected' | null;
  approvedBy?: string;
  approvalNote?: string;
  approvedAt?: string;
  isPublic?: boolean;
  coverImage?: string | null;
  youtubeVideoId?: string | null;
  syncConfirmed?: boolean;
  songStartTime?: number | null;
}

export interface SongDetailResponse {
  song: SongDetail;
  processing?: ProcessingDetail;
}

export interface RatingResponse {
  ratingID: string;
  processingID: string;
  userID: string | null;
  rating: number;
  comment: string | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  totalRatings: number;
  averageRating: number;
  starCount: number;
}

export interface ProcessingCheckResponse {
  exists: boolean;
  processingID: string | null;
  totalRatings?: number;
  averageRating?: number | null;
}

export const songService = {
  async getSongDetail(songID: string, processingID?: string): Promise<SongDetailResponse> {
    const url = processingID 
      ? `/api/songs/${songID}?processingID=${processingID}`
      : `/api/songs/${songID}`;
    
    const res = await apiService.get<{ success: boolean; message?: string; data: SongDetailResponse }>(url);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to fetch song details');
    }
    
    const backendResponse = res.data as { data?: SongDetailResponse };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    return backendResponse.data;
  },

  async submitRating(processingID: string, rating: number, comment?: string): Promise<RatingResponse> {
    const url = `/api/ratings/${processingID}`;
    
    const res = await apiService.post<{ success: boolean; message?: string; data: RatingResponse; statusCode?: number }>(
      url,
      { rating, comment: comment || null }
    );
    
    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || 'Failed to submit rating');
    }
    
    const backendResponse = res.data as { success: boolean; message?: string; data: RatingResponse; statusCode?: number };
    
    if (!backendResponse.success || !backendResponse.data) {
      throw new Error(backendResponse.message || 'Failed to submit rating');
    }
    
    return backendResponse.data;
  },

  async getRatingStats(processingID: string): Promise<RatingStats> {
    const url = `/api/ratings/${processingID}/stats`;
    
    const res = await apiService.get<{ success: boolean; message?: string; data: RatingStats }>(url);
    
    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || 'Failed to fetch rating stats');
    }
    
    const backendResponse = res.data as { data?: RatingStats };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    return backendResponse.data;
  },

  async getUserRating(processingID: string): Promise<RatingResponse | null> {
    const url = `/api/ratings/${processingID}/user`;
    
    const res = await apiService.get<{ success: boolean; message?: string; data: RatingResponse | null }>(url);
    
    if (!res.success) {
      if (res.error?.includes('401') || res.error?.includes('Authentication')) {
        return null;
      }
      throw new Error(res.error || res.message || 'Failed to fetch user rating');
    }
    
    const backendResponse = res.data as { data?: RatingResponse | null };
    
    return backendResponse.data || null;
  },

  async updateYouTubeVideoId(processingID: string, youtubeVideoId: string | null): Promise<void> {
    const url = `/api/processing/${processingID}/youtube-video-id`;
    
    const res = await apiService.put<{ success: boolean; message?: string }>(
      url,
      { youtubeVideoId }
    );
    
    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to update YouTube video ID');
    }
  },

  async updateCoverImage(processingID: string, coverImageUrl: string | null): Promise<void> {
    const url = `/api/processing/${processingID}/cover-image`;
    
    const res = await apiService.put<{ success: boolean; message?: string }>(
      url,
      { coverImageUrl }
    );
    
    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to update cover image');
    }
  },

  async updateSyncSettings(
    processingID: string,
    syncConfirmed: boolean,
    songStartTime: number | null = null
  ): Promise<void> {
    const url = `/api/processing/${processingID}/sync-settings`;
    
    const res = await apiService.put<{ success: boolean; message?: string }>(
      url,
      { syncConfirmed, songStartTime }
    );
    
    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to update sync settings');
    }
  },

  async checkProcessingByLanguage(songID: string, targetLanguage: string): Promise<ProcessingCheckResponse> {
    const url = `/api/songs/${songID}/check-language?targetLanguage=${encodeURIComponent(targetLanguage)}`;
    
    const res = await apiService.get<{ success: boolean; message?: string; data: ProcessingCheckResponse }>(url);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to check processing');
    }
    
    const backendResponse = res.data as { data?: ProcessingCheckResponse };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    return backendResponse.data;
  },

  async searchSongs(query: string, limit: number = 10): Promise<SearchSongResult[]> {
    const url = `/api/songs/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    
    const res = await apiService.get<{ success: boolean; message?: string; data: { songs: SearchSongResult[] } }>(url);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to search songs');
    }
    
    const backendResponse = res.data as { data?: { songs: SearchSongResult[] } };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    return backendResponse.data.songs;
  }
};

export interface SearchSongResult {
  songID: string;
  songName: string;
  artistName: string;
  genre?: string;
  duration?: number;
  processingID?: string | null;
  coverImage?: string | null;
  hasProcessing: boolean;
}

