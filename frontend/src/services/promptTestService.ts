import apiService from './api';

export interface PromptTestRequest {
  newPromptText: string;
  lyrics: string;
  language1: string;
  language2: string;
  moodEnabled?: boolean;
  moodTopK?: number;
}

export interface TestResult {
  translation: string;
  interpretation: string;
  moodAnalyze: string | null;
}

// Raw response from backend (might have array)
export interface PromptTestResponseRaw {
  original: {
    prompt: string;
    result: TestResult[] | TestResult;
  };
  new: {
    prompt: string;
    result: TestResult[] | TestResult;
  };
  comparison: {
    translationChanged: boolean;
    interpretationChanged: boolean;
    moodChanged: boolean;
    summary: {
      hasChanges: boolean;
    };
  };
}

// Normalized response (always object, not array)
export interface PromptTestResponse {
  original: {
    prompt: string;
    result: TestResult;
  };
  new: {
    prompt: string;
    result: TestResult;
  };
  comparison: {
    translationChanged: boolean;
    interpretationChanged: boolean;
    moodChanged: boolean;
    summary: {
      hasChanges: boolean;
    };
  };
}

// Helper to normalize result (array to object)
export const normalizeTestResult = (result: TestResult[] | TestResult): TestResult => {
  if (Array.isArray(result)) {
    return result[0] || { translation: '', interpretation: '', moodAnalyze: null };
  }
  return result;
};

export const promptTestService = {
  async testPrompt(request: PromptTestRequest): Promise<PromptTestResponse> {
    const url = '/api/prompt-test/test';
    const res = await apiService.post<{ success: boolean; message?: string; data: PromptTestResponseRaw }>(url, request);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || res.error || 'Failed to test prompt');
    }
    
    // Backend response structure
    const backendResponse = res.data as { data?: PromptTestResponseRaw };
    
    if (!backendResponse.data) {
      throw new Error('Missing data in response');
    }
    
    // Normalize results (convert array to object if needed)
    const normalizedData: PromptTestResponse = {
      ...backendResponse.data,
      original: {
        ...backendResponse.data.original,
        result: normalizeTestResult(backendResponse.data.original.result)
      },
      new: {
        ...backendResponse.data.new,
        result: normalizeTestResult(backendResponse.data.new.result)
      }
    };
    
    return normalizedData;
  }
};

