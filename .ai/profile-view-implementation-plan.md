# Plan implementacji widoku Profil Użytkownika (`/profile`)

## 1. Przegląd
Widok Profilu Użytkownika umożliwia zalogowanemu użytkownikowi przeglądanie swoich danych (email, opcjonalnie imię i nazwisko) oraz ich aktualizację. Dodatkowo, widok zawiera oddzielny formularz do zmiany hasła, wymagający podania aktualnego hasła.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/profile` w ramach chronionej części aplikacji.
- Ścieżka pliku: `app/(protected)/profile/page.tsx`
- Layout: `app/(protected)/layout.tsx`

## 3. Struktura komponentów
```
app/
└── (protected)/
    ├── layout.tsx
    └── profile/
        └── page.tsx             # Komponent strony Profilu (Server Component)
            ├── h1 ("Profil Użytkownika")
            ├── ProfileFormWrapper (Server Component)
            │   └── ProfileForm      # Komponent formularza profilu (Client Component)
            │       ├── Card
            │       │   ├── CardHeader (Tytuł: "Dane Profilu")
            │       │   ├── CardContent
            │       │   │   └── Form (react-hook-form)
            │       │   │       ├── FormField (email) -> Input (readOnly)
            │       │   │       ├── FormField (firstName) -> Input
            │       │   │       └── FormField (lastName) -> Input
            │       │   └── CardFooter
            │       │       └── Button (type="submit", text="Zapisz Zmiany Profilu")
            │       └── Toast (dla sukcesu/błędu aktualizacji profilu)
            └── PasswordChangeFormWrapper (Server Component? - może niepotrzebny)
                └── PasswordChangeForm # Komponent formularza zmiany hasła (Client Component)
                    ├── Card
                    │   ├── CardHeader (Tytuł: "Zmień Hasło")
                    │   ├── CardContent
                    │   │   └── Form (react-hook-form)
                    │   │       ├── FormField (currentPassword) -> Input (type="password")
                    │   │       ├── FormField (newPassword) -> Input (type="password")
                    │   │       └── FormField (confirmNewPassword) -> Input (type="password")
                    │   └── CardFooter
                    │       └── Button (type="submit", text="Zmień Hasło")
                    └── Toast (dla sukcesu/błędu zmiany hasła)

