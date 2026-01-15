// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const config = {
  apiBaseUrl: API_BASE_URL,
  apiEndpoints: {
    process: `${API_BASE_URL}/api/v1/process`,
    stream: (documentId: string) => `${API_BASE_URL}/api/v1/stream/${documentId}`,
    status: (documentId: string) => `${API_BASE_URL}/api/v1/status/${documentId}`,
    health: `${API_BASE_URL}/health`,
  },
  maxFileSizeMB: 50,
  supportedFileTypes: ['application/pdf'],
};

export default config;
