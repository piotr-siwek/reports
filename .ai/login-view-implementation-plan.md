# Plan implementacji widoku Logowanie (`/login`)

## 1. Przegląd
Widok logowania umożliwia zarejestrowanym użytkownikom uwierzytelnienie się w systemie za pomocą adresu e-mail i hasła. Po pomyślnym zalogowaniu użytkownik uzyskuje dostęp do chronionych zasobów aplikacji (np. dashboardu z raportami) i otrzymuje token sesji (zarządzany przez Server Action, np. w HttpOnly cookie). Widok zawiera również linki do odzyskiwania hasła i rejestracji.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/login`. Powinien znajdować się w grupie routingu `(auth)`, aby potencjalnie współdzielić layout z innymi stronami uwierzytelniania.
- Ścieżka pliku: `app/(auth)/login/page.tsx`

## 3. Struktura komponentów
```
app/
└── (auth)/                      # Opcjonalny layout dla stron autoryzacji
    ├── layout.tsx               # Może zawierać np. wyśrodkowany kontener
    └── login/
        └── page.tsx             # Komponent strony Logowanie (Server Component)
            └── LoginForm        # Komponent formularza logowania (Client Component)
                ├── Card (shadcn)
                │   ├── CardHeader (Tytuł: "Zaloguj się")
                │   ├── CardContent
                │   │   └── Form (react-hook-form / shadcn)
                │   │       ├── FormField (email) -> Input (shadcn) + Label
                │   │       └── FormField (password) -> Input (shadcn, type="password") + Label
                │   └── CardFooter
                │       ├── Button (shadcn, type="submit", text="Zaloguj się")
                │       ├── Link (Next.js, href="/register", text="Nie masz konta? Zarejestruj się")
                │       └── Link (Next.js, href="/reset-password", text="Zapomniałeś hasła?")
                └── Toast (shadcn, wywoływany przez hook `useToast`)
