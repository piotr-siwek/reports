# Plan implementacji widoku Reset Hasła - Inicjacja (`/reset-password`)

## 1. Przegląd
Ten widok pozwala użytkownikowi rozpocząć proces resetowania zapomnianego hasła. Użytkownik podaje swój adres e-mail, na który system (poprzez Server Action i API) wysyła link resetujący. Widok powinien poinformować użytkownika o wysłaniu linku.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/reset-password`. Powinien znajdować się w grupie routingu `(auth)`.
- Ścieżka pliku: `app/(auth)/reset-password/page.tsx`

## 3. Struktura komponentów
```
app/
└── (auth)/                      # Opcjonalny layout dla stron autoryzacji
    ├── layout.tsx
    └── reset-password/
        └── page.tsx             # Komponent strony Reset Hasła - Inicjacja (Server Component)
            └── ResetPasswordRequestForm # Komponent formularza (Client Component)
                ├── Card (shadcn)
                │   ├── CardHeader (Tytuł: "Zresetuj Hasło")
                │   ├── CardDescription (Instrukcja: "Podaj email, aby otrzymać link do resetowania hasła.")
                │   ├── CardContent
                │   │   └── Form (react-hook-form / shadcn)
                │   │       └── FormField (email) -> Input + Label
                │   └── CardFooter
                │       ├── Button (shadcn, type="submit", text="Wyślij Link Resetujący")
                │       └── Link (Next.js, href="/login", text="Wróć do logowania")
                └── Toast (shadcn, wywoływany przez hook `useToast`)
