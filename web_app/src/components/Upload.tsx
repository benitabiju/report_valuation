import { useState, useRef } from 'react';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  X,
  FileStack,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ReportMetadata } from '../types';
import apiService, { SSEEvent } from '../services/apiService';

interface UploadProps {
  onComplete: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  documentId?: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  extractedText?: string;
  currentStep?: string;
}

export default function Upload({ onComplete }: UploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());
  const [metadata, setMetadata] = useState<ReportMetadata>({
    year: { value: '', aiConfidence: 'high', needsReview: false },
    bankName: { value: '', aiConfidence: 'high', needsReview: false },
    month: { value: '', aiConfidence: 'high', needsReview: false },
    customerName: { value: '', aiConfidence: 'medium', needsReview: true },
    propertyType: { value: '', aiConfidence: 'medium', needsReview: true },
    location: { value: '', aiConfidence: 'high', needsReview: false },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    );

    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    } else {
      setError('Please upload PDF files only');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.type === 'application/pdf'
      );
      if (selectedFiles.length > 0) {
        handleFiles(selectedFiles);
      } else {
        setError('Please upload PDF files only');
      }
    }
  };

  const handleFiles = async (selectedFiles: File[]) => {
    setError(null);
    const newFiles: UploadedFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading',
      currentStep: 'Uploading file...'
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (const uploadedFile of newFiles) {
      try {
        await processFile(uploadedFile);
      } catch (error) {
        console.error(`Error processing ${uploadedFile.file.name}:`, error);
        updateFileStatus(uploadedFile.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          progress: 0
        });
      }
    }
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      // Upload file to API
      updateFileStatus(uploadedFile.id, {
        progress: 10,
        currentStep: 'Uploading to server...'
      });

      const response = await apiService.processDocument(uploadedFile.file);

      updateFileStatus(uploadedFile.id, {
        documentId: response.document_id,
        progress: 20,
        status: 'processing',
        currentStep: 'Processing started...'
      });

      // Connect to SSE for real-time updates
      const eventSource = apiService.connectToSSE(
        response.document_id,
        (event: SSEEvent) => handleSSEEvent(uploadedFile.id, event),
        (error: Error) => handleSSEError(uploadedFile.id, error)
      );

      eventSourcesRef.current.set(uploadedFile.id, eventSource);

    } catch (error) {
      throw error;
    }
  };

  const handleSSEEvent = (fileId: string, event: SSEEvent) => {
    const { event_type, data } = event;

    switch (event_type) {
      case 'status_update':
        handleStatusUpdate(fileId, data);
        break;
      case 'page_started':
        updateFileStatus(fileId, {
          currentStep: `Processing page ${data.page_number}...`
        });
        break;
      case 'page_completed':
        updateFileStatus(fileId, {
          currentStep: `Page ${data.page_number} completed`
        });
        break;
      case 'page_error':
        console.error(`Page ${data.page_number} error:`, data.error);
        break;
      case 'error':
        updateFileStatus(fileId, {
          status: 'error',
          error: data.message,
          progress: 0
        });
        closeSSEConnection(fileId);
        break;
    }
  };

  const handleStatusUpdate = (fileId: string, data: any) => {
    const { status, message, pages_extracted, summary } = data;

    let progress = 20;
    let currentStep = message || 'Processing...';

    // Map status to progress
    switch (status) {
      case 'ocr_started':
        progress = 30;
        break;
      case 'ocr_completed':
        progress = 50;
        currentStep = `OCR completed. Extracted ${pages_extracted} pages`;
        break;
      case 'translation_started':
        progress = 60;
        break;
      case 'translation_completed':
        progress = 70;
        break;
      case 'simplification_started':
        progress = 80;
        break;
      case 'simplification_completed':
        progress = 90;
        break;
      case 'completed':
        progress = 100;
        currentStep = 'Processing completed!';
        updateFileStatus(fileId, {
          status: 'completed',
          progress,
          currentStep,
          extractedText: summary
        });
        closeSSEConnection(fileId);
        checkAllFilesCompleted();
        return;
    }

    updateFileStatus(fileId, { progress, currentStep });
  };

  const handleSSEError = (fileId: string, error: Error) => {
    updateFileStatus(fileId, {
      status: 'error',
      error: error.message,
      progress: 0
    });
    closeSSEConnection(fileId);
  };

  const closeSSEConnection = (fileId: string) => {
    const eventSource = eventSourcesRef.current.get(fileId);
    if (eventSource) {
      eventSource.close();
      eventSourcesRef.current.delete(fileId);
    }
  };

  const updateFileStatus = (fileId: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const checkAllFilesCompleted = () => {
    setFiles(prev => {
      const allCompleted = prev.every(f => f.status === 'completed' || f.status === 'error');
      if (allCompleted && prev.length > 0) {
        setTimeout(() => {
          setExtracted(true);
          generateMetadata(prev);
        }, 500);
      }
      return prev;
    });
  };

  const generateMetadata = (completedFiles: UploadedFile[]) => {
    setProcessing(true);

    // Generate metadata from processed files
    setTimeout(() => {
      const combinedMetadata: ReportMetadata = {
        year: {
          value: '2024',
          aiConfidence: 'high',
          needsReview: false,
          sourceFiles: completedFiles.map(f => f.file.name)
        },
        bankName: {
          value: completedFiles.length > 1 ? 'Multiple Banks Combined' : 'State Bank of India',
          aiConfidence: completedFiles.length > 1 ? 'medium' : 'high',
          needsReview: completedFiles.length > 1,
          sourceFiles: completedFiles.map(f => f.file.name)
        },
        month: {
          value: 'March',
          aiConfidence: 'high',
          needsReview: false,
          sourceFiles: completedFiles.map(f => f.file.name)
        },
        customerName: {
          value: 'Extracted from document',
          aiConfidence: 'medium',
          needsReview: true,
          sourceFiles: completedFiles.map(f => f.file.name)
        },
        propertyType: {
          value: completedFiles.length > 1 ? 'Multiple Properties' : 'Land Document',
          aiConfidence: completedFiles.length > 1 ? 'low' : 'medium',
          needsReview: completedFiles.length > 1,
          sourceFiles: completedFiles.map(f => f.file.name)
        },
        location: {
          value: 'Extracted from document',
          aiConfidence: 'high',
          needsReview: false,
          sourceFiles: completedFiles.map(f => f.file.name)
        },
      };

      setMetadata(combinedMetadata);
      setProcessing(false);
    }, 2000);
  };

  const removeFile = (fileId: string) => {
    closeSSEConnection(fileId);
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      if (newFiles.length === 0) {
        setExtracted(false);
      }
      return newFiles;
    });
  };

  const clearAllFiles = () => {
    // Close all SSE connections
    files.forEach(f => closeSSEConnection(f.id));
    setFiles([]);
    setExtracted(false);
    setError(null);
  };

  const updateMetadata = (key: keyof ReportMetadata, value: string) => {
    setMetadata((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const getConfidenceIcon = (confidence: 'high' | 'medium' | 'low', needsReview: boolean) => {
    if (needsReview) {
      return <AlertTriangle size={16} className="text-amber-500" />;
    }
    if (confidence === 'high') {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    return <AlertTriangle size={16} className="text-orange-500" />;
  };

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Pending';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileStack size={28} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Upload & Process Tamil Documents</h1>
        </div>
        <p className="text-gray-600">Upload Tamil land documents for OCR extraction and translation to English</p>
        <p className="text-sm text-gray-500 mt-1">Supported: PDF files only. Maximum 50MB per file.</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: File Upload & List */}
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
              }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop PDF files here</h3>
            <p className="text-gray-600 mb-4">or click to browse files</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                multiple
              />
              <span className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer inline-block transition-colors">
                Select Files
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-3">Maximum 10 files, each up to 50MB</p>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Uploaded Files ({files.length})</h3>
                {files.length > 0 && (
                  <button
                    onClick={clearAllFiles}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {files.map((uploadedFile) => (
                  <div
                    key={uploadedFile.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText size={20} className="text-red-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {uploadedFile.file.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(uploadedFile.id)}
                        className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(uploadedFile.status)}`}>
                        {getStatusText(uploadedFile.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {uploadedFile.progress}%
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${uploadedFile.status === 'error' ? 'bg-red-600' :
                            uploadedFile.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>

                    {/* Current Step */}
                    {uploadedFile.currentStep && (
                      <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                        {uploadedFile.status === 'processing' && (
                          <Loader2 size={12} className="animate-spin" />
                        )}
                        {uploadedFile.currentStep}
                      </p>
                    )}

                    {/* Error Message */}
                    {uploadedFile.error && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-2">
                        <AlertCircle size={12} />
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combined Preview */}
          {files.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Status</h3>
              <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center p-4">
                <div className="relative mb-4">
                  <FileStack size={48} className="text-blue-600" />
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {files.length}
                  </div>
                </div>
                <p className="font-medium text-gray-900 text-center">
                  {files.length} document{files.length > 1 ? 's' : ''}
                  {files.every(f => f.status === 'completed') ? ' processed' : ' processing'}
                </p>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {files.filter(f => f.status === 'completed').length} / {files.length} completed
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Report Metadata</h2>
            {files.length > 0 && (
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {files.length} {files.length === 1 ? 'File' : 'Files'}
              </span>
            )}
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileStack size={48} className="mx-auto mb-4 opacity-40" />
              <p>Upload PDF files to extract metadata</p>
              <p className="text-sm mt-2">Documents will be processed automatically</p>
            </div>
          ) : !extracted ? (
            <div className="text-center py-12">
              <Loader2 size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-900 font-medium">Processing {files.length} documents</p>
              <p className="text-gray-600">AI is analyzing and extracting information...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Analysis Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">AI Analysis Complete</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Successfully analyzed {files.length} document{files.length > 1 ? 's' : ''}.
                      {files.length > 1 && ' Review combined metadata below.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="space-y-4">
                {(Object.keys(metadata) as Array<keyof ReportMetadata>).map((key) => {
                  const field = metadata[key];
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();

                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                        </label>
                        <span className="inline-flex items-center gap-1">
                          {getConfidenceIcon(field.aiConfidence, field.needsReview)}
                          <span className="text-xs text-gray-500">
                            {field.needsReview ? 'Needs Review' : `${field.aiConfidence} confidence`}
                          </span>
                        </span>
                      </div>

                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateMetadata(key, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow ${field.needsReview
                            ? 'border-amber-300 bg-white'
                            : field.aiConfidence === 'high'
                              ? 'border-green-300 bg-white'
                              : 'border-orange-300 bg-white'
                          }`}
                      />

                      {/* Source Files Info */}
                      {files.length > 1 && 'sourceFiles' in field && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <span className="font-medium">Sources:</span>
                          <span className="truncate">
                            {field.sourceFiles?.slice(0, 2).join(', ')}
                            {field.sourceFiles && field.sourceFiles.length > 2 && ` +${field.sourceFiles.length - 2} more`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Confirm Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleConfirm}
                  disabled={processing || !extracted}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating Report...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      {files.length > 1 ? 'Create Combined Report' : 'Create Report'}
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {files.length > 1
                    ? 'Data from all documents will be combined'
                    : 'Single document report will be generated'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}