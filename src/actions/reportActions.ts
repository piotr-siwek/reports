'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ReportDto, UpdateReportCommand } from '@/types'; // Assuming types are in src/types.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom'; // Import JSDOM
import { createClient } from '@/lib/supabase-server';
import { ListReportsResponseDto, PaginationDto, ReportSummaryDto } from '@/types';
import { Tables } from '@/db/database.types';

// --- Get authenticated user ID from Supabase ---
async function getUserIdServer(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user.id;
}

// --- Supabase report service implementation ---
const reportService = {
  async updateReport(id: number, userId: string, data: UpdateReportCommand): Promise<ReportDto> {
    const supabase = await createClient();
    
    // Prepare data for update with proper typing that matches database schema
    const updateData: {
      title?: string | null;
      original_text?: string | null;
      summary?: string | null;
      conclusions?: string | string[] | null;
      key_data?: string | string[] | null;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString()
    };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.originalText !== undefined) updateData.original_text = data.originalText;
    if (data.summary !== undefined) updateData.summary = data.summary;
    
    // Format conclusions for DB if it's an array
    if (data.conclusions !== undefined) {
      updateData.conclusions = Array.isArray(data.conclusions) 
        ? data.conclusions.join('\n- ') 
        : data.conclusions;
    }
    
    // Format keyData for DB if it's an array
    if (data.keyData !== undefined) {
      updateData.key_data = Array.isArray(data.keyData) 
        ? data.keyData.join('\n- ') 
        : data.keyData;
    }
    
    // Update the report
    const { data: updatedReport, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating report:', error);
      throw new Error(`Failed to update report: ${error.message}`);
    }
    
    if (!updatedReport) {
      throw new Error('Report not found or you do not have permission to edit it');
    }
    
    // Map database fields to DTO format
    return {
      id: updatedReport.id,
      userId: updatedReport.user_id,
      title: updatedReport.title || '',
      originalText: updatedReport.original_text || '',
      summary: updatedReport.summary || '',
      conclusions: updatedReport.conclusions || '',
      keyData: updatedReport.key_data || '',
      createdAt: updatedReport.created_at,
      updatedAt: updatedReport.updated_at,
    };
  },
  
  async deleteReport(id: number, userId: string): Promise<void> {
    const supabase = await createClient();
    
    // Delete the report
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting report:', error);
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }
};

// Schema for the form data received by the update action
const reportEditSchemaServer = z.object({
  title: z.string().min(1, "Tytuł jest wymagany.").max(255, "Tytuł jest za długi."),
  summary: z.string().max(10000, "Streszczenie jest za długie (max 10000 znaków).").optional(),
  conclusions: z.string().max(10000, "Wnioski są za długie (max 10000 znaków)").or(z.array(z.string())).optional(),
  keyData: z.string().max(10000, "Kluczowe dane są za długie (max 10000 znaków)").or(z.array(z.string())).optional(),
});
// type ReportEditFormViewModel = z.infer<typeof reportEditSchemaServer>; // Removed unused type

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

  // Handle conclusions that can be string or array
  let cleanConclusions: string | string[];
  if (Array.isArray(validatedData.conclusions)) {
    cleanConclusions = validatedData.conclusions.map(item => purify.sanitize(item));
  } else {
    cleanConclusions = purify.sanitize(validatedData.conclusions || '');
  }

  // Handle keyData that can be string or array
  let cleanKeyData: string | string[];
  if (Array.isArray(validatedData.keyData)) {
    cleanKeyData = validatedData.keyData.map(item => purify.sanitize(item));
  } else {
    cleanKeyData = purify.sanitize(validatedData.keyData || '');
  }

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

// Define a type for the expected shape of data returned by the select query
// This helps avoid 'any' and addresses potential type mismatches
interface ReportQueryResult {
  id: number;
  title: string | null; // Assuming title can be null based on schema/potential issues
  summary: string | null;
  created_at: string;
}

const DEFAULT_LIMIT = 10;

/**
 * Server Action to list reports for the authenticated user.
 * Handles pagination, filtering, and sorting.
 */
export async function listReports({
  page = 1,
  limit = DEFAULT_LIMIT,
  filter,
  sort = 'created_at.desc', // Default sort: newest first
}: {
  page?: number;
  limit?: number;
  filter?: string;
  sort?: string;
}): Promise<ListReportsResponseDto> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const offset = (page - 1) * limit;
    const [sortField, sortOrder] = sort.split('.');

    let query = supabase
      .from('reports')
      // Select only the fields needed for ReportSummaryDto
      .select('id, title, summary, created_at', { count: 'exact' })
      .order(sortField as keyof Tables<'reports'>, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (filter) {
      // Basic title filtering (case-insensitive)
      query = query.ilike('title', `%${filter}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      throw new Error('Failed to fetch reports.');
    }

    // Use the defined type for mapping, with double casting to bypass strict type checking issues
    // This assumes the actual data structure matches ReportQueryResult despite TS/DB type errors
    const reports: ReportSummaryDto[] = (data as unknown as ReportQueryResult[] | null)?.map(report => ({
      id: report.id,
      title: report.title || 'Bez tytułu', // Provide fallback for null title
      summary: report.summary || '', // Provide fallback for null summary
      createdAt: report.created_at,
    })) || [];

    const pagination: PaginationDto = {
      page,
      limit,
      total: count || 0,
    };

    return { reports, pagination };

  } catch (error) {
    console.error('[listReports Action Error]:', error);
    // Return an empty state in case of error for graceful degradation
    return {
      reports: [],
      pagination: { page: 1, limit: DEFAULT_LIMIT, total: 0 },
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Server Action to delete a report by its ID.
 */
export async function deleteReport(reportId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // RLS should prevent deleting reports of other users
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      console.error('Error deleting report:', error);
      throw new Error('Failed to delete report.');
    }

    // Revalidate the reports list path to refresh the UI
    revalidatePath('/reports');

    return { success: true };

  } catch (error) {
    console.error('[deleteReport Action Error]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
} 