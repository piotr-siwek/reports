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