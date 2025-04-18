import * as z from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." })
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>; 