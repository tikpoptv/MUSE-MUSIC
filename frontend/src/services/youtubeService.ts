import apiService from './api';
import type {
  YouTubeVideo,
  YouTubeSearchResponse,
  YouTubeVideoDetailsResponse,
  YouTubeTranscriptResponse,
  YouTubeAnalyzeResponse
} from '@/types/youtube';

export const youtubeService = {
  async searchVideos(
    songName: string,
    artistName?: string,
    maxResults: number = 5
  ): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({
      songName,
      maxResults: maxResults.toString()
    });

    if (artistName && artistName.trim() !== '') {
      params.append('artistName', artistName.trim());
    }

    const url = `/api/youtube/search?${params.toString()}`;
    
    const res = await apiService.get<{ success: boolean; message?: string; data: YouTubeSearchResponse }>(url);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to search YouTube videos');
    }
    
    const backendResponse = res.data as { data?: YouTubeSearchResponse };
    
    if (!backendResponse.data || !backendResponse.data.videos) {
      throw new Error('Missing videos in response');
    }
    
    return backendResponse.data.videos;
  },

  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetailsResponse> {
    const url = `/api/youtube/video/${videoId}`;
    
    const res = await apiService.get<{ success: boolean; message?: string; data: YouTubeVideoDetailsResponse }>(url);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to get YouTube video details');
    }
    
    const backendResponse = res.data as { data?: YouTubeVideoDetailsResponse };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    return backendResponse.data;
  },

  async getTranscript(
    videoId: string,
    options?: {
      format?: 'raw' | 'text';
      mode?: 'fallback' | 'multi';
      languages?: string[];
    }
  ): Promise<YouTubeTranscriptResponse> {
    const params = new URLSearchParams();
    if (options?.format) {
      params.append('format', options.format);
    }
    if (options?.mode) {
      params.append('mode', options.mode);
    }
    if (options?.languages && options.languages.length > 0) {
      params.append('languages', options.languages.join(','));
    }

    const url = `/api/youtube/transcript/${videoId}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await apiService.get<{ success: boolean; message?: string; data: YouTubeTranscriptResponse }>(url);

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to fetch YouTube transcript');
    }

    const backendResponse = res.data as { data?: YouTubeTranscriptResponse };

    if (!backendResponse.data) {
      throw new Error('Missing transcript data');
    }

    return backendResponse.data;
  },

  async analyzeVideo(payload: {
    videoId: string;
    actions: { translate: boolean; mood: boolean };
    translationConfig: { originalLanguage?: string | null; targetLanguage: string };
    shareRequest?: boolean;
  }): Promise<YouTubeAnalyzeResponse> {
    const res = await apiService.post<{ success: boolean; message?: string; data: YouTubeAnalyzeResponse }>(
      '/api/youtube/analyze',
      payload
    );

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to start YouTube analysis');
    }

    const backendResponse = res.data as { data?: YouTubeAnalyzeResponse };
    if (!backendResponse.data) {
      throw new Error('Missing analysis data');
    }
    
    return backendResponse.data;
  }
};

