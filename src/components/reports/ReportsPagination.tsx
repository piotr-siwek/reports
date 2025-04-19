'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/ui-shadn-helper';

interface ReportsPaginationProps {
  page: number;
  limit: number;
  total: number;
}

export default function ReportsPagination({ page, limit, total }: ReportsPaginationProps) {
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="flex items-center justify-center space-x-4">
      {page > 1 && (
        <Link href={`?page=${page - 1}`}> 
          <Button>Previous</Button>
        </Link>
      )}
      <span>Page {page} of {totalPages}</span>
      {page < totalPages && (
        <Link href={`?page=${page + 1}`}> 
          <Button>Next</Button>
        </Link>
      )}
    </div>
  );
} 