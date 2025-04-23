import React from 'react';
import Link from 'next/link';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReportSummaryDto } from '@/types';
import ReportDeleteButton from './ReportDeleteButton'; // Placeholder for now
import { format } from 'date-fns'; // For formatting date
import { MoreHorizontal } from 'lucide-react'; // For dropdown menu trigger
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportTableRowProps {
  report: ReportSummaryDto;
}

export default function ReportTableRow({ report }: ReportTableRowProps) {
  const formattedDate = report.createdAt 
    ? format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm') 
    : '-';

  return (
    <TableRow>
      <TableCell className="font-medium">{report.title}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="text-right">
        {/* Using DropdownMenu for actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Otwórz menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akcje</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/reports/${report.id}`}>Edytuj / Zobacz</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Render Delete Button within an item to prevent layout issues */}
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()} // Prevent closing menu on item click before dialog opens
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
                <ReportDeleteButton reportId={report.id} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
} 