export interface ForYouTrackItem {
  id: string;
  title: string;
  artist: string;
  image: string;
  processingID?: string | null;
  mood?: { type: string; percentage: number } | null;
}

export interface MoodStats {
  moodType: string;
  count: number;
  percentage: number;
}

export interface ForYouRecommendSubsection {
  title: string;
  items: ForYouTrackItem[];
}

export interface ForYouRecommendSection {
  title: string;
  description: string;
  subsections: ForYouRecommendSubsection[];
}

export interface ForYouResponse {
  moods: MoodStats[]; // Moods analyzed from listened songs
  recentlySearched: ForYouTrackItem[];
  recommendations: ForYouRecommendSection;
  topHits: ForYouTrackItem[];
}

