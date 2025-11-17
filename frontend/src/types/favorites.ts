export interface FavoriteItem {
  favoriteID: string;
  songID: string;
  songName: string;
  artistName: string;
  coverImage: string | null;
  processingID: string | null;
  originalLanguage: string | null;
  targetLanguage: string | null;
  createdAt: string;
}

export interface FavoritePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserFavoritesResponse {
  favorites: FavoriteItem[];
  pagination: FavoritePagination;
}

export interface AddFavoriteRequest {
  songID: string;
}

export interface AddFavoriteResponse {
  favoriteID: string;
  createdAt: string | null;
  isNew: boolean;
}

export interface RemoveFavoriteRequest {
  songID: string;
}

export interface CheckFavoriteResponse {
  isFavorite: boolean;
}

