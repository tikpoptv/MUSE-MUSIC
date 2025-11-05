import type { LyricsRecord } from '@/types/lyrics';

export interface AnalysisActions {
  translate: boolean;
  mood: boolean;
}

export interface TranslationConfig {
  originalLanguage?: string;
  targetLanguage: string;
}

export interface AnalysisRequest {
  lyricsRecord: LyricsRecord | { songID: string } & Partial<LyricsRecord>;
  actions: AnalysisActions;
  translationConfig?: TranslationConfig;
  shareRequest?: boolean; // Whether user wants to share with community (default: false)
}

export interface TranslationResult {
  text: string;
  interpretation: string | null;
  originalLanguage: string;
  targetLanguage: string;
}

export interface AnalysisResult {
  processingID: string;
  songID: string;
  status: 'completed' | 'processing' | 'failed';
  translation: TranslationResult | null;
  mood: unknown | null;
  alreadyExists?: boolean;
  message?: string;
}

