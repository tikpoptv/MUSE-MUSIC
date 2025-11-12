import apiService from './api';

export interface WorkflowInfo {
  workflow: {
    id: string;
    name: string;
    active: boolean;
  };
  prompt: string | null;
}

export interface WorkflowInfoResponse {
  success: boolean;
  message: string;
  data?: WorkflowInfo;
  error?: string;
}

export const n8nWorkflowService = {
  async getWorkflowInfo(): Promise<WorkflowInfo | null> {
    try {
      const response = await apiService.get<{
        success: boolean;
        message?: string;
        data: WorkflowInfo;
      }>('/api/n8n/workflow');

      if (response.success && response.data) {
        const backendResponse = response.data as {
          success?: boolean;
          message?: string;
          data?: WorkflowInfo;
        };

        if (backendResponse.data) {
          return backendResponse.data;
        }

        if ('workflow' in response.data && 'prompt' in response.data) {
          return response.data as unknown as WorkflowInfo;
        }
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch workflow info:', error);
      return null;
    }
  }
};

