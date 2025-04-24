import { notFound } from 'next/navigation';
import ReportEditForm from '@/components/feature/report-details/ReportEditForm';
import { ReportDto } from '@/types';
import { createClient } from '@/lib/supabase-server';

// Async function to get authenticated user ID from Supabase auth
async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user.id;
}

// Helper to convert various formats to array with proper dash formatting
function formatTextToArray(text: string): string[] {
  // If text contains comma separators and not already dash-formatted
  if (text.includes(',') && !text.includes('\n-')) {
    return text.split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  
  // If it contains newlines with dashes
  if (text.includes('\n-')) {
    const lines = text.split('\n-').map(line => line.trim());
    // Process first line (might have dash prefix)
    const firstLine = lines.shift() || '';
    const firstItem = firstLine.startsWith('-') ? 
      firstLine.substring(1).trim() : firstLine;
    
    // Build array with all items
    const result = firstItem ? [firstItem] : [];
    result.push(...lines.filter(line => line));
    return result;
  }
  
  // Single line item
  return [text.trim()];
}

// Function to get report details from Supabase
async function getReportDetails(id: number, userId: string): Promise<ReportDto | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching report:', error);
    if (error.code === 'PGRST116') {
      // PostgreSQL error for "no rows returned" - handle as not found
      return null;
    }
    throw new Error(`Failed to fetch report: ${error.message}`);
  }
  
  if (!data) return null;
  
  // Process conclusions data
  let conclusionsData: string | string[] = data.conclusions || '';
  if (typeof conclusionsData === 'string' && conclusionsData.trim().length > 0) {
    conclusionsData = formatTextToArray(conclusionsData);
  }
  
  // Process key_data
  let keyDataValue: string | string[] = data.key_data || '';
  if (typeof keyDataValue === 'string' && keyDataValue.trim().length > 0) {
    keyDataValue = formatTextToArray(keyDataValue);
  }
  
  // Map database fields to DTO format
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title || '',
    originalText: data.original_text || '',
    summary: data.summary || '',
    conclusions: conclusionsData,
    keyData: keyDataValue,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

interface ReportDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ReportDetailsPage({ params }: ReportDetailsPageProps) {
  const reportId = parseInt(params.id, 10);

  // Validate ID
  if (isNaN(reportId)) {
    notFound(); // Treat non-numeric ID as Not Found
  }

  try {
    const userId = await getUserId(); // Fetch authenticated user ID
    const reportData = await getReportDetails(reportId, userId);

    // Handle Not Found
    if (!reportData) {
      notFound();
    }

    // Render the form, passing the fetched data
    return (
      <div className="container mx-auto px-4 py-8">
        <ReportEditForm initialData={reportData} />
      </div>
    );
  } catch (error) {
    console.error("Error in report details page:", error);
    // Let Next.js handle the error via error.tsx
    throw new Error('Failed to load report data.');
  }
} 