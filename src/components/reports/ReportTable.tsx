import React from 'react';
import type { ReportSummaryDto } from '@/types';
import ReportTableRow from './ReportTableRow';

interface ReportTableProps {
  reports: ReportSummaryDto[];
}

export default function ReportTable({ reports }: ReportTableProps) {
  return (
    <table className="min-w-full border-collapse">
      <thead>
        <tr>
          <th className="border px-4 py-2 text-left">Tytuł</th>
          <th className="border px-4 py-2 text-left">Data utworzenia</th>
          <th className="border px-4 py-2 text-left">Akcje</th>
        </tr>
      </thead>
      <tbody>
        {reports.map(report => (
          <ReportTableRow key={report.id} report={report} />
        ))}
      </tbody>
    </table>
  );
} 