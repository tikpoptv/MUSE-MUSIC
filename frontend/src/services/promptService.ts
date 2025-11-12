import apiService from './api';

export interface SavePromptRequest {
  promptText: string;
}

export interface SavePromptResponse {
  success: boolean;
  message?: string;
  data?: {
    promptID: string;
    promptText: string;
    isActive: boolean;
    updatedAt: string;
  };
  error?: string;
}

export const promptService = {
  async savePrompt(promptText: string): Promise<SavePromptResponse> {
    const url = '/api/prompts/save';
    const res = await apiService.post<SavePromptResponse>(url, { promptText });
    
    if (!res.success) {
      throw new Error(res.message || res.error || 'Failed to save prompt');
    }
    
    // Backend may return nested structure, extract data
    const response = res as SavePromptResponse & { data?: { data?: SavePromptResponse['data'] } };
    
    // Check if data is nested
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return {
        success: res.success,
        message: res.message,
        data: response.data.data,
        error: res.error
      };
    }
    
    // Return as is
    return res as SavePromptResponse;
  }
};

