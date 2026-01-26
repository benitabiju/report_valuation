import { apiClient } from '../services/apiClient';
import { ValuationReport, ReportStatus } from '../types';

export interface ReportListResponse {
    reports: ValuationReport[];
    total: number;
    page: number;
    per_page: number;
}

export interface CreateReportRequest {
    customer_name: string;
    bank_name: string;
    property_type: string;
    location: string;
}

export interface UpdateReportRequest {
    content?: ValuationReport['content'];
    status?: ReportStatus;
    metadata?: Partial<ValuationReport['metadata']>;
}

export const reportsApi = {
    getAll: async (page = 1, perPage = 10): Promise<ReportListResponse> => {
        return apiClient.get<ReportListResponse>(`/api/v1/reports?page=${page}&per_page=${perPage}`);
    },

    getById: async (reportId: string): Promise<ValuationReport> => {
        return apiClient.get<ValuationReport>(`/api/v1/reports/${reportId}`);
    },

    create: async (data: CreateReportRequest): Promise<ValuationReport> => {
        return apiClient.post<ValuationReport>('/api/v1/reports', data);
    },

    update: async (reportId: string, data: UpdateReportRequest): Promise<ValuationReport> => {
        return apiClient.patch<ValuationReport>(`/api/v1/reports/${reportId}`, data);
    },

    updateStatus: async (reportId: string, status: ReportStatus): Promise<ValuationReport> => {
        return apiClient.patch<ValuationReport>(`/api/v1/reports/${reportId}/status`, { status });
    },

    delete: async (reportId: string): Promise<void> => {
        return apiClient.delete<void>(`/api/v1/reports/${reportId}`);
    },

    exportPdf: async (reportId: string): Promise<Blob> => {
        return apiClient.downloadBlob(`/api/v1/reports/${reportId}/export/pdf`);
    },

    exportDocx: async (reportId: string): Promise<Blob> => {
        return apiClient.downloadBlob(`/api/v1/reports/${reportId}/export/docx`);
    },
};

export default reportsApi;
