'use client';

import React, { useState, useEffect } from 'react';
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
    />
  );
} 