import { createClient } from '@/lib/supabase-server';
import { ReportDto } from '@/types';
import { Tables } from '@/db/database.types';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ReportService {
  /**
   * Retrieves a report by its ID, ensuring that only the owner can access it via RLS.
   *
   * @param reportId - The ID of the report to retrieve
   * @returns The report details as ReportDto
   * @throws NotFoundError if the report doesn't exist or doesn't belong to the user (due to RLS)
   */
  async getReportDetails(reportId: number): Promise<ReportDto> {
    try {
      // Create Supabase client - auth context should be automatically available for RLS
      const supabase = await createClient();
      
      // Set RLS context - this ensures the user can only access their own reports
      // No need to set RLS explicitly if policies are configured correctly in Supabase based on auth.uid()
      // const { error: rpcError } = await supabase.rpc<{
      //   parameter: string;
      //   value: string;
      // }, null>('set_config', {
      //   parameter: 'myapp.current_user_id',
      //   value: userId.toString()
      // });
      
      // if (rpcError) {
      //   throw rpcError;
      // }
      
      // Query the database for the report
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        // .eq('user_id', userId) // RLS should handle this automatically
        .single();
      
      // Handle potential errors
      if (error) {
        if (error.code === 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          throw new NotFoundError(`Report with ID ${reportId} not found`);
        }
        throw error;
      }
      
      if (!data) {
        throw new NotFoundError(`Report with ID ${reportId} not found`);
      }
      
      // Map the database record to the DTO
      // Cast data to include title, assuming it exists in the DB schema
      const report = data as Tables<'reports'> & { title: string }; 
      const reportDto: ReportDto = {
        id: report.id,
        userId: report.user_id,
        title: report.title,
        originalText: report.original_text || '',
        summary: report.summary || '',
        conclusions: report.conclusions || '',
        keyData: report.key_data || '',
        createdAt: report.created_at,
        updatedAt: report.updated_at
      };
      
      return reportDto;
    } catch (error) {
      // Re-throw NotFoundError to be handled by the global exception filter
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      // Log other errors and rethrow
      console.error('Error retrieving report:', error);
      throw error;
    }
  }
} 