import { SupabaseClient } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface SupabaseClient<Database = unknown> {
    rpc<Params extends Record<string, unknown>, Result>(
      fn: string,
      params?: Params
    ): Promise<{ data: Result | null; error: Error | null }>;
  }
}

declare module '@supabase/ssr' {
  export function createBrowserClient<Database = unknown>(
    supabaseUrl: string, 
    supabaseAnonKey: string
  ): SupabaseClient<Database>;
  
  export function createServerClient<Database = unknown>(
    supabaseUrl: string, 
    supabaseAnonKey: string, 
    options: { cookies: { getAll: () => unknown; setAll: (cookiesToSet: unknown[]) => void } }
  ): SupabaseClient<Database>;
} 