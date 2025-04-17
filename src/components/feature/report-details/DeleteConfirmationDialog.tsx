'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // We might not need trigger here if controlled externally
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void; // Allow both sync/async confirm
  isDeleting: boolean;
  trigger?: React.ReactNode; // Optional trigger if not controlled externally
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  trigger,
}: DeleteConfirmationDialogProps) {

  const handleConfirm = async () => {
      await onConfirm();
      // Optionally close dialog on confirm, or let parent handle it
      // onClose(); 
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć ten raport?</AlertDialogTitle>
          <AlertDialogDescription>
            Tej operacji nie można cofnąć. Spowoduje to trwałe usunięcie raportu z serwera.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Usuwanie..." : "Potwierdź usunięcie"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 