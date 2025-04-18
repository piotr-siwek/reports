# Plan implementacji widoku Rejestracja (`/register`)

## 1. Przegląd
Widok rejestracji umożliwia nowym użytkownikom utworzenie konta w systemie. Wymaga podania adresu e-mail, hasła oraz jego potwierdzenia. Po pomyślnej walidacji i utworzeniu konta przez API, użytkownik otrzymuje powiadomienie o sukcesie i zazwyczaj jest zachęcany do zalogowania się (np. przez przekierowanie na stronę logowania lub wyświetlenie odpowiedniego komunikatu).

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/register`. Powinien znajdować się w grupie routingu `(auth)`.
- Ścieżka pliku: `app/(auth)/register/page.tsx`

## 3. Struktura komponentów
```
app/
└── (auth)/                      # Opcjonalny layout dla stron autoryzacji
    ├── layout.tsx
    └── register/
        └── page.tsx             # Komponent strony Rejestracja (Server Component)
            └── RegisterForm     # Komponent formularza rejestracji (Client Component)
                ├── Card (shadcn)
                │   ├── CardHeader (Tytuł: "Zarejestruj się")
                │   ├── CardContent
                │   │   └── Form (react-hook-form / shadcn)
                │   │       ├── FormField (email) -> Input + Label
                │   │       ├── FormField (password) -> Input (type="password") + Label + HelperText (wymagania hasła)
                │   │       └── FormField (confirmPassword) -> Input (type="password") + Label
                │   └── CardFooter
                │       ├── Button (shadcn, type="submit", text="Zarejestruj się")
                │       └── Link (Next.js, href="/login", text="Masz już konto? Zaloguj się")
                └── Toast (shadcn, wywoływany przez hook `useToast`)
