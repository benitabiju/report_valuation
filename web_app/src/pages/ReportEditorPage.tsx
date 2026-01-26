import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReportEditor from '../components/report/ReportEditor';
import { mockReports } from '../data/mockData';
import { ValuationReport, ReportStatus } from '../types';

export default function ReportEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [reports, setReports] = useState<ValuationReport[]>(mockReports);

  const selectedReport =
    id ? reports.find(report => report.id === id) || null : null;

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = (reportId: string, content: ValuationReport['content']) => {
    setReports(prev =>
      prev.map(report =>
        report.id === reportId
          ? { ...report, content, updatedAt: new Date() }
          : report
      )
    );
};

  const handleSendForReview = (reportId: string) => {
    setReports(prev =>
      prev.map(report =>
        report.id === reportId
          ? {
              ...report,
              status: 'review' as ReportStatus,
              updatedAt: new Date(),
            }
          : report
      )
    );

    navigate(`/reports/${reportId}/review`);
  };

  return (
    <ReportEditor
      report={selectedReport}
      onBack={handleBack}
      onSave={handleSave}
      onSendForReview={handleSendForReview}
    />
  );
}
