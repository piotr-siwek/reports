import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  // This page should be the target of the password reset link from Supabase
  return (
    <div className="flex items-center justify-center py-12">
      <UpdatePasswordForm />
    </div>
  );
} 