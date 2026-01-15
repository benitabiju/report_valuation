export type ReportStatus = 'draft' | 'review' | 'approved';

export type PropertyType = 'Residential' | 'Commercial' | 'Industrial' | 'Land' | 'Mixed Use';

export type FileType = 'original' | 'extracted' | 'draft' | 'final';

export interface MetadataField {
  value: string;
  aiConfidence: 'high' | 'medium' | 'low';
  needsReview: boolean;
}

export interface ReportMetadata {
  year: MetadataField;
  bankName: MetadataField;
  month: MetadataField;
  customerName: MetadataField;
  propertyType: MetadataField;
  location: MetadataField;
}

export interface ReportFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  uploadedAt: Date;
  url: string;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  resolved: boolean;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  details: string;
}

export interface ValuationReport {
  id: string;
  customerName: string;
  bankName: string;
  propertyType: PropertyType;
  location: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  year: string;
  month: string;
  files: ReportFile[];
  metadata: ReportMetadata;
  content: {
    summary: string;
    propertyDetails: string;
    valuationMethod: string;
    finalValuation: string;
  };
  comments: Comment[];
  auditTrail: AuditEntry[];
}

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  reportId?: string;
  fileType?: FileType;
}

export interface DashboardStats {
  totalReports: number;
  draftReports: number;
  reviewReports: number;
  approvedReports: number;
  recentUploads: number;
}
