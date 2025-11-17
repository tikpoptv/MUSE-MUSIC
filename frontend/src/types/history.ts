export interface SaveTranslationRequest {
  songID: string;
  processingID: string;
}

export interface SaveTranslationResponse {
  historyID: string;
  timeStamp: string;
}

export interface HistorySong {
  songID: string;
  songName: string;
  artistName: string;
  coverImage: string | null;
}

export interface HistoryProcessing {
  processingID: string;
  translation: string | null;
  targetLanguage: string | null;
  originalLanguage: string | null;
}

export interface HistoryItem {
  historyID: string;
  songID: string;
  processingID: string | null;
  timeStamp: string;
  deviceInfo: string | null;
  actionType: 'view' | 'save';
  song: HistorySong;
  processing: HistoryProcessing | null;
}

export interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserHistoryResponse {
  history: HistoryItem[];
  pagination: HistoryPagination;
}

