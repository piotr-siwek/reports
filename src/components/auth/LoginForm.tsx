"use client";

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
import { loginUser, LoginActionState } from "../../actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: LoginActionState = {
  success: false,
  error: undefined,
  message: undefined,
};

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginUser, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Zalogowano pomyślnie!");
      router.push("/reports");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Zaloguj się</CardTitle>
        <CardDescription>
          Wpisz swój email i hasło, aby uzyskać dostęp do swojego konta.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state.error && (
            <p className="text-sm font-medium text-destructive">
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Logowanie..." : "Zaloguj się"}
          </Button>
          <div className="text-sm w-full flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <Link href="/register" className="underline">
              Nie masz konta? Zarejestruj się
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 