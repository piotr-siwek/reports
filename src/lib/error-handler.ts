import { NextResponse } from 'next/server';
import { NotFoundError } from '@/reports/report.service';

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Handles errors consistently across API handlers
 * 
 * @param error - The error to handle
 * @param logPrefix - Prefix for error logging
 * @returns NextResponse with appropriate status code and JSON body
 */
export function handleApiError(error: unknown, logPrefix = 'API Error:'): NextResponse<ErrorResponse> {
  // Handle known error types
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { statusCode: 404, message: error.message },
      { status: 404 }
    );
  }
  
  // Handle validation errors (example, could be extended for specific validation libraries)
  if (error instanceof Error && error.name === 'ValidationError') {
    return NextResponse.json(
      { statusCode: 400, message: error.message },
      { status: 400 }
    );
  }
  
  // Log unexpected errors
  console.error(`${logPrefix}`, error);
  
  // Default to 500 Internal Server Error for unknown errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return NextResponse.json(
    { statusCode: 500, message: 'Internal server error', details: { originalError: message } },
    { status: 500 }
  );
} 