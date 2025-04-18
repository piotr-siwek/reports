# Plan implementacji widoku Reset Hasła - Ustawienie Nowego (`/reset-password/[token]`)

## 1. Przegląd
Ten widok pozwala użytkownikowi ustawić nowe hasło po kliknięciu w link resetujący otrzymany na e-mail. Widok odczytuje token resetujący z parametrów URL. Użytkownik wprowadza nowe hasło i jego potwierdzenie. Po pomyślnej zmianie hasła przez API, użytkownik jest informowany o sukcesie i zazwyczaj przekierowywany na stronę logowania.

**Uwaga:** Plan API (`.ai/api-plan.md`) nie definiuje jawnie endpointu do potwierdzenia resetu hasła za pomocą tokenu. Przyjmujemy założenie, że istnieje endpoint `POST /auth/reset-password/confirm` (lub podobny), który akceptuje token i nowe hasło.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką: `/reset-password/[token]`. Powinien znajdować się w grupie routingu `(auth)`.
- Ścieżka pliku: `app/(auth)/reset-password/[token]/page.tsx`

## 3. Struktura komponentów
```
app/
└── (auth)/                      # Opcjonalny layout dla stron autoryzacji
    ├── layout.tsx
    └── reset-password/
        └── [token]/
            └── page.tsx         # Komponent strony Reset Hasła - Ustawienie (Server Component)
                └── ResetPasswordConfirmForm # Komponent formularza (Client Component)
                    ├── Card (shadcn)
                    │   ├── CardHeader (Tytuł: "Ustaw Nowe Hasło")
                    │   ├── CardContent
                    │   │   └── Form (react-hook-form / shadcn)
                    │   │       ├── FormField (newPassword) -> Input (type="password") + Label
                    │   │       └── FormField (confirmNewPassword) -> Input (type="password") + Label
                    │   └── CardFooter
                    │       └── Button (shadcn, type="submit", text="Ustaw Nowe Hasło")
                    └── Toast (shadcn, wywoływany przez hook `useToast`)
```

## 4. Szczegóły komponentów
### `ResetPasswordConfirmPage` (`app/(auth)/reset-password/[token]/page.tsx`)
- **Opis komponentu:** Główny komponent Server Component dla strony `/reset-password/[token]`. Odczytuje `token` z parametrów ścieżki (`params`) i przekazuje go jako props do `ResetPasswordConfirmForm`.
- **Główne elementy:** Renderuje `<ResetPasswordConfirmForm token={params.token} />`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Definicja `params` dla strony dynamicznej (`{ params: { token: string } }`).
- **Propsy:** Przyjmuje `params` z Next.js.

### `ResetPasswordConfirmForm` (np. `src/components/auth/ResetPasswordConfirmForm.tsx`)
- **Opis komponentu:** Komponent kliencki (`'use client'`) obsługujący formularz ustawiania nowego hasła. Odbiera `token` jako props. Używa `react-hook-form` i `zod` do walidacji pól nowego hasła i jego potwierdzenia. Wywołuje Server Action do zmiany hasła przy użyciu tokenu.
- **Główne elementy:** `Card`, `Form`, `FormField`, `Input` (typ password), `Label`, `Button` (wszystko `shadcn/ui`).
- **Obsługiwane interakcje:**
    - Wprowadzanie nowego hasła i jego potwierdzenia.
    - Kliknięcie przycisku "Ustaw Nowe Hasło" (submit).
- **Obsługiwana walidacja (Zod Schema - `ResetPasswordConfirmSchema`):
    - **Nowe hasło:** Wymagane, minimum 8 znaków (`z.string().min(8, ...)`).
    - **Potwierdź nowe hasło:** Wymagane (`z.string().min(1, ...)`).
    - **Spójność haseł:** Sprawdzane za pomocą `.refine()` (`newPassword === confirmNewPassword`).
- **Typy:**
    - ViewModel: `ResetPasswordConfirmSchema` (`zod`).
    - DTO: `ResetPasswordConfirmCommand` (do Server Action - **typ zakładany**).
    - Props: `{ token: string }`
