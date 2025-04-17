import { Toaster } from "@/components/ui/sonner";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
      <Toaster richColors closeButton />
    </>
  );
} 