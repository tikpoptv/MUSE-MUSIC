import type { AnalysisResult } from '@/types/analysis';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: number;
  viewCount?: number;
  likeCount?: number;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
}

export interface YouTubeTranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface YouTubeVideoDetailsResponse extends YouTubeVideo {
  duration: number;
  viewCount: number;
  likeCount: number;
}

export interface YouTubeTranscriptResponse {
  format: 'raw' | 'text';
  strategy: 'fallback' | 'multi';
  languages: string[];
  transcript: string | YouTubeTranscriptSegment[] | Record<string, string | YouTubeTranscriptSegment[]>;
  videoDetails?: YouTubeVideoDetailsResponse | null;
}

export interface YouTubeAnalyzeResponse extends AnalysisResult {
  videoDetails?: YouTubeVideoDetailsResponse | null;
  syncedLyrics?: string | null;
  transcript?: YouTubeTranscriptSegment[];
}
