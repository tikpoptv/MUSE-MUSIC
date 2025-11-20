export interface HomeTrackItem {
  id: string;
  processingID: string;
  title: string;
  artist: string;
  image: string;
  mood?: {
    type: string;
    percentage: number;
  } | null;
}

export interface HomeSection {
  title: string;
  items: HomeTrackItem[];
}

export interface HomePagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface HomeResponse {
  hero: HomeTrackItem[];
  sections: HomeSection[];
  pagination?: HomePagination;
}

