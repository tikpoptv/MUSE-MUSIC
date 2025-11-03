import apiService from './api';
import type { AnalysisRequest, AnalysisResult } from '@/types/analysis';

export interface ReAnalyzeRequest {
  actions: {
    translate: boolean;
    mood: boolean;
  };
  translationConfig?: {
    targetLanguage: string;
  };
}

export const analysisService = {
  async startAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    const url = '/api/analysis/start';
    const res = await apiService.post<{ success: boolean; message?: string; data: AnalysisResult; statusCode?: number }>(url, request);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Failed to start analysis');
    }
    
    // Backend response: { success, message, data: { processingID, songID, ... }, statusCode }
    // apiService wraps: { success, data: { success, message, data: {...}, statusCode } }
    // Access: res.data.data
    const backendResponse = res.data as { data?: AnalysisResult };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    return backendResponse.data;
  },

  async reAnalyze(processingID: string, request: ReAnalyzeRequest): Promise<AnalysisResult> {
    const url = `/api/analysis/${processingID}/re-analyze`;
    const res = await apiService.post<{ success: boolean; message?: string; data: AnalysisResult; statusCode?: number }>(url, request);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Failed to re-analyze');
    }
    
    const backendResponse = res.data as { data?: AnalysisResult };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    return backendResponse.data;
  }
};

