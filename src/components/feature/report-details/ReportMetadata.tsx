'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale'; // Polish locale

interface ReportMetadataProps {
  createdAt: string;
  updatedAt: string;
}

export default function ReportMetadata({ createdAt, updatedAt }: ReportMetadataProps) {
  const formattedCreatedAt = format(new Date(createdAt), "d MMMM yyyy, HH:mm", { locale: pl });
  const formattedUpdatedAt = format(new Date(updatedAt), "d MMMM yyyy, HH:mm", { locale: pl });

  return (
    <div className="text-sm text-muted-foreground mb-4">
      <p>Utworzono: {formattedCreatedAt}</p>
      <p>Ostatnia modyfikacja: {formattedUpdatedAt}</p>
    </div>
  );
} 