'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser, RegisterActionState } from "../../../actions/auth"; // Import action and state type
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: RegisterActionState = {
  success: false,
  error: undefined,
  message: undefined,
};

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Konto utworzone!");
      // Redirect to login page after successful registration
      router.push("/login");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-lg mx-auto"> {/* Increased max-width slightly */}
      <CardHeader className="text-center"> {/* Centered header text */}
        <CardTitle className="text-2xl">Zarejestruj się</CardTitle>
        <CardDescription>
          Wprowadź swoje dane, aby utworzyć konto.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
             {/* TODO: Display field-specific errors from state.fieldErrors if implemented */}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" name="password" type="password" required />
            <p className="text-xs text-muted-foreground">
              Minimum 8 znaków.
            </p>
             {/* TODO: Display field-specific errors */}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
             {/* TODO: Display field-specific errors (especially for mismatch) */}
          </div>

          {state.error && (
            <p className="text-sm font-medium text-destructive">
              {state.error} {/* Display general form error */}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4"> {/* Centered footer items */}
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Rejestrowanie..." : "Zarejestruj się"}
          </Button>
          <div className="text-sm">
            <Link href="/login" className="underline">
              Masz już konto? Zaloguj się
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 