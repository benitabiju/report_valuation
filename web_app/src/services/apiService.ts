import config from '../config/config';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProcessResponse {
  success: boolean;
  document_id: string;
  message: string;
  sse_endpoint: string;
  file_name: string;
  file_size_mb: number;
}

export interface SSEEvent {
  event_type: string;
  data: any;
  document_id: string;
  timestamp: string;
}

export interface StatusUpdate {
  status: string;
  message: string;
  page_number?: number;
  pages_extracted?: number;
  summary?: string;
  total_pages?: number;
}

export type SSEEventCallback = (event: SSEEvent) => void;
export type SSEErrorCallback = (error: Error) => void;

class APIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  /**
   * Upload and process a document
   */
  async processDocument(file: File): Promise<ProcessResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(config.apiEndpoints.process, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  /**
   * Connect to SSE stream for real-time updates
   */
  connectToSSE(
    documentId: string,
    onMessage: SSEEventCallback,
    onError: SSEErrorCallback
  ): EventSource {
    const eventSource = new EventSource(config.apiEndpoints.stream(documentId));

    // Handle different event types
    const eventTypes = [
      'status_update',
      'page_started',
      'page_completed',
      'page_error',
      'error',
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          onMessage({
            event_type: eventType,
            data: data.data,
            document_id: data.document_id,
            timestamp: data.timestamp,
          });
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      });
    });

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      onError(new Error('SSE connection failed'));
      eventSource.close();
    };

    return eventSource;
  }

  /**
   * Get document processing status
   */
  async getDocumentStatus(documentId: string): Promise<any> {
    try {
      const response = await fetch(config.apiEndpoints.status(documentId));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching status:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(config.apiEndpoints.health);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;
