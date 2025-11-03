import apiService from './api';
import type { YouTubeVideo, YouTubeSearchResponse, YouTubeVideoDetailsResponse } from '@/types/youtube';

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
  }
};

