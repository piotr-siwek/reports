import React from 'react';
<<<<<<< HEAD
import type { ReportSummaryDto } from '@/types';
=======
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportSummaryDto } from '@/types';
>>>>>>> remove-idea-file
import ReportTableRow from './ReportTableRow';

interface ReportTableProps {
  reports: ReportSummaryDto[];
}

export default function ReportTable({ reports }: ReportTableProps) {
  return (
<<<<<<< HEAD
    <table className="min-w-full border-collapse">
      <thead>
        <tr>
          <th className="border px-4 py-2 text-left">Tytuł</th>
          <th className="border px-4 py-2 text-left">Data utworzenia</th>
          <th className="border px-4 py-2 text-left">Akcje</th>
        </tr>
      </thead>
      <tbody>
        {reports.map(report => (
          <ReportTableRow key={report.id} report={report} />
        ))}
      </tbody>
    </table>
=======
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
>>>>>>> remove-idea-file
  );
} 