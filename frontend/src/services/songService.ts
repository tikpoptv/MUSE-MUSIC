import apiService from './api';

export interface SongDetail {
  songID: string;
  songName: string;
  songNameEnglish?: string;
  artistName: string;
  genre?: string;
  lyrics?: string;
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
}

export interface SongDetailResponse {
  song: SongDetail;
  processing?: ProcessingDetail;
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
    
    // Backend response: { success, message, data: { song, processing }, statusCode }
    // apiService wraps: { success, data: { success, message, data: {...}, statusCode } }
    const backendResponse = res.data as { data?: SongDetailResponse };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    return backendResponse.data;
  }
};