- **Propsy:** `{ token: string }` przekazany z `ResetPasswordConfirmPage`.

## 5. Typy
- **`ResetPasswordConfirmSchema` (ViewModel, Zod Schema):**
  ```typescript
  import * as z from 'zod';

  export const ResetPasswordConfirmSchema = z.object({
    newPassword: z.string().min(8, { message: "Nowe hasło musi mieć co najmniej 8 znaków." }),
    confirmNewPassword: z.string().min(1, { message: "Potwierdzenie nowego hasła jest wymagane." })
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Hasła nie są zgodne.",
    path: ["confirmNewPassword"],
  });

  export type ResetPasswordConfirmValues = z.infer<typeof ResetPasswordConfirmSchema>;
  ```
- **`ResetPasswordConfirmCommand` (DTO - *Założony typ* dla Server Action/API):**
  ```typescript
  // Zakładany typ, brak w api-plan.md
  export interface ResetPasswordConfirmCommand {
    token: string;
    newPassword: string;
    confirmNewPassword: string; // Może być opcjonalne po stronie API, jeśli walidacja jest tylko na backendzie
  }
  ```
- **`ResetPasswordConfirmResponseDto` (DTO - *Założony typ* odpowiedzi API):**
  ```typescript
  // Zakładany typ, brak w api-plan.md
  export interface ResetPasswordConfirmResponseDto {
    message: string; // Np. "Password has been reset successfully."
  }
  ```
- **`ServerActionResponse` (Typ odpowiedzi Server Action - przykładowy):**
  ```typescript
  export interface ServerActionResponse {
    success: boolean;
    message?: string;
    error?: string;
  }
  ```

## 6. Zarządzanie stanem
- **Stan formularza:** Zarządzany przez `react-hook-form` (`useForm`).
- **Stan ładowania API:** Lokalny stan `isLoading` (`useState`) w `ResetPasswordConfirmForm`.
- **Błędy serwera:** Lokalny stan `serverError` (`useState`) w `ResetPasswordConfirmForm`.
- **Token:** Przechowywany jako props komponentu `ResetPasswordConfirmForm`.
- **Custom Hooks:** Brak.

## 7. Integracja API
- **Server Action:** Dedykowana Server Action (np. `confirmPasswordReset` w `actions/auth.ts`).
  - **Dane wejściowe:** Obiekt zawierający `token` (z propsów) oraz `ResetPasswordConfirmValues` (z formularza).
  - **Logika:**
    1. **(Założenie)** Wywołuje endpoint backendu: `POST /auth/reset-password/confirm`.
    2. **(Założenie)** Przekazuje `ResetPasswordConfirmCommand` (zawierający `token`, `newPassword`, `confirmNewPassword`) jako ciało żądania.
    3. Przetwarza odpowiedź:
       - **Sukces (np. 200 OK):** Odczytuje `ResetPasswordConfirmResponseDto`, zwraca `{ success: true, message: response.message }`.
       - **Błąd - Nieprawidłowy/Wygasły token (np. 400 Bad Request lub 404 Not Found):** Zwraca `{ success: false, error: "Link do resetowania hasła jest nieprawidłowy lub wygasł." }`.
       - **Błąd - Walidacja hasła (np. 400 Bad Request):** Zwraca `{ success: false, error: "Nowe hasło nie spełnia wymagań." }`.
       - **Inny błąd (5xx):** Loguje błąd, zwraca `{ success: false, error: "Wystąpił nieoczekiwany błąd." }`.
- **Typy żądania/odpowiedzi API (Założone):**
  - Żądanie do `POST /auth/reset-password/confirm`: `ResetPasswordConfirmCommand`
  - Odpowiedź (sukces) z `POST /auth/reset-password/confirm`: `ResetPasswordConfirmResponseDto`

