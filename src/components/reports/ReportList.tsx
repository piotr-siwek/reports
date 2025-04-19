import React from 'react';
import type { ReportSummaryDto } from '@/types';

interface ReportListProps {
  reports: ReportSummaryDto[];
}

export default function ReportList({ reports }: ReportListProps) {
  return (
    <div>
      {reports.map(report => (
        <div key={report.id} className="mb-4 p-4 border rounded">
          <h2 className="font-bold">{report.title}</h2>
          <p>{report.summary}</p>
          <p className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
} 