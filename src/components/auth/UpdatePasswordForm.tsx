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
import { updatePassword, UpdatePasswordActionState } from "../../actions/auth"; // Import action and state
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: UpdatePasswordActionState = {
  success: false,
  error: undefined,
  message: undefined,
};

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updatePassword, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Hasło zmienione!");
      // Redirect to login after successful password update
      router.push("/login");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md mx-auto"> {/* Adjusted width */}
      <CardHeader>
        <CardTitle className="text-2xl">Ustaw Nowe Hasło</CardTitle>
        <CardDescription>
          Wprowadź nowe hasło dla swojego konta.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">Nowe hasło</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
            <p className="text-xs text-muted-foreground">
              Minimum 8 znaków.
            </p>
            {/* TODO: Display field-specific errors from state if implemented */}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmNewPassword">Potwierdź nowe hasło</Label>
            <Input id="confirmNewPassword" name="confirmNewPassword" type="password" required />
             {/* TODO: Display field-specific errors (especially for mismatch) */}
          </div>

          {state.error && (
            <p className="text-sm font-medium text-destructive">
              {state.error} {/* Display general form error */}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Ustawianie..." : "Ustaw Nowe Hasło"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 