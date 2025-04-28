'use client';

import { ReportDto } from '@/types';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from '@/components/reports/ReportDocument';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ReportMetadata from './ReportMetadata';
import ReportSectionEditor from './ReportSectionEditor';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { updateReportAction, deleteReportAction, UpdateReportActionResult } from '@/actions/reportActions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

// Format text for display
function formatForDisplay(text: string | string[] | null | undefined): string {
  if (!text) return '';
  
  if (Array.isArray(text)) {
    return text.map(item => {
      const trimmed = item.trim();
      return trimmed.startsWith('-') ? trimmed : `- ${trimmed}`;
    }).join('\n');
  }
  
  // If text is a string, check if it's comma-separated
  if (typeof text === 'string' && text.includes(',')) {
    const items = text.split(',').map(item => item.trim()).filter(Boolean);
    return items.map(item => item.startsWith('-') ? item : `- ${item}`).join('\n');
  }
  
  // If it's a single string without commas, just return it with a dash if needed
  if (typeof text === 'string' && text.trim()) {
    const trimmed = text.trim();
    return trimmed.startsWith('-') ? trimmed : `- ${trimmed}`;
  }
  
  return '';
}

// Zod Schema defined in the plan
const reportEditSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany.").max(255, "Tytuł jest za długi."),
  summary: z.string().max(10000, "Streszczenie jest za długie (max 10000 znaków).").optional(), // Optional in form state, handled by editor
  conclusions: z.string().max(10000, "Wnioski są za długie (max 10000 znaków).").or(z.array(z.string())).optional(),
  keyData: z.string().max(10000, "Kluczowe dane są za długie (max 10000 znaków).").or(z.array(z.string())).optional(),
});

// Infer the form view model type from the schema
type ReportEditFormViewModel = z.infer<typeof reportEditSchema>;

interface ReportEditFormProps {
  initialData: ReportDto;
}

const initialActionState: UpdateReportActionResult = {
  success: false,
  message: undefined,
  errors: undefined,
};