```

## 4. Szczegóły komponentów
### `LoginPage` (`app/(auth)/login/page.tsx`)
- **Opis komponentu:** Główny komponent Server Component dla strony `/login`. Odpowiada za renderowanie struktury strony i osadzenie interaktywnego formularza `LoginForm`.
- **Główne elementy:** Renderuje komponent `<LoginForm />`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** Brak.

### `LoginForm` (np. `src/components/auth/LoginForm.tsx`)
- **Opis komponentu:** Komponent kliencki (`'use client'`) zawierający formularz logowania. Używa `react-hook-form` do zarządzania stanem formularza, `zod` do walidacji i wywołuje Server Action do logowania użytkownika. Wyświetla błędy walidacji i błędy zwrócone przez Server Action.
- **Główne elementy:** `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Form`, `FormField`, `Input`, `Label`, `Button` (wszystko z `shadcn/ui`), `Link` (z `next/link`).
- **Obsługiwane interakcje:**
    - Wprowadzanie danych w polach `email` i `password`.
    - Kliknięcie przycisku "Zaloguj się" (submit formularza).
    - Kliknięcie linków "Nie masz konta? Zarejestruj się" i "Zapomniałeś hasła?".
- **Obsługiwana walidacja:**
    - **Email:** Wymagany, musi być poprawnym formatem email (np. `name@domain.com`). (Walidacja `zod`: `z.string().email(...)`).
    - **Hasło:** Wymagane, nie może być puste. (Walidacja `zod`: `z.string().min(1, ...)`).
- **Typy:**
    - ViewModel: `LoginFormSchema` (zdefiniowany za pomocą `zod`).
    - DTO: `LoginCommand` (używany do przekazania danych do Server Action).
- **Propsy:** Brak (jest to komponent osadzony na stronie).

## 5. Typy
- **`LoginFormSchema` (ViewModel, Zod Schema):**
  ```typescript
  import * as z from 'zod';

  export const LoginFormSchema = z.object({
    email: z.string().email({ message: "Nieprawidłowy adres email." }),
    password: z.string().min(1, { message: "Hasło jest wymagane." }) // Minimalna walidacja, API zweryfikuje resztę
  });

  export type LoginFormValues = z.infer<typeof LoginFormSchema>;
  ```
- **`LoginCommand` (DTO - z `src/types.ts`):**
  ```typescript
  export interface LoginCommand {
    email: string;
    password: string;
  }
  ```
- **`ServerActionResponse` (Typ odpowiedzi Server Action - przykładowy):**
  ```typescript
  export interface ServerActionResponse {
    success: boolean;
    message?: string; // Komunikat sukcesu
    error?: string;   // Komunikat błędu
  }
  ```

## 6. Zarządzanie stanem
- **Stan formularza:** Zarządzany przez `react-hook-form` (`useForm`). Obejmuje wartości pól, błędy walidacji, stan `isSubmitting`.
- **Stan ładowania API:** Zarządzany lokalnie w komponencie `LoginForm` za pomocą `useState` (np. `const [isLoading, setIsLoading] = useState(false);`), aktualizowany przed i po wywołaniu Server Action.
- **Błędy serwera:** Zarządzane lokalnie w `LoginForm` za pomocą `useState` (np. `const [serverError, setServerError] = useState<string | null>(null);`), ustawiane na podstawie odpowiedzi z Server Action.
- **Stan globalny (Auth):** Logika logowania (Server Action) ustawia token w cookie. Globalny stan (np. w Zustand store, jak wspomniano w `ui-plan.md`) jest prawdopodobnie odczytywany/aktualizowany w głównym layoutcie chronionym (`app/(protected)/layout.tsx`) na podstawie obecności/ważności cookie, a nie bezpośrednio przez `LoginForm`.
- **Custom Hooks:** Nie jest wymagany dedykowany hook dla samego formularza logowania, ale może istnieć globalny `useAuth` do odczytu stanu zalogowania w innych częściach aplikacji.

## 7. Integracja API
- **Server Action:** Dedykowana Server Action (np. `loginUser` w `actions/auth.ts`) zostanie wywołana z komponentu `LoginForm`.
  - **Dane wejściowe:** `LoginFormValues` (zwalidowane przez `zod`).
  - **Logika:**
    1. Wywołuje endpoint backendu: `POST /auth/login`.
    2. Przekazuje `LoginCommand` jako ciało żądania.
    3. Przetwarza odpowiedź:
       - **Sukces (200 OK):** Odczytuje `LoginResponseDto`, zapisuje token w bezpiecznym HttpOnly cookie (`cookies().set(...)`), zwraca `{ success: true }`.
       - **Błąd (401 Unauthorized):** Zwraca `{ success: false, error: "Nieprawidłowy email lub hasło." }`.
       - **Błąd (400 Bad Request):** Zwraca `{ success: false, error: "Nieprawidłowe dane wejściowe." }`.
       - **Inny błąd:** Loguje błąd, zwraca `{ success: false, error: "Wystąpił nieoczekiwany błąd." }`.
- **Typy żądania/odpowiedzi API (zgodnie z `api-plan.md` i `src/types.ts`):**
  - Żądanie do `POST /auth/login`: `LoginCommand`
  - Odpowiedź (sukces) z `POST /auth/login`: `LoginResponseDto`

## 8. Interakcje użytkownika
- **Wpisanie danych:** Aktualizacja stanu formularza przez `react-hook-form`. Walidacja on-blur/on-change (konfigurowalne).
- **Kliknięcie "Zaloguj się":**
  1. Uruchomienie walidacji `zod` przez `react-hook-form`.
  2. Jeśli walidacja nie przejdzie, wyświetlenie błędów przy polach.
  3. Jeśli walidacja przejdzie:
     - Ustawienie stanu `isLoading` na `true`, deaktywacja przycisku.
     - Wywołanie Server Action `loginUser` z danymi formularza.
     - Oczekiwanie na odpowiedź Server Action.
     - Po otrzymaniu odpowiedzi:
       - Ustawienie `isLoading` na `false`.
       - **Sukces:** Wyświetlenie `Toast` sukcesu, przekierowanie do `/reports` (lub innego dashboardu) za pomocą `useRouter().push()`.
       - **Błąd:** Ustawienie `serverError` na podstawie komunikatu z Server Action, wyświetlenie `Toast` błędu.
- **Kliknięcie linków:** Przekierowanie na `/register` lub `/reset-password` za pomocą `next/link`.

## 9. Warunki i walidacja
- **Email:** Wymagany, poprawny format email. Walidacja po stronie klienta (`zod`) i serwera (API). Komunikat błędu (`react-hook-form`) wyświetlany pod polem.
- **Hasło:** Wymagane, niepuste. Walidacja po stronie klienta (`zod`) i serwera (API). Komunikat błędu (`react-hook-form`) wyświetlany pod polem.
- **Warunek API (401):** Użytkownik podał niepoprawne dane. Stan interfejsu: wyświetlenie błędu (`serverError`, `Toast`).
- **Warunek API (400):** Błąd walidacji po stronie serwera lub niepoprawne żądanie. Stan interfejsu: wyświetlenie błędu (`serverError`, `Toast`).
- **Warunek API (Inne błędy):** Problem z serwerem lub połączeniem. Stan interfejsu: wyświetlenie ogólnego błędu (`serverError`, `Toast`).

## 10. Obsługa błędów
- **Błędy walidacji klienta:** Obsługiwane przez `react-hook-form` i `zod`. Komunikaty wyświetlane bezpośrednio pod odpowiednimi polami formularza.
- **Błędy API (np. 401, 400):** Przekazywane z Server Action do komponentu `LoginForm`. Wyświetlane jako komunikat błędu na poziomie formularza (np. pod przyciskiem) i/lub za pomocą komponentu `Toast` (`shadcn/ui`). Komunikaty powinny być przyjazne dla użytkownika (np. "Nieprawidłowy email lub hasło.").
- **Błędy sieciowe / serwera (5xx):** Obsługiwane w Server Action. Zwracany jest ogólny komunikat błędu, który jest wyświetlany w `LoginForm` (np. "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.") za pomocą `Toast` i/lub komunikatu na poziomie formularza.
- **Stan ładowania:** Przycisk "Zaloguj się" powinien być deaktywowany i/lub pokazywać wskaźnik ładowania (`Spinner`) podczas komunikacji z Server Action, aby zapobiec wielokrotnemu wysyłaniu formularza.

## 11. Kroki implementacji
1. **Utworzenie struktury plików:** Stworzenie folderu `app/(auth)/login` i pliku `page.tsx`.
2. **Implementacja `LoginPage`:** Stworzenie podstawowego Server Component w `page.tsx`, który importuje i renderuje `LoginForm`.
3. **Utworzenie komponentu `LoginForm`:** Stworzenie pliku (np. `src/components/auth/LoginForm.tsx`), oznaczenie go jako Client Component (`'use client'`).
4. **Zdefiniowanie schematu walidacji:** Stworzenie `LoginFormSchema` przy użyciu `zod`.
5. **Implementacja formularza:** Użycie `useForm` z `react-hook-form` i `zodResolver`. Zbudowanie interfejsu formularza przy użyciu komponentów `shadcn/ui` (`Card`, `Form`, `FormField`, `Input`, `Label`, `Button`). Dodanie linków do rejestracji i resetowania hasła.
6. **Implementacja Server Action (`loginUser`):**
   - Stworzenie pliku np. `actions/auth.ts`.
   - Zdefiniowanie asynchronicznej funkcji `loginUser` przyjmującej dane zgodne z `LoginFormValues`.
   - Dodanie logiki wywołania API `POST /auth/login` (np. za pomocą `fetch`).
   - Implementacja obsługi odpowiedzi (sukces, błędy).
   - Ustawienie cookie HttpOnly w przypadku sukcesu.
   - Zwrócenie obiektu `ServerActionResponse`.
7. **Połączenie formularza z Server Action:**
   - W `LoginForm`, implementacja funkcji `onSubmit`, która wywołuje `loginUser`.
   - Dodanie obsługi stanu ładowania (`isLoading`) i błędów serwera (`serverError`).
   - Wykorzystanie `useToast` do pokazywania powiadomień.
   - Implementacja przekierowania (`useRouter`) po pomyślnym zalogowaniu.
8. **Styling:** Dostosowanie wyglądu za pomocą Tailwind CSS, jeśli standardowe style `shadcn/ui` są niewystarczające.
9. **Testowanie:** Przetestowanie przepływu logowania, walidacji po stronie klienta, obsługi błędów API i przekierowania. 