## 8. Interakcje użytkownika
- **Wpisanie haseł:** Aktualizacja stanu `react-hook-form`. Walidacja on-blur/on-change.
- **Kliknięcie "Ustaw Nowe Hasło":**
  1. Walidacja `zod`.
  2. Jeśli błędy (np. niezgodne hasła), wyświetlenie ich przy polach.
  3. Jeśli OK:
     - Ustawienie `isLoading` na `true`.
     - Wywołanie Server Action `confirmPasswordReset` z `token` i danymi formularza.
     - Oczekiwanie na odpowiedź.
     - Po odpowiedzi:
       - Ustawienie `isLoading` na `false`.
       - **Sukces:** Wyświetlenie `Toast` z komunikatem sukcesu (np. "Hasło zostało zmienione."), przekierowanie do `/login` (`useRouter().push("/login")`).
       - **Błąd:** Ustawienie `serverError`, wyświetlenie `Toast` z błędem (np. "Link wygasł.").

## 9. Warunki i walidacja
- **Nowe hasło:** Wymagane, min. 8 znaków. Walidacja klienta (`zod`) i serwera (API). Błąd pod polem.
- **Potwierdź nowe hasło:** Wymagane, zgodne z nowym hasłem. Walidacja klienta (`zod`). Błąd pod polem.
- **Warunek API (Błąd tokenu - np. 400/404):** Token nieprawidłowy lub wygasł. Stan interfejsu: wyświetlenie błędu (`serverError`, `Toast`). Formularz może zostać zablokowany.
- **Warunek API (Błąd walidacji hasła - np. 400):** Hasło nie spełnia wymagań serwera. Stan interfejsu: wyświetlenie błędu (`serverError`, `Toast`).
- **Warunek API (5xx):** Problem z serwerem. Stan interfejsu: wyświetlenie ogólnego błędu (`serverError`, `Toast`).

## 10. Obsługa błędów
- **Błędy walidacji klienta:** Obsługiwane przez `react-hook-form` i `zod`, wyświetlane pod polami.
- **Błędy API (np. zły token, błąd walidacji serwera):** Przekazywane z Server Action. Wyświetlane jako `Toast` i/lub komunikat `serverError`.
- **Błędy sieciowe / serwera (5xx):** Ogólny komunikat błędu przez `Toast` / `serverError`.
- **Stan ładowania:** Przycisk "Ustaw Nowe Hasło" deaktywowany / z wskaźnikiem ładowania podczas wywołania Server Action.

## 11. Kroki implementacji
1. **Utworzenie struktury plików:** Folder `app/(auth)/reset-password/[token]` i plik `page.tsx`.
2. **Implementacja `ResetPasswordConfirmPage`:** Server Component w `page.tsx` odczytujący `token` z `params` i przekazujący go do `ResetPasswordConfirmForm`.
3. **Utworzenie komponentu `ResetPasswordConfirmForm`:** Plik np. `src/components/auth/ResetPasswordConfirmForm.tsx`, oznaczony `'use client'`, przyjmujący `token` jako prop.
4. **Zdefiniowanie schematu walidacji:** Stworzenie `ResetPasswordConfirmSchema` (`zod`) z walidacją pól i zgodności haseł.
5. **Implementacja formularza:** Użycie `useForm`, `zodResolver`, komponentów `shadcn/ui`.
6. **Implementacja Server Action (`confirmPasswordReset`):**
   - W `actions/auth.ts`.
   - Funkcja asynchroniczna przyjmująca obiekt z `token` i `ResetPasswordConfirmValues`.
   - **(Założenie)** Logika wywołania API `POST /auth/reset-password/confirm` z `ResetPasswordConfirmCommand`.
   - Obsługa odpowiedzi (sukces, błędy tokenu, błędy walidacji, 5xx).
   - Zwrócenie `ServerActionResponse`.
7. **Połączenie formularza z Server Action:**
   - W `ResetPasswordConfirmForm`, implementacja `onSubmit` wywołującej `confirmPasswordReset`.
   - Obsługa `isLoading` i `serverError`.
   - Użycie `useToast` do powiadomień.
   - Implementacja przekierowania do `/login` po sukcesie (`useRouter`).
8. **Styling:** Dostosowanie wyglądu.
9. **Testowanie:** Sprawdzenie przepływu ustawiania nowego hasła, walidacji, obsługi błędów (niezgodne hasła, wygaśnięty/zły token), przekierowania. **Konieczne będzie uzgodnienie lub dodanie brakującego endpointu API.** 