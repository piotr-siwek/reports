'use client';

import React, { useState } from 'react';
import { Button } from '@/ui-shadn-helper';
import { useRouter } from 'next/navigation';

interface ReportDeleteButtonProps {
  reportId: number;
}

export default function ReportDeleteButton({ reportId }: ReportDeleteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm('Czy na pewno chcesz usunąć ten raport?');
    if (!confirmed) return;
    setIsLoading(true);
    // Simulate server action for deletion
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Report ${reportId} deleted`);
    setIsLoading(false);
    router.refresh();
  };

  return (
    <Button onClick={handleDelete} disabled={isLoading} className="btn btn-danger">
      {isLoading ? 'Usuwanie...' : 'Usuń'}
    </Button>
  );
} 