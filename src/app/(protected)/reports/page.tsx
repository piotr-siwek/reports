import { Suspense } from 'react';
import Link from 'next/link';
import ReportFilterInput from '@/components/reports/ReportFilterInput';
import ReportListWrapper from '@/components/reports/ReportListWrapper';
import { ReportsPagination } from '@/components/reports';
import { Button } from '@/ui-shadn-helper';

interface ReportsPageProps {
  searchParams?: Promise<{
    page?: string;
    filter?: string;
    sort?: string;
    limit?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const sp = await searchParams;
  const page = sp?.page ? Number(sp.page) : 1;
  const filter = sp?.filter || '';
  const sort = sp?.sort || 'createdAt.desc';
  const limit = sp?.limit ? Number(sp.limit) : 10;

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Twoje Raporty</h1>
        <Link href="/reports/generate">
          <Button className="btn-primary">Generuj Nowy Raport</Button>
        </Link>
      </header>
      <div className="py-4">
        <ReportFilterInput initialFilterValue={filter} />
      </div>
      <section className="py-4">
        <Suspense fallback={<div>Loading...</div>}>
          <ReportListWrapper page={page} limit={limit} filter={filter} sort={sort} />
        </Suspense>
      </section>
      <footer className="py-4">
        <ReportsPagination page={page} limit={limit} total={50} />
      </footer>
    </div>
  );
} 