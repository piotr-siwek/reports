import React from 'react';
<<<<<<< HEAD
import type { ReportSummaryDto } from '@/types';
=======
import { ReportSummaryDto } from '@/types';
import ReportTable from './ReportTable'; // Placeholder
import ReportCard from './ReportCard';   // Placeholder
>>>>>>> remove-idea-file

interface ReportListProps {
  reports: ReportSummaryDto[];
}

export default function ReportList({ reports }: ReportListProps) {
<<<<<<< HEAD
  return (
    <div>
      {reports.map(report => (
        <div key={report.id} className="mb-4 p-4 border rounded">
          <h2 className="font-bold">{report.title}</h2>
          <p>{report.summary}</p>
          <p className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
        </div>
      ))}
=======
  // Render table on medium screens and up, cards on smaller screens
  return (
    <div>
      {/* Desktop View (Table) - Hidden on small screens */}
      <div className="hidden md:block">
        <ReportTable reports={reports} /> 
      </div>

      {/* Mobile View (Cards) - Hidden on medium screens and up */}
      <div className="block space-y-4 md:hidden">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
>>>>>>> remove-idea-file
    </div>
  );
} 