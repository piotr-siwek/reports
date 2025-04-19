'use client';

import React from 'react';
import Link from 'next/link';
import ReportDeleteButton from './ReportDeleteButton';
import type { ReportSummaryDto } from '@/types';

interface ReportTableRowProps {
  report: ReportSummaryDto;
}

export default function ReportTableRow({ report }: ReportTableRowProps) {
  return (
    <tr>
      <td className="border px-4 py-2">
        <Link href={`/reports/${report.id}`}>{report.title}</Link>
      </td>
      <td className="border px-4 py-2">
        {new Date(report.createdAt).toLocaleString()}
      </td>
      <td className="border px-4 py-2 flex space-x-2">
        <Link href={`/reports/${report.id}`}> 
          <button className="btn btn-secondary">Edytuj</button>
        </Link>
        <ReportDeleteButton reportId={report.id} />
      </td>
    </tr>
  );
} 