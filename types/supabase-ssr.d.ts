import { SupabaseClient as SupabaseClientOriginal } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';

declare module '@supabase/supabase-js' {
  interface SupabaseClient<DB = Database> extends SupabaseClientOriginal<DB> {
    rpc<Params extends Record<string, unknown>, Result>(
      fn: string,
      params?: Params
    ): Promise<{ data: Result | null; error: Error | null }>;
  }
}

declare module '@supabase/ssr' {
  export function createBrowserClient<DB = Database>(
    supabaseUrl: string, 
    supabaseAnonKey: string
  ): SupabaseClient<DB>;
  
  export function createServerClient<DB = Database>(
    supabaseUrl: string, 
    supabaseAnonKey: string, 
    options: { cookies: { getAll: () => unknown; setAll: (cookiesToSet: unknown[]) => void } }
  ): SupabaseClient<DB>;
} 