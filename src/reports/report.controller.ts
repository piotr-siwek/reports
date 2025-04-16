import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from './report.service';
import { GetReportDetailsResponseDto } from '@/types';
import { handleApiError, ErrorResponse } from '@/lib/error-handler';

const reportService = new ReportService();

/**
 * Get report details by ID
 * 
 * @param request The NextRequest object
 * @param params The route parameters, including the report ID
 * @returns JSON response with report details or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GetReportDetailsResponseDto | ErrorResponse>> {
  try {
    // Validate the ID parameter
    const reportId = parseInt(params.id);
    if (isNaN(reportId)) {
      return NextResponse.json(
        { statusCode: 400, message: 'Invalid report ID' },
        { status: 400 }
      );
    }

    // Get user ID from authentication context (set by middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { statusCode: 401, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get report details
    const reportDetails = await reportService.getReportDetails(reportId, parseInt(userId));

    // Return success response
    return NextResponse.json(reportDetails);
  } catch (error) {
    // Use the error handler to return consistent error responses
    return handleApiError(error, 'Error retrieving report details:');
  }
} 