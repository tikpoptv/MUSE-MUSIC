export interface MoodStat {
  label: string;
  value: number;
}

export interface Suggestion {
  id: string;
  processingID: string;
  songID: string;
  songName: string;
  rating: number;
  comment: string;
  date: string | null;
  createdAt: string;
}

export interface SubMoodDatum {
  name: string;
  value: number;
}

export interface AdminAnalysisData {
  totalSongs: number;
  moodStats: MoodStat[];
  feedbackCount: number;
  averageRating: number;
  suggestions: Suggestion[];
  subMoodData: Record<string, SubMoodDatum[]>;
}

export interface AdminAnalysisResponse {
  success: boolean;
  data: AdminAnalysisData;
}

