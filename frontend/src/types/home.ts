export interface HomeTrackItem {
  id: string;
  title: string;
  artist: string;
  image: string;
  href: string;
}

export interface HomeSection {
  title: string;
  items: HomeTrackItem[];
}

export interface HomeResponse {
  hero: HomeTrackItem[];
  sections: HomeSection[];
}

