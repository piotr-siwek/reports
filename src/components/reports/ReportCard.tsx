import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportSummaryDto } from '@/types';
import ReportDeleteButton from './ReportDeleteButton'; // Placeholder
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportCardProps {
  report: ReportSummaryDto;
}

export default function ReportCard({ report }: ReportCardProps) {
  const formattedDate = report.createdAt 
    ? format(new Date(report.createdAt), 'yyyy-MM-dd') 
    : '-';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{report.title}</CardTitle>
        {/* Dropdown Menu for actions */}
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
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()} 
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <ReportDeleteButton reportId={report.id} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Data utworzenia: {formattedDate}</p>
        {/* Optionally display a snippet of the summary if available */}
        {/* {report.summary && <p className="text-sm mt-2 truncate">{report.summary}</p>} */}
      </CardContent>
      {/* Footer can be used for additional quick actions if needed later */}
      {/* <CardFooter>
        <p>Footer content</p>
      </CardFooter> */}
    </Card>
  );
} 