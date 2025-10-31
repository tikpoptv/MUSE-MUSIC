import apiService from './api';
import type { AnalysisRequest, AnalysisResult } from '@/types/analysis';

export const analysisService = {
  async startAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    const url = '/api/analysis/start';
    const res = await apiService.post<AnalysisResult>(url, request);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to start analysis');
    }
    
    return res.data;
  }
};

