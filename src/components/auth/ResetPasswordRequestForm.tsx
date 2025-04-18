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
import { requestPasswordReset, RequestPasswordResetActionState } from "../../../actions/auth"; // Import action and state
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

const initialState: RequestPasswordResetActionState = {
  success: false,
  message: undefined,
  error: undefined,
};

export default function ResetPasswordRequestForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);
  const [submitted, setSubmitted] = useState(false); // Track if form was submitted

  useEffect(() => {
    // Display message on success or if there was a validation message
    if (state.message) {
      if (state.success || !state.error) { // Treat validation errors shown in message as 'success' for UI
        toast.info(state.message); // Use info toast for the standard message
        setSubmitted(true); // Indicate submission was processed
      } else {
        toast.error(state.message); // Show validation errors as error toasts
      }
    }
    // Handle unexpected server errors separately
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Zresetuj Hasło</CardTitle>
        <CardDescription>
          Podaj adres email powiązany z kontem, a wyślemy link do zresetowania hasła.
        </CardDescription>
      </CardHeader>
      {/* Show confirmation message instead of form after successful submission */}
      {submitted ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {state.message || "Link do resetowania hasła został wysłany (jeśli konto istnieje). Sprawdź swoją skrzynkę odbiorczą."}
          </p>
        </CardContent>
      ) : (
        <form action={formAction}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
               {/* Display validation error message from state if applicable */}
              {!state.success && state.message && (
                <p className="text-sm font-medium text-destructive">
                  {state.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4">
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Wysyłanie..." : "Wyślij Link Resetujący"}
            </Button>
            <div className="text-sm">
              <Link href="/login" className="underline">
                Wróć do logowania
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
} 