```

## 4. Szczegóły komponentów
### `ResetPasswordPage` (`app/(auth)/reset-password/page.tsx`)
- **Opis komponentu:** Główny komponent Server Component dla strony `/reset-password`. Renderuje `<ResetPasswordRequestForm />`.
- **Główne elementy:** Renderuje komponent `<ResetPasswordRequestForm />`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

### `ResetPasswordRequestForm` (np. `src/components/auth/ResetPasswordRequestForm.tsx`)
- **Opis komponentu:** Komponent kliencki (`'use client'`) z formularzem do podania adresu e-mail. Używa `react-hook-form` i `zod` do walidacji. Wywołuje Server Action, która komunikuje się z API w celu wysłania linku resetującego. Obsługuje stan sukcesu (wyświetlenie informacji o wysłaniu linku) i błędy.
- **Główne elementy:** `Card`, `CardHeader`, `CardDescription`, `CardContent`, `CardFooter`, `Form`, `FormField`, `Input`, `Label`, `Button` (wszystko z `shadcn/ui`), `Link` (z `next/link`).
- **Obsługiwane interakcje:**
    - Wprowadzanie adresu e-mail.
    - Kliknięcie przycisku "Wyślij Link Resetujący" (submit).
    - Kliknięcie linku "Wróć do logowania".
- **Obsługiwana walidacja (Zod Schema - `ResetPasswordRequestSchema`):
    - **Email:** Wymagany, poprawny format email (`z.string().email(...)`).
- **Typy:**
    - ViewModel: `ResetPasswordRequestSchema` (`zod`).
    - DTO: `ResetPasswordCommand` (do Server Action).
- **Propsy:** Brak.

## 5. Typy
- **`ResetPasswordRequestSchema` (ViewModel, Zod Schema):**
  ```typescript
  import * as z from 'zod';

  export const ResetPasswordRequestSchema = z.object({
    email: z.string().email({ message: "Nieprawidłowy adres email." }),
  });

  export type ResetPasswordRequestValues = z.infer<typeof ResetPasswordRequestSchema>;
  ```
- **`ResetPasswordCommand` (DTO - z `src/types.ts`):**
  ```typescript
  export interface ResetPasswordCommand {
    email: string;
  }
  ```
- **`ResetPasswordResponseDto` (DTO - Odpowiedź API, z `src/types.ts`):**
  ```typescript
  export interface ResetPasswordResponseDto {
    message: string; // "Password reset link sent. Link expires after 24 hours."
  }
  ```
- **`ServerActionResponse` (Typ odpowiedzi Server Action - przykładowy):**
  ```typescript
  export interface ServerActionResponse {
    success: boolean;
    message?: string; // Komunikat sukcesu/informacyjny
    error?: string;   // Komunikat błędu
  }
  ```

## 6. Zarządzanie stanem
- **Stan formularza:** Zarządzany przez `react-hook-form` (`useForm`).
- **Stan ładowania API:** Lokalny stan `isLoading` (`useState`) w `ResetPasswordRequestForm`.
- **Stan sukcesu/błędu:** Lokalny stan (`useState`) w `ResetPasswordRequestForm` do przechowywania komunikatu sukcesu lub błędu z Server Action. Może być też zarządzany przez `Toast`.
- **Custom Hooks:** Brak specyficznych hooków.

## 7. Integracja API
- **Server Action:** Dedykowana Server Action (np. `requestPasswordReset` w `actions/auth.ts`).
  - **Dane wejściowe:** `ResetPasswordRequestValues`.
  - **Logika:**
    1. Wywołuje endpoint backendu: `POST /auth/reset-password`.
    2. Przekazuje `ResetPasswordCommand` jako ciało żądania.
    3. Przetwarza odpowiedź:
       - **Sukces (200 OK):** Odczytuje `ResetPasswordResponseDto`, zwraca `{ success: true, message: response.message }`.
       - **Błąd (400 Bad Request):** Zwraca `{ success: false, error: "Nie można wysłać linku. Sprawdź adres email." }` (lub bardziej szczegółowy błąd API).
       - **Inny błąd (5xx):** Loguje błąd, zwraca `{ success: false, error: "Wystąpił nieoczekiwany błąd." }`.
- **Typy żądania/odpowiedzi API (zgodnie z `api-plan.md` i `src/types.ts`):**
  - Żądanie do `POST /auth/reset-password`: `ResetPasswordCommand`
  - Odpowiedź (sukces) z `POST /auth/reset-password`: `ResetPasswordResponseDto`

## 8. Interakcje użytkownika
- **Wpisanie emaila:** Aktualizacja stanu `react-hook-form`.
- **Kliknięcie "Wyślij Link Resetujący":**
  1. Walidacja `zod`.
  2. Jeśli błędy, wyświetlenie ich przy polu.
  3. Jeśli OK:
     - Ustawienie `isLoading` na `true`.
     - Wywołanie Server Action `requestPasswordReset`.
     - Oczekiwanie na odpowiedź.
     - Po odpowiedzi:
       - Ustawienie `isLoading` na `false`.
       - **Sukces:** Wyświetlenie `Toast` z komunikatem sukcesu (np. "Link do resetowania hasła został wysłany na podany adres email."). Można też zablokować formularz lub wyświetlić stały komunikat sukcesu w komponencie.
       - **Błąd:** Wyświetlenie `Toast` z błędem.
- **Kliknięcie linku "Wróć do logowania":** Przekierowanie na `/login` (`next/link`).

## 9. Warunki i walidacja
- **Email:** Wymagany, poprawny format. Walidacja klienta (`zod`) i serwera (API). Błąd pod polem.
- **Warunek API (400):** Błąd po stronie serwera (np. email nie istnieje w bazie, choć API plan nie specyfikuje tego kodu błędu dla nieistniejącego emaila - warto to zweryfikować lub obsłużyć jako sukces dla bezpieczeństwa). Stan interfejsu: wyświetlenie błędu (`Toast`).
- **Warunek API (5xx):** Problem z serwerem. Stan interfejsu: wyświetlenie ogólnego błędu (`Toast`).

## 10. Obsługa błędów
- **Błędy walidacji klienta:** Obsługiwane przez `react-hook-form` i `zod`, wyświetlane pod polem.
- **Błędy API (400, 5xx):** Przekazywane z Server Action. Wyświetlane jako `Toast`. Należy unikać informacji, czy dany email istnieje w systemie.
- **Stan ładowania:** Przycisk "Wyślij Link Resetujący" deaktywowany / z wskaźnikiem ładowania podczas wywołania Server Action.
- **Stan sukcesu:** Po pomyślnym wysłaniu formularza, użytkownik powinien otrzymać jasną informację (przez `Toast` i/lub komunikat w komponencie), że link został wysłany (lub że *jeśli* konto istnieje, link został wysłany).

## 11. Kroki implementacji
1. **Utworzenie struktury plików:** Folder `app/(auth)/reset-password` i plik `page.tsx`.
2. **Implementacja `ResetPasswordPage`:** Server Component w `page.tsx` renderujący `ResetPasswordRequestForm`.
3. **Utworzenie komponentu `ResetPasswordRequestForm`:** Plik np. `src/components/auth/ResetPasswordRequestForm.tsx`, oznaczony `'use client'`.
4. **Zdefiniowanie schematu walidacji:** Stworzenie `ResetPasswordRequestSchema` (`zod`).
5. **Implementacja formularza:** Użycie `useForm`, `zodResolver`, komponentów `shadcn/ui` (`Card`, `Form`, `FormField`, `Input`, `Label`, `Button`, `CardDescription`). Dodanie linku do logowania.
6. **Implementacja Server Action (`requestPasswordReset`):**
   - W `actions/auth.ts`.
   - Funkcja asynchroniczna przyjmująca `ResetPasswordRequestValues`.
   - Logika wywołania API `POST /auth/reset-password` z `ResetPasswordCommand`.
   - Obsługa odpowiedzi (200, 400, 5xx).
   - Zwrócenie `ServerActionResponse` (zawsze zwracamy sukces lub ogólny błąd, aby nie ujawniać istnienia emaila).
7. **Połączenie formularza z Server Action:**
   - W `ResetPasswordRequestForm`, implementacja `onSubmit` wywołującej `requestPasswordReset`.
   - Obsługa `isLoading`.
   - Użycie `useToast` do pokazania komunikatu informacyjnego po wysłaniu (niezależnie od faktycznego sukcesu po stronie serwera, chyba że wystąpił błąd 5xx).
8. **Styling:** Dostosowanie wyglądu za pomocą Tailwind.
9. **Testowanie:** Sprawdzenie przepływu, walidacji, wyświetlania komunikatu po wysłaniu, obsługi błędów serwera (5xx). 