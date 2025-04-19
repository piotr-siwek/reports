import React from 'react';
import { ReportSummaryDto } from '@/types';
import ReportTable from './ReportTable'; // Placeholder
import ReportCard from './ReportCard';   // Placeholder

interface ReportListProps {
  reports: ReportSummaryDto[];
}

export default function ReportList({ reports }: ReportListProps) {
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
    </div>
  );
} 