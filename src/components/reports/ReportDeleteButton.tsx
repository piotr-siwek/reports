'use client';

import React, { useState, useTransition } from 'react';
// import { useRouter } from 'next/navigation'; // Removed unused import
import { deleteReport } from '@/actions/reportActions'; 
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2 } from 'lucide-react'; // Trash icon

interface ReportDeleteButtonProps {
  reportId: number;
  // Added children prop to allow rendering content (like text) inside DropdownMenuItem
  children?: React.ReactNode; 
}

export default function ReportDeleteButton({ reportId, children }: ReportDeleteButtonProps) {
  // const router = useRouter(); // Removed unused variable
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteReport(reportId);
      if (result.success) {
        toast.success("Raport został pomyślnie usunięty.");
        // No need for router.refresh() as deleteReport uses revalidatePath
        setIsOpen(false); // Close dialog on success
      } else {
        toast.error(result.error || "Nie udało się usunąć raportu.");
        setIsOpen(false); // Close dialog on error too
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Use children as the trigger, allowing flexible content like text in dropdown */}
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> Usuń
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć ten raport?</AlertDialogTitle>
          <AlertDialogDescription>
            Tej operacji nie można cofnąć. Spowoduje to trwałe usunięcie raportu 
            z naszych serwerów.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
            {isPending ? "Usuwanie..." : "Usuń"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 