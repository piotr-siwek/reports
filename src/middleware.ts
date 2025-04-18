import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { Session } from '@supabase/supabase-js';

export const config = {
  matcher: [
      '/((?!_next/static|_next/image|favicon.ico|public|auth|login|register|reset-password|update-password|api/auth).*)',
      '/api/reports/:path*'
  ],
};

export async function middleware(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getSession();
    const session = data.session as Session | null;

    if (error || !session) {
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login'; // Zakładam, że Twoje logowanie jest w /auth/login
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  } catch (error) {
    console.error('Authentication middleware error:', error);

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
