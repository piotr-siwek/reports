import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { logoutAction } from '@/actions/authActions';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Home, User, LogOut } from 'lucide-react';

export default async function ProtectedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log('user', user);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex fixed top-0 left-0 h-full">
        <nav className="flex flex-col gap-2">
          <h2 className="mb-2 text-lg font-semibold tracking-tight">Menu</h2>
          <Link href="/reports">
            <Button variant={true ? "secondary" : "ghost"} className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Raporty
            </Button>
          </Link>
        </nav>
        
        <div className="mt-auto flex flex-col gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          )}
          <form action={logoutAction}>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex flex-1 flex-col p-6 md:ml-64">
        {children}
      </main>
      
      <Toaster richColors />
    </div>
  );
} 