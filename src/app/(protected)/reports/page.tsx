import React, { Suspense } from 'react';
import Link from 'next/link';
import ReportFilterInput from '@/components/reports/ReportFilterInput';
import ReportListWrapper from '@/components/reports/ReportListWrapper';
// import ReportsPagination from '@/components/reports/ReportsPagination'; // Removed unused import for now
import { Button } from '@/components/ui/button'; // Assuming shadcn button path
import { Skeleton } from "@/components/ui/skeleton"; // Import the Skeleton component

// Props definition according to the plan
interface ReportsPageProps {
  searchParams?: Promise<{
    page?: string;
    filter?: string;
    sort?: string;
    limit?: string;
  }>;
}

// Reports page component (Server Component)
export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  // Parse searchParams with defaults
  const sp = await searchParams;
  const page = Number(sp?.page || '1');
  const limit = Number(sp?.limit || '10'); // Default limit: 10
  const filter = sp?.filter || '';
  const sort = sp?.sort; // Let wrapper handle default sort

  return (
    <div className="container mx-auto px-4 py-8"> {/* Basic container styling */}
      {/* Header Section */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Twoje Raporty!</h1>
        <Link href="/reports/generate" passHref>
          <Button>Generuj Nowy Raport</Button>
        </Link>
      </header>

      {/* Controls Section */}
      <div className="mb-6">
        <ReportFilterInput initialFilterValue={filter} />
        {/* Sorting controls can be added here later */}
      </div>

      {/* Report List Section with Suspense */}
      <section className="mb-6">
        <Suspense fallback={<ReportsLoadingSkeleton />}>
          <ReportListWrapper 
            page={page} 
            limit={limit} 
            filter={filter} 
            sort={sort} 
          />
        </Suspense>
      </section>

      {/* Pagination Section - Will need total count from ReportListWrapper eventually */}
      {/* For now, pagination component is just a placeholder */}
      <footer className="flex justify-center">
        {/* 
          The Pagination component will eventually need the 'total' count. 
          This count is fetched within ReportListWrapper. We might need to adjust 
          how this data is passed or fetch the count separately here. 
          For now, rendering placeholder/client component which handles its own logic based on URL.
        */}
        {/* <ReportsPagination 
          page={page} 
          limit={limit} 
          // Total needs to be passed from the list response
        /> */}
        <p className="text-sm text-muted-foreground">Paginacja (do implementacji)</p> 
      </footer>
    </div>
  );
}

// Basic Skeleton Loader for Reports List - improved version
function ReportsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header row skeleton */}
      <div className="flex justify-between space-x-4 px-4 py-2">
        <Skeleton className="h-4 w-[50%]" />
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[10%]" />
      </div>
      {/* Data rows skeleton */}
      {Array.from({ length: 5 }).map((_, index) => ( // Simulate 5 rows loading
        <div key={index} className="flex justify-between space-x-4 rounded-md border p-4">
          <Skeleton className="h-4 w-[50%]" />
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[10%]" />
        </div>
      ))}
      {/* Pagination skeleton */}
      <div className="flex justify-center pt-4">
        <Skeleton className="h-8 w-[200px]" />
      </div>
    </div>
  );
} 