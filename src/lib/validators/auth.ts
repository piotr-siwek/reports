import * as z from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." })
});

export const RegisterFormSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email." }),
  password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
  confirmPassword: z.string().min(1, { message: "Potwierdzenie hasła jest wymagane." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są zgodne.",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

// --- Reset Password Confirm Schema ---
export const ResetPasswordConfirmSchema = z.object({
  newPassword: z.string().min(8, { message: "Nowe hasło musi mieć co najmniej 8 znaków." }),
  confirmNewPassword: z.string().min(1, { message: "Potwierdzenie nowego hasła jest wymagane." })
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Hasła nie są zgodne.",
  path: ["confirmNewPassword"], // Assign error to confirmNewPassword field
});

// --- Reset Password Request Schema ---
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email." }),
}); 