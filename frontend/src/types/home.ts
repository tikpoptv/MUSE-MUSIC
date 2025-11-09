export interface HomeTrackItem {
  id: string;
  processingID: string;
  title: string;
  artist: string;
  image: string;
}

export interface HomeSection {
  title: string;
  items: HomeTrackItem[];
}

export interface HomeResponse {
  hero: HomeTrackItem[];
  sections: HomeSection[];
}

