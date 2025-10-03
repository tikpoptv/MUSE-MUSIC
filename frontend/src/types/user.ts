export interface UserData {
  userID: string;
  username: string;
  email: string;
  fullName: string;
  profilePicture: string;
  provider: string;
  providerID: string;
  providerEmail: string;
  role: string;
  loginStatus: string;
  setupCompleted: boolean;
  setupSkipped: boolean;
  registerDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  favourites: number;
  analyzing: number;
  happy: number;
  sad: number;
  fear: number;
  anger: number;
  disgust: number;
  surprise: number;
}

export interface FavouriteSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverImage: string;
  addedAt: string;
}

export interface SavedTranslation {
  id: string;
  songTitle: string;
  originalLanguage: string;
  translatedLanguage: string;
  translation: string;
  savedAt: string;
}

export interface RecommendedAlbum {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  mood: string;
  genre: string;
}
