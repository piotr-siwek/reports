import React from 'react';
import Link from 'next/link';
import ReportDeleteButton from './ReportDeleteButton';
import type { ReportSummaryDto } from '@/types';

interface ReportCardProps {
  report: ReportSummaryDto;
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="border rounded shadow-md p-4 mb-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold">{report.title}</h2>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
        <p>{report.summary}</p>
      </div>
      <div className="flex justify-between">
        <Link href={`/reports/${report.id}`}>
          <button className="btn btn-secondary">Edytuj</button>
        </Link>
        <ReportDeleteButton reportId={report.id} />
      </div>
    </div>
  );
} 