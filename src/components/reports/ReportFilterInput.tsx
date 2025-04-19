'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface ReportFilterInputProps {
  initialFilterValue?: string;
}

export default function ReportFilterInput({ initialFilterValue = '' }: ReportFilterInputProps) {
  const [filter, setFilter] = useState(initialFilterValue);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (filter) {
        params.set('filter', filter);
      } else {
        params.delete('filter');
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [filter, router, pathname, searchParams]);

  return (
    <Input
      type="text"
      value={filter}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
      placeholder="Filtruj raporty..."
      className="input input-bordered w-full"
    />
  );
} 