import React from 'react';
<<<<<<< HEAD
import ReportList from './ReportList';
import type { ListReportsResponseDto } from '@/types';

// Dummy server action simulating API call to fetch reports
async function listReports({ page, limit, filter, sort }: { page: number; limit: number; filter: string; sort: string; }): Promise<ListReportsResponseDto> {
  // In a real implementation, replace with actual API call
  return {
    reports: [
      {
        id: 1,
        title: 'Test Report',
        summary: 'This is a summary of the test report.',
        createdAt: new Date().toISOString()
      }
    ],
    pagination: {
      page,
      limit,
      total: 1
    }
  };
}
=======
import { listReports } from '@/actions/reportActions';
import ReportList from './ReportList'; // Assuming ReportList is in the same directory
import ReportsPagination from './ReportsPagination'; // Import the actual component
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Replaced with basic div for now
// import { Terminal } from 'lucide-react'; // Icon not needed without Alert
>>>>>>> remove-idea-file

interface ReportListWrapperProps {
  page: number;
  limit: number;
  filter?: string;
<<<<<<< HEAD
  sort?: string;
}

export default async function ReportListWrapper({ page, limit, filter = '', sort = 'createdAt.desc' }: ReportListWrapperProps) {
  const data = await listReports({ page, limit, filter, sort });
  if (data.reports.length === 0) {
    return <div>Brak raportów</div>;
  }
  return <ReportList reports={data.reports} />;
=======
  sort?: string; // Optional sort parameter
}

export default async function ReportListWrapper({ 
  page, 
  limit, 
  filter, 
  sort 
}: ReportListWrapperProps) {
  
  // Fetch data using the server action
  const { reports, pagination, error } = await listReports({ page, limit, filter, sort });

  // Handle API errors
  if (error) {
    return (
      // Replaced Alert with a styled div
      <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
        <h4 className="font-medium">Błąd ładowania raportów</h4>
        <p className="text-sm">
          Nie udało się pobrać listy raportów. Spróbuj ponownie później.
        </p>
      </div>
    );
  }

  // Handle empty state
  if (reports.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Nie znaleziono żadnych raportów.</p>
        {filter && <p>Spróbuj zmienić filtry.</p>}
        {!filter && <p>Utwórz swój pierwszy raport!</p>}
      </div>
    );
  }

  // Render the list and pagination
  return (
    <div>
      <ReportList reports={reports} />
      
      {/* Render the actual pagination component if there are pages */}
      {pagination.total > pagination.limit && (
          <div className="mt-6 flex justify-center">
              <ReportsPagination 
                page={pagination.page}
                limit={pagination.limit}
                total={pagination.total} 
              />
          </div>
      )}
    </div>
  );
>>>>>>> remove-idea-file
} 