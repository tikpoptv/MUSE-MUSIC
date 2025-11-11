export interface AdminSong {
  processingID: string;
  songID: string;
  songName: string;
  songNameEnglish: string;
  artistName: string;
  genre: string;
  duration: number;
  language: string;
  targetLanguage?: string;
  lyrics?: string;
  status: string;
  shareStatus?: string;
  approvalStatus?: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string | null;
  createdBy: string;
  createdByUsername: string;
  createdByAvatar?: string | null;
  code: string;
  highlight: boolean;
}

export interface AdminSongsResponse {
  songs: AdminSong[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PendingCountResponse {
  count: number;
}

export interface ApproveRejectRequest {
  note?: string | null;
}

export interface BulkApproveRejectRequest {
  processingIDs: string[];
  note?: string | null;
}

export interface ApproveRejectResponse {
  processingID: string;
  songID: string;
  approvalStatus: string;
  shareStatus: string;
  approvedAt?: string;
}

export interface BulkApproveRejectResponse {
  approved?: number;
  rejected?: number;
  processingIDs: string[];
}

export type StatusFilter = 'all' | 'not_approve' | 'done' | 'private' | 'public_approved' | 'public_pending' | 'rejected';

export interface UpdateLyricsRequest {
  lyrics: string;
}

export interface UpdateLyricsResponse {
  processingID: string;
  translation: string;
  updatedAt: string;
}

