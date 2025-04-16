import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { Session } from '@supabase/supabase-js';

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes that don't require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
    '/api/reports/:path*'
  ],
};

export async function middleware(request: NextRequest) {
  try {
    // Create supabase client
    const supabase = await createClient();
    
    // Check if we have a session
    const { data, error } = await supabase.auth.getSession();
    const session = data.session as Session | null;
    
    if (error || !session) {
      // Not authenticated or error getting session
      return new NextResponse(
        JSON.stringify({ 
          statusCode: 401, 
          message: 'Unauthorized: Authentication required'
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Clone the request headers
    const requestHeaders = new Headers(request.headers);
    
    // Add the user ID to the request headers
    requestHeaders.set('x-user-id', userId);
    
    // Return next response
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    // Return error response
    return new NextResponse(
      JSON.stringify({ 
        statusCode: 500, 
        message: 'Internal server error during authentication'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 