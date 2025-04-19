import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportSummaryDto } from '@/types';
import ReportTableRow from './ReportTableRow';

interface ReportTableProps {
  reports: ReportSummaryDto[];
}

export default function ReportTable({ reports }: ReportTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50%]">Tytuł</TableHead>
          <TableHead>Data Utworzenia</TableHead>
          <TableHead className="text-right">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <ReportTableRow key={report.id} report={report} />
        ))}
      </TableBody>
      {/* Optional: Add TableCaption if needed */}
      {/* <TableCaption>Lista Twoich raportów.</TableCaption> */}
    </Table>
  );
} 