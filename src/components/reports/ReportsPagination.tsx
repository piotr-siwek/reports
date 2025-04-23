'use client';

import React from 'react';
<<<<<<< HEAD
import Link from 'next/link';
import { Button } from '@/ui-shadn-helper';
=======
import { usePathname, useSearchParams } from 'next/navigation';
// import Link from 'next/link'; // Removed unused import
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
>>>>>>> remove-idea-file

interface ReportsPaginationProps {
  page: number;
  limit: number;
  total: number;
<<<<<<< HEAD
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
=======
  siblingCount?: number; // Number of page links to show on each side of the current page
}

// Helper function to generate pagination range
const generatePaginationRange = (currentPage: number, totalPages: number, siblingCount: number) => {
  const totalPageNumbers = siblingCount + 5; // siblingCount + firstPage + lastPage + currentPage + 2*ellipsis

  // Case 1: Number of pages is less than the page numbers we want to show
  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Case 2: No left ellipsis, but right ellipsis needed
  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', lastPageIndex];
  }

  // Case 3: No right ellipsis, but left ellipsis needed
  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
    return [firstPageIndex, '...', ...rightRange];
  }

  // Case 4: Both ellipsis needed
  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
  }

  // Default fallback (should not happen with above logic)
  return []; 
};

export default function ReportsPagination({ 
  page, 
  limit, 
  total, 
  siblingCount = 1 
}: ReportsPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const paginationRange = generatePaginationRange(page, totalPages, siblingCount);

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious 
            href={createPageURL(page - 1)}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>

        {/* Page Number Links */}
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>;
          }
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink 
                href={createPageURL(pageNumber)}
                isActive={page === pageNumber}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext 
            href={createPageURL(page + 1)}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
>>>>>>> remove-idea-file
  );
} 