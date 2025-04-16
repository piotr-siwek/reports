declare module '@supabase/ssr' {
  export function createBrowserClient(supabaseUrl: string, supabaseAnonKey: string): Record<string, unknown>;
  export function createServerClient(supabaseUrl: string, supabaseAnonKey: string, options: { cookies: { getAll: () => unknown; setAll: (cookiesToSet: unknown[]) => void } }): Record<string, unknown>;
} 