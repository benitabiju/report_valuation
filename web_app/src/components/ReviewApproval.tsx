import { useState } from 'react';
import { Download, FileText, CheckCircle, XCircle, Clock, ChevronLeft, History } from 'lucide-react';
import { ValuationReport, ReportStatus } from '../types';

interface ReviewApprovalProps {
  report: ValuationReport | null;
  onBack: () => void;
  onStatusChange: (reportId: string, status: ReportStatus) => void;
  onExport: (reportId: string, format: 'pdf' | 'docx') => void;
}

export default function ReviewApproval({ report, onBack, onStatusChange, onExport }: ReviewApprovalProps) {
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  if (!report) {
    return (
      <div className="p-8">
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600">Select a report to review</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'review':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusWorkflow: { status: ReportStatus; label: string; icon: JSX.Element }[] = [
    { status: 'draft', label: 'Draft', icon: <Clock size={16} /> },
    { status: 'review', label: 'Under Review', icon: <FileText size={16} /> },
    { status: 'approved', label: 'Approved', icon: <CheckCircle size={16} /> },
  ];

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuditTrail(!showAuditTrail)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <History size={18} />
              <span className="font-medium">Audit Trail</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onExport(report.id, 'pdf')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                <span className="font-medium">PDF</span>
              </button>
              <button
                onClick={() => onExport(report.id, 'docx')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                <span className="font-medium">DOCX</span>
              </button>
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{report.customerName}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>{report.bankName}</span>
            <span>•</span>
            <span>{report.propertyType}</span>
            <span>•</span>
            <span>{report.location}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Status</h2>
              <div className="flex items-center justify-between mb-6">
                {statusWorkflow.map((item, index) => (
                  <div key={item.status} className="flex items-center flex-1">
                    <button
                      onClick={() => onStatusChange(report.id, item.status)}
                      className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-colors ${
                        report.status === item.status
                          ? getStatusColor(item.status)
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                    {index < statusWorkflow.length - 1 && (
                      <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Created:</strong>{' '}
                  {new Intl.DateTimeFormat('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(report.createdAt)}
                </p>
                <p className="mt-1">
                  <strong>Last Updated:</strong>{' '}
                  {new Intl.DateTimeFormat('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(report.updatedAt)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{report.content.summary}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{report.content.propertyDetails}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Valuation Method</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{report.content.valuationMethod}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Final Valuation</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{report.content.finalValuation}</div>
            </div>
          </div>
        </div>

        <div className="w-96 bg-white border-l border-gray-200 overflow-auto">
          {!showAuditTrail ? (
            <div>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Comments</h3>
              </div>
              <div className="p-4 space-y-4">
                {report.comments.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">No comments yet</p>
                ) : (
                  report.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">{comment.user}</span>
                        {comment.resolved ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Intl.DateTimeFormat('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(comment.timestamp)}
                      </p>
                    </div>
                  ))
                )}
                <div className="pt-4 border-t border-gray-200">
                  <textarea
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows={3}
                  />
                  <button className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Audit Trail</h3>
                <p className="text-xs text-gray-600 mt-1">Complete history of all changes</p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {report.auditTrail.map((entry, index) => (
                    <div key={entry.id} className="relative">
                      {index < report.auditTrail.length - 1 && (
                        <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className="flex gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-600 mt-1 relative z-10" />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{entry.action}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{entry.user}</p>
                          <p className="text-xs text-gray-500 mt-1">{entry.details}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Intl.DateTimeFormat('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
