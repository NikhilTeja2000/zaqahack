import dotenv from 'dotenv';
import { AppConfig } from '../../../shared/types';

dotenv.config();

export const config: AppConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  port: parseInt(process.env.PORT || '3001'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

export const validateConfig = (): void => {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
}; 