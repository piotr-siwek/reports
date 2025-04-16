import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Updated cookie type definitions
interface RequestCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  maxAge?: number;
  expires?: number | Date;
}

interface CookieItem {
  name: string;
  value: string;
  options: Omit<RequestCookie, "name" | "value">;
}

// After the CookieItem interface, add the following:
interface CookieSetter {
  set(name: string, value: string, options: Omit<RequestCookie, "name" | "value">): void;
}

// Define a local interface for the Supabase client to properly type auth.getUser()
interface SupabaseClient {
  auth: {
    getUser(): Promise<{ data: { user: unknown } }>;
  };
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach((cookie: CookieItem) => {
            // For request.cookies, use only name and value since options are not accepted
            request.cookies.set(cookie.name, cookie.value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach((cookie: CookieItem) => {
            // For supabaseResponse.cookies, use the object overload that accepts options
            supabaseResponse.cookies.set({
              name: cookie.name,
              value: cookie.value,
              ...cookie.options
            });
          });
        },
      },
    }
  )

  const supabaseClient = supabase as unknown as SupabaseClient
  const { data: { user } } = await supabaseClient.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
} 