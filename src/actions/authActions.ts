'use server';

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const supabase = await createClient();

  // Attempt to sign out the user
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logging out:', error);
    // Optionally: redirect to an error page or show a message
    // For now, we redirect to login even if signout fails server-side,
    // as the client session might be invalid anyway.
  }

  // Redirect to the login page after sign out attempt
  redirect('/login');
} 