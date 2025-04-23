'use client';

import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';

interface ReportFilterInputProps {
  initialFilterValue?: string;
  debounceTime?: number;
}

export default function ReportFilterInput({ 
  initialFilterValue = '', 
  debounceTime = 300 
}: ReportFilterInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(initialFilterValue);

  // Debounced function to update URL
  const debouncedUpdateUrl = useDebouncedCallback((value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value) {
      current.delete('filter');
    } else {
      current.set('filter', value);
    }
    // Reset page to 1 when filter changes
    current.set('page', '1'); 

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.replace(`${pathname}${query}`);
  }, debounceTime);

  // Update internal state if initialFilterValue changes (e.g., back/forward navigation)
  useEffect(() => {
    setInputValue(initialFilterValue);
  }, [initialFilterValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    debouncedUpdateUrl(newValue);
  };

  return (
    <Input 
      type="text"
      placeholder="Filtruj raporty po tytule..."
      value={inputValue}
      onChange={handleChange}
      className="max-w-sm" // Limit width for better layout
>>>>>>> remove-idea-file
    />
  );
} 