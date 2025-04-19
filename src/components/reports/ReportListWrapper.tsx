import React from 'react';
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

interface ReportListWrapperProps {
  page: number;
  limit: number;
  filter?: string;
  sort?: string;
}

export default async function ReportListWrapper({ page, limit, filter = '', sort = 'createdAt.desc' }: ReportListWrapperProps) {
  const data = await listReports({ page, limit, filter, sort });
  if (data.reports.length === 0) {
    return <div>Brak raportów</div>;
  }
  return <ReportList reports={data.reports} />;
} 