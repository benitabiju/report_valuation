import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import FileManagement from './components/FileManagement';
import ReportEditor from './components/ReportEditor';
import ReviewApproval from './components/ReviewApproval';
import { mockReports, mockDashboardStats, buildFileTree } from './data/mockData';
import { ValuationReport, ReportStatus } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [reports, setReports] = useState<ValuationReport[]>(mockReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleNavigate = (page: string, reportId?: string) => {
    setCurrentPage(page);
    if (reportId) {
      setSelectedReportId(reportId);
    }
  };

  const handleUploadComplete = () => {
    setCurrentPage('dashboard');
  };

  const handleSaveReport = (reportId: string, content: ValuationReport['content']) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, content, updatedAt: new Date() }
          : report
      )
    );
  };

  const handleSendForReview = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, status: 'review', updatedAt: new Date() }
          : report
      )
    );
    setCurrentPage('review');
  };

  const handleStatusChange = (reportId: string, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, status, updatedAt: new Date() }
          : report
      )
    );
  };

  const handleExport = (reportId: string, format: 'pdf' | 'docx') => {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      alert(`Exporting ${report.customerName}'s report as ${format.toUpperCase()}`);
    }
  };

  const selectedReport = selectedReportId
    ? reports.find((r) => r.id === selectedReportId) || null
    : null;

  const fileTree = buildFileTree(reports);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            stats={mockDashboardStats}
            recentReports={reports}
            onNavigate={handleNavigate}
          />
        );
      case 'upload':
        return <Upload onComplete={handleUploadComplete} />;
      case 'files':
        return (
          <FileManagement
            fileTree={fileTree}
            reports={reports}
            onNavigate={handleNavigate}
          />
        );
      case 'editor':
        return (
          <ReportEditor
            report={selectedReport}
            onBack={() => setCurrentPage('dashboard')}
            onSave={handleSaveReport}
            onSendForReview={handleSendForReview}
          />
        );
      case 'review':
        return (
          <ReviewApproval
            report={selectedReport}
            onBack={() => setCurrentPage('dashboard')}
            onStatusChange={handleStatusChange}
            onExport={handleExport}
          />
        );
      default:
        return (
          <Dashboard
            stats={mockDashboardStats}
            recentReports={reports}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

export default App;
