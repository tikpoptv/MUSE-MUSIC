export interface ForYouTrackItem {
  id: string;
  title: string;
  artist: string;
  image: string;
  href: string;
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
  moods: MoodStats[]; // อารมณ์ที่วิเคราะห์ได้จากเพลงที่ฟัง
  recentlySearched: ForYouTrackItem[];
  recommendations: ForYouRecommendSection;
  topHits: ForYouTrackItem[];
}

