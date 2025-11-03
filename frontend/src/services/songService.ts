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
  // Sharing & Approval System
  shareStatus?: 'private' | 'public_pending' | 'public_approved';
  approvalStatus?: 'pending' | 'approved' | 'rejected' | null;
  approvedBy?: string;
  approvalNote?: string;
  approvedAt?: string;
  isPublic?: boolean;
  youtubeVideoId?: string | null; // YouTube video ID for synced lyrics player
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
  }
};

