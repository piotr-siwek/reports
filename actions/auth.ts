'use server';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import Supabase server client and CookieOptions type
import { LoginFormSchema } from "@/lib/validators/auth"; // Removed unused LoginFormValues
// import { LoginCommand, LoginResponseDto } from "@/types"; // Removed custom API types

// Type for the state managed by useActionState
export interface LoginActionState {
  success: boolean;
  message?: string;
  error?: string;
  // Optionally add fieldErrors for more specific validation messages
  // fieldErrors?: Partial<Record<keyof LoginFormValues, string>>;
}

// TODO: Move Supabase credentials to environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Updated action signature for useActionState
export async function loginUser(
  previousState: LoginActionState,
  formData: FormData // Accept FormData instead of LoginFormValues
): Promise<LoginActionState> {

  // Extract data from FormData
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const data = { email, password };

  // 1. Validate data using Zod
  const validationResult = LoginFormSchema.safeParse(data);
  if (!validationResult.success) {
    // Basic error message, could be enhanced with fieldErrors
    return {
      success: false,
      error: "Nieprawidłowe dane formularza.",
      // fieldErrors: validationResult.error.flatten().fieldErrors
    };
  }

  // 2. Proceed with login if validation passes
  const cookieStore = cookies();
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          // @ts-expect-error Assuming cookies() returns store synchronously despite lint error
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            // @ts-expect-error Assuming cookies() returns store synchronously despite lint error
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Ignore errors in Server Components/Actions if middleware handles refresh
          }
        }
      },
    }
  );

  // Call Supabase sign in
  const { error } = await supabase.auth.signInWithPassword({
    email: validationResult.data.email, // Use validated data
    password: validationResult.data.password,
  });

  if (error) {
    console.error('Supabase login error:', error.message);
    if (error.message.includes('Invalid login credentials')) {
       return { success: false, error: "Nieprawidłowy email lub hasło." };
    }
    return { success: false, error: error.message || "Wystąpił błąd podczas logowania." };
  }

  // Login successful
  return { success: true, message: "Zalogowano pomyślnie." };

  /* Removed custom fetch logic
  const loginCommand: LoginCommand = {
    email: data.email,
    password: data.password,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginCommand),
    });

    if (response.ok) {
      const result: LoginResponseDto = await response.json();
      cookies().set('session_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
      return { success: true, message: result.message || "Zalogowano pomyślnie." };
    } else if (response.status === 401) {
      return { success: false, error: "Nieprawidłowy email lub hasło." };
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.message || "Nieprawidłowe dane wejściowe." };
    } else {
      console.error('Login API error:', response.status, await response.text().catch(() => ''));
      return { success: false, error: "Wystąpił nieoczekiwany błąd serwera." };
    }
  } catch (error) {
    console.error('Login action error:', error);
    return { success: false, error: "Wystąpił błąd podczas próby logowania." };
  }
  */
} 