const ReportEditForm = ({ initialData }: ReportEditFormProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition(); // Use transition for delete loading state
  const router = useRouter();

  // useFormState for the update action
  const [updateState, formAction] = useFormState(
      updateReportAction.bind(null, initialData.id), // Bind reportId
      initialActionState
  );
  const [isPendingUpdate, startUpdateTransition] = useTransition();

  // Format the data for the form
  const formattedConclusions = formatForDisplay(initialData.conclusions);
  const formattedKeyData = formatForDisplay(initialData.keyData);

  const form = useForm<ReportEditFormViewModel>({
    resolver: zodResolver(reportEditSchema),
    defaultValues: {
      title: initialData.title || '',
      summary: initialData.summary || '',
      conclusions: formattedConclusions,
      keyData: formattedKeyData,
    },
    mode: 'onChange', // Validate on change for better UX
  });
  console.log({formattedConclusions, formattedKeyData})

  const { handleSubmit, control, setError, formState: { isDirty, isValid } } = form;

  // Dodany stan do wymuszenia rerenderu PDFDownloadLink
  const [pdfKey, setPdfKey] = useState(0);

  // Nasłuchuj na zmiany w formularzu i aktualizuj pdfKey
  useEffect(() => {
    const subscription = form.watch(() => {
      setPdfKey(k => k + 1);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Effect to handle action results (toasts, errors)
  useEffect(() => {
    if (updateState.message) {
      if (updateState.success) {
        // Use sonner toast.success
        toast.success("Sukces", { description: updateState.message });
        form.reset(form.getValues()); // Reset dirty state after successful save
        router.refresh();
      } else {
        // Use sonner toast.error
        toast.error("Błąd zapisu", {
          description: updateState.message || "Nie udało się zapisać raportu.",
        });
        // Set form errors based on Zod issues from the action
        updateState.errors?.forEach((error) => {
          setError(error.path[0] as keyof ReportEditFormViewModel, {
            type: "server",
            message: error.message,
          });
        });
      }
    }
  }, [updateState, setError, form, router]);

  // Wrapper for form submission to use startTransition
  const handleFormSubmit = (data: ReportEditFormViewModel) => {
    const formData = new FormData();
    formData.append('title', data.title);
    
    if (data.summary) {
      formData.append('summary', data.summary);
    }
    
    if (data.conclusions) {
      // Convert array to JSON string for FormData
      formData.append('conclusions', data.conclusions as string);
    }
    
    if (data.keyData) {
      // Convert array to JSON string for FormData
      formData.append('keyData', data.keyData as string);
    }
    
    startUpdateTransition(() => {
      formAction(formData);
    });
  };

  // Handler for initiating delete
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  // Handler for confirming delete
  const handleConfirmDelete = async () => {
    startDeleteTransition(async () => {
        const result = await deleteReportAction(initialData.id);
        if (!result?.success) { // Check if result exists and has success=false
            // Use sonner toast.error
            toast.error("Błąd usuwania", {
                description: result?.message || "Nie udało się usunąć raportu.",
            });
            setIsDeleteDialogOpen(false); // Close dialog on error
        } else {
             // Use sonner toast.success
             toast.success("Sukces", { description: "Raport został pomyślnie usunięty." });
             // Redirect happens in the action, no need to close dialog here
             // setIsDeleteDialogOpen(false); // No need to close manually on success
        }
    });
  };

  // Combine pending states
  const isSubmitting = isPendingUpdate;

  return (
    // Wrap form in a Card for better visual structure
    <Card className="max-w-4xl mx-auto"> 
      <Form {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardHeader>
            <CardTitle>Edytuj Raport</CardTitle>
            {/* Metadata can go in header or content */}
            <ReportMetadata createdAt={initialData.createdAt} updatedAt={initialData.updatedAt} />
          </CardHeader>
          <CardContent className="space-y-6"> {/* Increased spacing */}
            {/* Title Field */}
            <FormField
              control={control}
              name="title"
              render={({ field }: { field: ControllerRenderProps<ReportEditFormViewModel, 'title'> }) => (
                <FormItem>
                  <FormLabel>Tytuł Raportu</FormLabel>
                  <FormControl>
                    <Input placeholder="Wpisz tytuł raportu..." {...field} disabled={isSubmitting || isDeleting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary Field - Using regular input */}
            <FormField
              control={control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Streszczenie</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Wpisz streszczenie raportu..."
                      {...field}
                      disabled={isSubmitting || isDeleting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section Editors */}
            <ReportSectionEditor<ReportEditFormViewModel>
                label="Wnioski"
                fieldName="conclusions"
                control={control}
            />
            <ReportSectionEditor<ReportEditFormViewModel>
                label="Kluczowe Dane"
                fieldName="keyData"
                control={control}
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-6"> {/* Added padding top */}
              <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty || !isValid || isDeleting}
                  aria-disabled={isSubmitting || !isDirty || !isValid || isDeleting}
              >
                  {isSubmitting ? "Zapisywanie..." : "Zapisz Zmiany"}
              </Button>
              <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isDeleting || isSubmitting} // Also disable delete if saving
                  aria-disabled={isDeleting || isSubmitting}
              >
                  {isDeleting ? "Usuwanie..." : "Usuń Raport"}
              </Button>
              {/* PDF Download Button */}
              <PDFDownloadLink
                key={pdfKey}
                document={
                  <ReportDocument
                    title={form.getValues('title') || ''}
                    summary={form.getValues('summary') || ''}
                    conclusions={form.getValues('conclusions') || ''}
                    keyData={form.getValues('keyData') || ''}
                  />
                }
                fileName={(form.getValues('title') || 'raport').replace(/[^a-z0-9\-_]/gi, '_') + '.pdf'}
              >
                {({ loading }) => (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    className="ml-2"
                  >
                    {loading ? "Tworzenie PDF..." : "Pobierz PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
          </CardFooter>
        </form>
      </Form>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)} // Prevent closing while deleting
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </Card>
  );
}

export default ReportEditForm; 