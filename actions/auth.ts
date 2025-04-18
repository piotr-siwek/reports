'use server';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import Supabase server client and CookieOptions type
import { LoginFormSchema, RegisterFormSchema, ResetPasswordConfirmSchema, ResetPasswordRequestSchema } from "@/lib/validators/auth"; // Import both schemas
// import { LoginCommand, LoginResponseDto } from "@/types"; // Removed custom API types

// Type for the state managed by useActionState
export interface LoginActionState {
  success: boolean;
  message?: string;
  error?: string;
  // Optionally add fieldErrors for more specific validation messages
  // fieldErrors?: Partial<Record<keyof LoginFormValues, string>>;
}

// State for Registration Action
export interface RegisterActionState {
  success: boolean;
  message?: string;
  error?: string;
  // fieldErrors?: Partial<Record<keyof z.infer<typeof RegisterFormSchema>, string>>; // Optional for field errors
}

// State for Update Password Action
export interface UpdatePasswordActionState {
  success: boolean;
  message?: string;
  error?: string;
}

// State for Password Reset Request Action
export interface RequestPasswordResetActionState {
  success: boolean;
  message?: string; // Always use message, even for potential errors, to avoid leaking info
  error?: string; // Only for unexpected server errors
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

// --- Register Action ---
export async function registerUser(
  previousState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const data = { email, password, confirmPassword };

  // 1. Validate data using Zod
  const validationResult = RegisterFormSchema.safeParse(data);
  if (!validationResult.success) {
    // Basic error message, could be enhanced with fieldErrors from validationResult.error
    return {
      success: false,
      error: "Nieprawidłowe dane formularza. Sprawdź błędy poniżej.",
      // fieldErrors: validationResult.error.flatten().fieldErrors // Example if needed
    };
  }

  // 2. Proceed with Supabase sign up
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
            // Ignore errors
          }
        }
      },
    }
  );

  // Call Supabase signUp
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: validationResult.data.email,
    password: validationResult.data.password,
    // We can optionally add emailRedirectTo or other options here if needed
    // options: {
    //   emailRedirectTo: `${origin}/auth/callback`,
    // }
  });

  if (error) {
    console.error('Supabase signUp error:', error.message);
    // Check for specific Supabase errors
    if (error.message.includes('User already registered')) {
      return { success: false, error: "Adres email jest już zajęty." };
    }
    if (error.message.includes('Password should be at least 6 characters')) {
      // Although Zod checks for 8, Supabase might have its own minimum (default is 6)
       return { success: false, error: "Hasło jest zbyt krótkie (wymagane min. 6 znaków wg Supabase)." };
    }
    // Generic error for other cases
    return { success: false, error: error.message || "Wystąpił błąd podczas rejestracji." };
  }

  // Determine success message based on whether email confirmation is needed
  // signUpData.user?.identities might be empty if confirmation is required
  const requiresConfirmation = !signUpData.session && !!signUpData.user;
  const successMessage = requiresConfirmation
    ? "Konto utworzone! Sprawdź email, aby potwierdzić rejestrację."
    : "Konto zostało pomyślnie utworzone!";

  return { success: true, message: successMessage };

}

// --- Update Password Action (after reset link click) ---
export async function updatePassword(
  previousState: UpdatePasswordActionState,
  formData: FormData
): Promise<UpdatePasswordActionState> {

  const newPassword = formData.get('newPassword') as string;
  const confirmNewPassword = formData.get('confirmNewPassword') as string;
  const data = { newPassword, confirmNewPassword };

  // 1. Validate data using Zod
  const validationResult = ResetPasswordConfirmSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.flatten().fieldErrors.confirmNewPassword?.[0] || // Prioritize mismatch error
             validationResult.error.flatten().fieldErrors.newPassword?.[0] || // Then password error
             "Nieprawidłowe dane formularza.", // Fallback
    };
  }

  // 2. Proceed with Supabase update user
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
            // Ignore errors
          }
        }
      },
    }
  );

  // Call Supabase updateUser - it uses the session recovered from the reset link
  const { error } = await supabase.auth.updateUser({
    password: validationResult.data.newPassword,
  });

  if (error) {
    console.error('Supabase updateUser error:', error.message);
    // Handle common errors (e.g., token expired/invalid, password policy)
    if (error.message.includes('Password should be different')) {
      return { success: false, error: "Nowe hasło musi być inne niż stare." };
    }
    if (error.message.includes('Password should be at least')) {
      return { success: false, error: "Hasło nie spełnia wymagań bezpieczeństwa." };
    }
    // Check for AuthApiError with specific status if needed (e.g., 401, 422)
    // Example: (error instanceof AuthApiError && error.status === 401)
    return { success: false, error: "Nie udało się zaktualizować hasła. Link mógł wygasnąć lub wystąpił inny błąd." };
  }

  // Password update successful
  return { success: true, message: "Hasło zostało pomyślnie zmienione." };
}

// --- Request Password Reset Action ---
export async function requestPasswordReset(
  previousState: RequestPasswordResetActionState,
  formData: FormData
): Promise<RequestPasswordResetActionState> {

  const email = formData.get('email') as string;

  // 1. Validate data using Zod
  const validationResult = ResetPasswordRequestSchema.safeParse({ email });
  if (!validationResult.success) {
    return {
      success: false,
      // Return validation error message directly in 'message' field for UI consistency
      message: validationResult.error.flatten().fieldErrors.email?.[0] || "Nieprawidłowy adres email.",
    };
  }

  // 2. Proceed with Supabase password reset request
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
            // Ignore errors
          }
        }
      },
    }
  );

  // Define the redirect URL (where the user sets the new password)
  // Ensure this matches the page created in the previous step (UpdatePasswordPage)
  const redirectURL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`;

  // Call Supabase resetPasswordForEmail
  const { error } = await supabase.auth.resetPasswordForEmail(
    validationResult.data.email,
    {
      redirectTo: redirectURL,
    }
  );

  if (error) {
    console.error('Supabase resetPasswordForEmail error:', error);
    // For security, do not reveal specific errors like "User not found"
    // Only return a generic message or handle unexpected server errors
    // You might want to log the specific error for debugging purposes
    return {
      success: false, // Or true, depending on how you want to handle this for the UI
      message: "Jeśli konto istnieje, link do resetowania hasła został wysłany.",
      error: "Wystąpił nieoczekiwany błąd serwera.", // Optionally signal a true server error
    };
  }

  // Always return a success-like message to prevent email enumeration attacks
  return { success: true, message: "Jeśli konto powiązane z tym adresem email istnieje, wysłaliśmy na nie link do zresetowania hasła." };
} 