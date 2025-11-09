import apiService from './api';

export interface UploadImageResponse {
  objectName: string;
  proxyUrl: string;
  bucketName: string;
}

export const imageService = {
  async uploadImage(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('image', file);

    const res = await apiService.post<{ 
      success: boolean; 
      message?: string; 
      data: UploadImageResponse;
      error?: string;
    }>(
      '/api/images/upload',
      formData
    );

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || 'Failed to upload image');
    }

    const backendResponse = res.data as { 
      success: boolean; 
      message?: string; 
      data: UploadImageResponse;
    };

    if (!backendResponse.success || !backendResponse.data) {
      throw new Error(backendResponse.message || 'Failed to upload image');
    }

    const proxyUrl = backendResponse.data.proxyUrl;
    
    if (proxyUrl.startsWith('http')) {
      const url = new URL(proxyUrl);
      return url.pathname;
    }
    return proxyUrl;
  },

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    const res = await apiService.delete<{ 
      success: boolean; 
      message?: string;
      error?: string;
    }>(
      '/api/images/delete',
      { url: imageUrl }
    );

    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to delete image');
    }
  }
};

