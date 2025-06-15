import axios from 'axios';
import { ParsedOrder, ApiResponse } from '@shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderApi = {
  processEmail: async (emailContent: string): Promise<ParsedOrder> => {
    const response = await api.post<ApiResponse<ParsedOrder>>('/api/orders/process-email', {
      emailContent
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to process email');
    }
    
    return response.data.data;
  },

  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health');
      return response.data.success;
    } catch {
      return false;
    }
  }
};

export default api; 