```

## 4. Szczegóły komponentów
### `RegisterPage` (`app/(auth)/register/page.tsx`)
- **Opis komponentu:** Główny komponent Server Component dla strony `/register`. Renderuje `<RegisterForm />`.
- **Główne elementy:** Renderuje komponent `<RegisterForm />`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

### `RegisterForm` (np. `src/components/auth/RegisterForm.tsx`)
- **Opis komponentu:** Komponent kliencki (`'use client'`) obsługujący formularz rejestracji. Wykorzystuje `react-hook-form` i `zod` do walidacji. Wywołuje Server Action do rejestracji użytkownika i obsługuje odpowiedzi (sukces, błędy np. zajęty email).
- **Główne elementy:** `Card`, `Form`, `FormField`, `Input`, `Label`, `Button` (wszystko z `shadcn/ui`), `Link` (z `next/link`), opcjonalnie element `p` lub `FormDescription` dla wymagań hasła.
- **Obsługiwane interakcje:**
    - Wprowadzanie danych w polach `email`, `password`, `confirmPassword`.
    - Kliknięcie przycisku "Zarejestruj się" (submit).
    - Kliknięcie linku "Masz już konto? Zaloguj się".
- **Obsługiwana walidacja (Zod Schema - `RegisterFormSchema`):
    - **Email:** Wymagany, poprawny format email (`z.string().email(...)`).
    - **Hasło:** Wymagane, minimum 8 znaków (`z.string().min(8, ...)`). Warto dodać jasny komunikat o wymaganiach pod polem.
    - **Potwierdź hasło:** Wymagane (`z.string().min(1, ...)`).
    - **Spójność haseł:** Cały schemat sprawdzany za pomocą `.refine()` w celu upewnienia się, że `password === confirmPassword`.
- **Typy:**
    - ViewModel: `RegisterFormSchema` (`zod`).
    - DTO: `RegisterUserCommand` (do Server Action).
- **Propsy:** Brak.

## 5. Typy
- **`RegisterFormSchema` (ViewModel, Zod Schema):**
  ```typescript
  import * as z from 'zod';

  export const RegisterFormSchema = z.object({
    email: z.string().email({ message: "Nieprawidłowy adres email." }),
    password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
    confirmPassword: z.string().min(1, { message: "Potwierdzenie hasła jest wymagane." })
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne.",
    path: ["confirmPassword"], // Błąd przypisany do pola confirmPassword
  });

  export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
  ```
- **`RegisterUserCommand` (DTO - z `src/types.ts`):**
  ```typescript
  export interface RegisterUserCommand {
    email: string;
    password: string;
    confirmPassword: string;
  }
  ```
- **`RegisterUserResponseDto` (DTO - Odpowiedź API, z `src/types.ts`):**
  ```typescript
  export interface RegisterUserResponseDto {
    message: string;
    user: UserDto; // UserDto zawiera id, email
  }
  ```
- **`ServerActionResponse` (Typ odpowiedzi Server Action - przykładowy, może być ten sam co dla logowania):**
  ```typescript
  export interface ServerActionResponse {
    success: boolean;
    message?: string; // Komunikat sukcesu
    error?: string;   // Komunikat błędu
  }
  ```

## 6. Zarządzanie stanem
- **Stan formularza:** Zarządzany przez `react-hook-form` (`useForm`) - wartości, błędy, stan `isSubmitting`.
- **Stan ładowania API:** Lokalny stan `isLoading` (`useState`) w `RegisterForm`.
- **Błędy serwera:** Lokalny stan `serverError` (`useState`) w `RegisterForm`, aktualizowany na podstawie odpowiedzi Server Action.
- **Custom Hooks:** Brak specyficznych hooków dla tego formularza.

## 7. Integracja API
- **Server Action:** Dedykowana Server Action (np. `registerUser` w `actions/auth.ts`).
  - **Dane wejściowe:** `RegisterFormValues` (zwalidowane przez `zod`).
  - **Logika:**
    1. Wywołuje endpoint backendu: `POST /auth/register`.
    2. Przekazuje `RegisterUserCommand` jako ciało żądania.
    3. Przetwarza odpowiedź:
       - **Sukces (201 Created):** Odczytuje `RegisterUserResponseDto`, zwraca `{ success: true, message: response.message }`.
       - **Błąd - Email zajęty (409 Conflict):** Zwraca `{ success: false, error: "Adres email jest już zajęty." }`.
       - **Błąd - Walidacja (400 Bad Request):** Zwraca `{ success: false, error: "Błąd walidacji. Sprawdź wprowadzone dane." }` (lub bardziej szczegółowy błąd jeśli API go dostarcza).
       - **Inny błąd (5xx):** Loguje błąd, zwraca `{ success: false, error: "Wystąpił nieoczekiwany błąd." }`.
- **Typy żądania/odpowiedzi API (zgodnie z `api-plan.md` i `src/types.ts`):**
  - Żądanie do `POST /auth/register`: `RegisterUserCommand`
  - Odpowiedź (sukces) z `POST /auth/register`: `RegisterUserResponseDto`

## 8. Interakcje użytkownika
- **Wpisanie danych:** Aktualizacja stanu `react-hook-form`. Walidacja może być wyzwalana on-blur/on-change.
- **Kliknięcie "Zarejestruj się":**
  1. Walidacja `zod` przez `react-hook-form`.
  2. Jeśli błędy, wyświetlenie ich przy polach.
  3. Jeśli OK:
     - Ustawienie `isLoading` na `true`, deaktywacja przycisku.
     - Wywołanie Server Action `registerUser`.
     - Oczekiwanie na odpowiedź.
     - Po odpowiedzi:
       - Ustawienie `isLoading` na `false`.
       - **Sukces:** Wyświetlenie `Toast` z komunikatem sukcesu (np. "Konto zostało utworzone!"), przekierowanie do `/login` (`useRouter().push("/login")`).
       - **Błąd:** Ustawienie `serverError` na podstawie odpowiedzi, wyświetlenie `Toast` z błędem (np. "Adres email jest już zajęty.").
- **Kliknięcie linku "Masz już konto? Zaloguj się":** Przekierowanie na `/login` (`next/link`).

## 9. Warunki i walidacja
- **Email:** Wymagany, poprawny format. Walidacja klienta (`zod`) i serwera (API). Błąd pod polem.
- **Hasło:** Wymagane, min. 8 znaków. Walidacja klienta (`zod`) i serwera (API). Błąd pod polem. Wymagania hasła widoczne dla użytkownika.
- **Potwierdź hasło:** Wymagane, musi być identyczne z hasłem. Walidacja klienta (`zod`) i serwera (API). Błąd pod polem.
- **Warunek API (409):** Email już istnieje. Stan interfejsu: wyświetlenie błędu (`serverError`, `Toast`, ewentualnie błąd przy polu email).
- **Warunek API (400):** Błąd walidacji po stronie serwera. Stan interfejsu: wyświetlenie błędu (`serverError`, `Toast`).
- **Warunek API (5xx):** Problem z serwerem. Stan interfejsu: wyświetlenie ogólnego błędu (`serverError`, `Toast`).

## 10. Obsługa błędów
- **Błędy walidacji klienta:** Obsługiwane przez `react-hook-form` i `zod`, wyświetlane pod polami.
- **Błędy API (409, 400):** Przekazywane z Server Action. Wyświetlane jako `Toast` i potencjalnie jako komunikat na poziomie formularza (`serverError`). Należy rozróżnić błąd 409 od 400, dając użytkownikowi jasny komunikat.
- **Błędy sieciowe / serwera (5xx):** Ogólny komunikat błędu przez `Toast` / `serverError`.
- **Stan ładowania:** Przycisk "Zarejestruj się" deaktywowany / z wskaźnikiem ładowania podczas wywołania Server Action.

## 11. Kroki implementacji
1. **Utworzenie struktury plików:** Folder `app/(auth)/register` i plik `page.tsx`.
2. **Implementacja `RegisterPage`:** Server Component w `page.tsx` renderujący `RegisterForm`.
3. **Utworzenie komponentu `RegisterForm`:** Plik np. `src/components/auth/RegisterForm.tsx`, oznaczony `'use client'`.
4. **Zdefiniowanie schematu walidacji:** Stworzenie `RegisterFormSchema` (`zod`) z walidacją pól i `.refine()` dla zgodności haseł.
5. **Implementacja formularza:** Użycie `useForm`, `zodResolver`, komponentów `shadcn/ui` (`Card`, `Form`, `FormField`, `Input`, `Label`, `Button`). Dodanie linku do logowania i informacji o wymaganiach hasła.
6. **Implementacja Server Action (`registerUser`):**
   - W `actions/auth.ts` (lub dedykowanym pliku).
   - Funkcja asynchroniczna przyjmująca `RegisterFormValues`.
   - Logika wywołania API `POST /auth/register` z `RegisterUserCommand`.
   - Obsługa odpowiedzi (201, 409, 400, 5xx).
   - Zwrócenie `ServerActionResponse`.
7. **Połączenie formularza z Server Action:**
   - W `RegisterForm`, implementacja `onSubmit` wywołującej `registerUser`.
   - Obsługa `isLoading` i `serverError`.
   - Użycie `useToast` do powiadomień.
   - Implementacja przekierowania do `/login` po sukcesie (`useRouter`).
8. **Styling:** Dostosowanie wyglądu za pomocą Tailwind.
9. **Testowanie:** Sprawdzenie przepływu rejestracji, walidacji (w tym zgodności haseł), obsługi błędów (zajęty email, inne), przekierowania. 