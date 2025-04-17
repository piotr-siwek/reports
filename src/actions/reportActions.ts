'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ReportDto, UpdateReportCommand } from '@/types'; // Assuming types are in src/types.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom'; // Import JSDOM

// --- Placeholder: Get User ID ---
// Replace with actual function to get authenticated user ID server-side
async function getUserIdServer(): Promise<number> {
  // Simulate getting user ID (e.g., from session/auth context)
  return 1;
}
// --- End Placeholder ---

// --- Placeholder: Report Service ---
// Replace with actual service import and implementation
const reportService = {
  async updateReport(id: number, userId: number, data: UpdateReportCommand): Promise<ReportDto> {
    console.log(`Updating report ${id} for user ${userId} with SANITIZED data:`, data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    if (id === 400) throw new Error("Simulated Validation Error from API"); // Simulate validation error
    if (id === 404) throw new Error("Simulated Not Found Error from API");
    // Simulate success - return updated data (merge for demo)
    return {
      id: id,
      userId: userId,
      title: data.title ?? `Updated Title ${id}`,
      originalText: data.originalText ?? `Original text ${id}`,
      summary: data.summary ?? `<p>Updated summary ${id}</p>`,
      conclusions: data.conclusions ?? `<p>Updated conclusions ${id}</p>`,
      keyData: data.keyData ?? `<p>Updated key data ${id}</p>`,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      updatedAt: new Date().toISOString(),
    };
  },
  async deleteReport(id: number, userId: number): Promise<void> {
    console.log(`Deleting report ${id} for user ${userId}...`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
     if (id === 404) throw new Error("Simulated Not Found Error during delete");
    if (id === 500) throw new Error("Simulated Server Error during delete");
    // Simulate success
    return;
  }
};
// --- End Placeholder ---


// Schema for the form data received by the update action
const reportEditSchemaServer = z.object({
  title: z.string().min(1, "Tytuł jest wymagany.").max(255, "Tytuł jest za długi."),
  summary: z.string().max(10000, "Streszczenie jest za długie (max 10000 znaków).").optional(),
  conclusions: z.string().max(10000, "Wnioski są za długie (max 10000 znaków).").optional(),
  keyData: z.string().max(10000, "Kluczowe dane są za długie (max 10000 znaków).").optional(),
});
type ReportEditFormViewModel = z.infer<typeof reportEditSchemaServer>;

// Type for the return value of updateReportAction
export type UpdateReportActionResult = {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[]; // To pass back validation errors
  updatedReport?: ReportDto; // Optionally return updated data
};

// --- Setup DOMPurify for Server Action ---
// Create a JSDOM window instance. This is necessary because DOMPurify needs a DOM environment.
// It might be beneficial to create this instance only once if the action is called frequently,
// but for simplicity here, we create it per call.
const window = new JSDOM('').window;
const purify = DOMPurify(window);
// --- End DOMPurify Setup ---

// Server Action to update a report
export async function updateReportAction(
  reportId: number,
  currentState: UpdateReportActionResult, // convention for useFormState
  formData: FormData,
): Promise<UpdateReportActionResult> {

  // Extract data from FormData
  const data = {
      title: formData.get('title'),
      summary: formData.get('summary'),
      conclusions: formData.get('conclusions'),
      keyData: formData.get('keyData'),
  };

  // Validate data using Zod schema
  const validationResult = reportEditSchemaServer.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Błąd walidacji formularza.",
      errors: validationResult.error.issues,
    };
  }

  const validatedData = validationResult.data;

  // Sanitize HTML content before sending to the backend/service
  const cleanSummary = purify.sanitize(validatedData.summary || '');
  const cleanConclusions = purify.sanitize(validatedData.conclusions || '');
  const cleanKeyData = purify.sanitize(validatedData.keyData || '');

  try {
    const userId = await getUserIdServer();

    const updateCommand: UpdateReportCommand = {
      title: validatedData.title,
      summary: cleanSummary,
      conclusions: cleanConclusions,
      keyData: cleanKeyData,
      // originalText is not editable here, so not included
    };

    const updatedReport = await reportService.updateReport(reportId, userId, updateCommand);

    revalidatePath(`/reports/${reportId}`); // Revalidate the details page
    revalidatePath('/reports'); // Revalidate the list page

    return {
      success: true,
      message: "Raport został pomyślnie zaktualizowany.",
      updatedReport: updatedReport, // Send back updated data if needed
    };
  } catch (error) {
    console.error("Error updating report:", error);
    // Basic error handling - might need more specific checks (e.g., for 404)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Nie udało się zaktualizować raportu.",
    };
  }
}

// Type for the return value of deleteReportAction
export type DeleteReportActionResult = {
    success: boolean;
    message?: string;
};

// Server Action to delete a report
export async function deleteReportAction(
    reportId: number
    // No form state needed here usually, might add if complex feedback is required
): Promise<DeleteReportActionResult> { 
    try {
        const userId = await getUserIdServer();
        await reportService.deleteReport(reportId, userId);

        // Revalidation might happen automatically due to redirect, but explicit is safer
        revalidatePath('/reports'); 

    } catch (error) {
        console.error("Error deleting report:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Nie udało się usunąć raportu.",
        };
    }

    // Redirect to the reports list on successful deletion
    redirect('/reports');
    
    // Note: Redirect should ideally prevent this return from being reached,
    // but returning a success state is good practice.
    // return { success: true, message: "Raport został usunięty." };
} 