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

export interface YouTubeVideoDetailsResponse extends YouTubeVideo {
  duration: number;
  viewCount: number;
  likeCount: number;
}