// Komponenty pomocnicze:
src/components/profile/
├── ProfileFormWrapper.tsx      # (SC) Pobiera dane profilu i przekazuje do ProfileForm
├── ProfileForm.tsx             # (CC) Formularz edycji profilu + SA updateProfile
├── PasswordChangeForm.tsx      # (CC) Formularz zmiany hasła + SA changePassword
```
*Uwaga:* Rozdzielenie na `ProfileFormWrapper` i `PasswordChangeFormWrapper` może nie być konieczne, jeśli dane profilu są ładowane tylko raz w `ProfilePage`.

## 4. Szczegóły komponentów
### `ProfilePage` (`app/(protected)/profile/page.tsx`)
- **Opis:** Główny SC strony `/profile`. Może pobierać dane profilu użytkownika za pomocą Server Action i przekazywać je do `ProfileForm`. Renderuje oba formularze (`ProfileForm`, `PasswordChangeForm`).
- **Główne elementy:** `h1`, `<ProfileForm initialData={profileData} />`, `<PasswordChangeForm />`.
- **Propsy:** Brak.

### `ProfileForm` (np. `src/components/profile/ProfileForm.tsx`)
- **Opis:** CC (`'use client'`) do edycji danych profilu (imię, nazwisko; email tylko do odczytu). Używa `react-hook-form` i `zod`. Wywołuje SA `updateProfile`.
- **Główne elementy:** `Card`, `Form`, `FormField`, `Input`, `Label`, `Button`, `Toast`.
- **Interakcje:** Edycja pól `firstName`, `lastName`. Kliknięcie "Zapisz Zmiany Profilu".
- **Walidacja (`ProfileFormSchema`):**
    - `email`: Tylko do odczytu, nie walidowany do zapisu.
    - `firstName`, `lastName`: Opcjonalne, mogą być puste, ale jeśli podane, mogą mieć walidację długości (`z.string().max(...)`).
- **Typy:**
    - ViewModel: `ProfileFormSchema` (`zod`).
    - DTO: `UpdateUserProfileCommand`, `UserProfileDto` (dla danych początkowych i odpowiedzi).
- **Propsy:** `{ initialData: UserProfileDto }`.

### `PasswordChangeForm` (np. `src/components/profile/PasswordChangeForm.tsx`)
- **Opis:** CC (`'use client'`) do zmiany hasła. Używa `react-hook-form` i `zod`. Wywołuje SA `changePassword`.
- **Główne elementy:** `Card`, `Form`, `FormField`, `Input` (password), `Label`, `Button`, `Toast`.
- **Interakcje:** Wprowadzanie haseł. Kliknięcie "Zmień Hasło".
- **Walidacja (`PasswordChangeSchema`):**
    - `currentPassword`: Wymagane (`z.string().min(1, ...)`).
    - `newPassword`: Wymagane, min. 8 znaków (`z.string().min(8, ...)`).
    - `confirmNewPassword`: Wymagane (`z.string().min(1, ...)`).
    - Spójność nowych haseł: `.refine()` sprawdzający `newPassword === confirmNewPassword`.
- **Typy:**
    - ViewModel: `PasswordChangeSchema` (`zod`).
    - DTO: `ChangePasswordCommand`, `ChangePasswordResponseDto`.
- **Propsy:** Brak.

## 5. Typy
- **`UserProfileDto` (DTO - z `src/types.ts`):**
  ```typescript
  export interface UserProfileDto {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  }
  ```
- **`UpdateUserProfileCommand` (DTO - z `src/types.ts`):**
  ```typescript
  export interface UpdateUserProfileCommand {
    firstName?: string;
    lastName?: string;
    email: string; // Wymagane przez API, ale pole email w UI jest readOnly
  }
  ```
- **`UpdateUserProfileResponseDto` (DTO - Odpowiedź API, z `src/types.ts`):**
  ```typescript
  export interface UpdateUserProfileResponseDto {
    message: string;
    user: UserProfileDto;
  }
  ```
- **`ChangePasswordCommand` (DTO - z `src/types.ts`):**
  ```typescript
  export interface ChangePasswordCommand {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }
  ```
- **`ChangePasswordResponseDto` (DTO - Odpowiedź API, z `src/types.ts`):**
  ```typescript
  export interface ChangePasswordResponseDto {
    message: string;
  }
  ```
- **`ProfileFormSchema` (ViewModel, Zod Schema):**
  ```typescript
  import * as z from 'zod';
  export const ProfileFormSchema = z.object({
    email: z.string().email(), // Do wyświetlania, nie do edycji
    firstName: z.string().max(50, "Imię nie może być dłuższe niż 50 znaków.").optional(),
    lastName: z.string().max(50, "Nazwisko nie może być dłuższe niż 50 znaków.").optional(),
  });
  export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
  ```
- **`PasswordChangeSchema` (ViewModel, Zod Schema):**
  ```typescript
  import * as z from 'zod';
  export const PasswordChangeSchema = z.object({
    currentPassword: z.string().min(1, { message: "Aktualne hasło jest wymagane." }),
    newPassword: z.string().min(8, { message: "Nowe hasło musi mieć co najmniej 8 znaków." }),
    confirmNewPassword: z.string().min(1, { message: "Potwierdzenie nowego hasła jest wymagane." })
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Nowe hasła nie są zgodne.",
    path: ["confirmNewPassword"],
  });
  export type PasswordChangeValues = z.infer<typeof PasswordChangeSchema>;
  ```

## 6. Zarządzanie stanem
- **Dane profilu:** Ładowane w `ProfilePage` (SC) przez SA `getUserProfile`, przekazywane jako `initialData` do `ProfileForm`. `ProfileForm` zarządza stanem edycji przez `react-hook-form`.
- **Zmiana hasła:** Stan formularza zarządzany przez `react-hook-form` w `PasswordChangeForm`.
- **Stany ładowania/błędów:** Lokalne stany `isLoading`, `error` (`useState`) w każdym z formularzy (`ProfileForm`, `PasswordChangeForm`) do obsługi wywołań SA.

## 7. Integracja API
- **Pobieranie profilu:**
  - **Server Action:** `getUserProfile` (w `actions/auth.ts`).
  - **Logika:** Wywołuje `GET /auth/profile`. Zwraca `UserProfileDto` lub `null`/błąd.
- **Aktualizacja profilu:**
  - **Server Action:** `updateProfile` (w `actions/auth.ts`).
  - **Logika:** Przyjmuje `ProfileFormValues`. Wywołuje `PUT /auth/profile` z `UpdateUserProfileCommand`. Zwraca `{ success: boolean, data?: UserProfileDto, error?: string }`.
- **Zmiana hasła:**
  - **Server Action:** `changePassword` (w `actions/auth.ts`).
  - **Logika:** Przyjmuje `PasswordChangeValues`. Wywołuje `PUT /auth/change-password` z `ChangePasswordCommand`. Zwraca `{ success: boolean, error?: string }`.

## 8. Interakcje użytkownika
- **Edycja profilu:** Wprowadzanie danych w `ProfileForm` -> Klik "Zapisz Zmiany Profilu" -> Wywołanie SA `updateProfile` -> Obsługa odpowiedzi (`Toast` sukcesu/błędu).
- **Zmiana hasła:** Wprowadzanie danych w `PasswordChangeForm` -> Klik "Zmień Hasło" -> Wywołanie SA `changePassword` -> Obsługa odpowiedzi (`Toast` sukcesu/błędu, reset formularza po sukcesie).

## 9. Warunki i walidacja
- **Profil:** `firstName`, `lastName` opcjonalne, walidacja długości (klient `zod`).
- **Zmiana hasła:** Wszystkie pola wymagane, `newPassword` min. 8 znaków, `newPassword` musi być zgodne z `confirmNewPassword` (klient `zod`). API dodatkowo waliduje `currentPassword`.
- **Warunki API (`PUT /auth/profile`):**
    - 400 (Validation errors): `Toast` błędu w `ProfileForm`.
    - 401 (Unauthorized): Nie powinno wystąpić.
- **Warunki API (`PUT /auth/change-password`):**
    - 400 (Validation errors, np. niezgodne nowe hasła po stronie serwera, złe aktualne hasło): `Toast` błędu w `PasswordChangeForm` (np. "Nieprawidłowe aktualne hasło.", "Hasła nie są zgodne.").
    - 401 (Unauthorized): Nie powinno wystąpić.

## 10. Obsługa błędów
- **Błędy walidacji klienta:** Obsługiwane przez `react-hook-form` i `zod`, wyświetlane pod polami.
- **Błędy API:** Obsługiwane w odpowiednich formularzach (`ProfileForm`, `PasswordChangeForm`) przez `Toast`.
- **Stany ładowania:** Przyciski "Zapisz Zmiany Profilu" i "Zmień Hasło" deaktywowane / ze wskaźnikiem ładowania podczas wywołań SA.

## 11. Kroki implementacji
1. Utwórz plik strony `app/(protected)/profile/page.tsx` oraz komponenty `ProfileForm` i `PasswordChangeForm`.
2. Zaimplementuj Server Action `getUserProfile`, `updateProfile`, `changePassword` w `actions/auth.ts`.
3. W `ProfilePage` (SC), pobierz dane profilu użwając `getUserProfile`.
4. Zaimplementuj `ProfileForm` (CC):
   - Przyjmij `initialData`.
   - Użyj `useForm` z `ProfileFormSchema`.
   - Zbuduj formularz (pola `firstName`, `lastName`, `email` readOnly).
   - Zaimplementuj `onSubmit` wywołujące SA `updateProfile`, obsłuż stany ładowania/błędu, `useToast`.
5. Zaimplementuj `PasswordChangeForm` (CC):
   - Użyj `useForm` z `PasswordChangeSchema`.
   - Zbuduj formularz (`currentPassword`, `newPassword`, `confirmNewPassword`).
   - Zaimplementuj `onSubmit` wywołujące SA `changePassword`, obsłuż stany ładowania/błędu, `useToast`, reset formularza po sukcesie.
6. Renderuj oba formularze w `ProfilePage`.
7. Stylizuj komponenty.
8. Testuj: ładowanie danych profilu, edycję profilu (sukces, błąd), zmianę hasła (sukces, błąd walidacji, złe aktualne hasło). 