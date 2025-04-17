# Architektura UI dla Raport Generator AI

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji Raport Generator AI opiera się na frameworku Next.js z wykorzystaniem App Routera. Głównym celem jest zapewnienie intuicyjnego, responsywnego i dostępnego interfejsu do generowania, edycji i zarządzania raportami tworzonymi przez AI.

Struktura opiera się na podziale na widoki publiczne (logowanie, rejestracja, reset hasła) i chronione (dostępne po zalogowaniu: dashboard, generowanie/edycja raportów, profil). Do komunikacji z backendem wykorzystywane są głównie Server Actions, co minimalizuje potrzebę zarządzania stanem po stronie klienta. Stan globalny ogranicza się do informacji o autoryzacji (Zustand), podczas gdy formularze obsługiwane są przez `react-hook-form` z walidacją `zod`, a edycja treści raportów przez edytor Lexical opakowany w dedykowany komponent `RichTextEditor`. Stylizacja realizowana jest za pomocą Tailwind CSS i biblioteki komponentów `shadcn/ui`. Nacisk kładziony jest na rewalidację danych po stronie serwera (`revalidatePath`/`revalidateTag`) w celu utrzymania spójności danych w UI.

## 2. Lista widoków

### Widok 1: Logowanie
-   **Nazwa widoku:** Logowanie
-   **Ścieżka widoku:** `/login`
-   **Główny cel:** Uwierzytelnienie istniejącego użytkownika.
-   **Kluczowe informacje do wyświetlenia:** Formularz logowania.
-   **Kluczowe komponenty widoku:** `AuthForm` (z polami email, hasło), `Button` (Zaloguj się), Linki do `/register` i `/reset-password`.
-   **UX, dostępność i względy bezpieczeństwa:** Czytelne etykiety, walidacja pól, obsługa błędów (Toast), linki nawigacyjne. Poprawne użycie `label`, `aria-invalid`. Walidacja po obu stronach.

### Widok 2: Rejestracja
-   **Nazwa widoku:** Rejestracja
-   **Ścieżka widoku:** `/register`
-   **Główny cel:** Utworzenie nowego konta użytkownika.
-   **Kluczowe informacje do wyświetlenia:** Formularz rejestracji.
-   **Kluczowe komponenty widoku:** `AuthForm` (z polami email, hasło, potwierdź hasło), `Button` (Zarejestruj się), Link do `/login`.
-   **UX, dostępność i względy bezpieczeństwa:** Jasne wymagania dotyczące hasła, walidacja pól, obsługa błędów (np. email zajęty - Toast). Poprawne użycie `label`, `aria-invalid`. Walidacja po obu stronach.

### Widok 3: Reset Hasła (Inicjacja)
-   **Nazwa widoku:** Reset Hasła - Inicjacja
-   **Ścieżka widoku:** `/reset-password`
-   **Główny cel:** Rozpoczęcie procesu odzyskiwania hasła przez wysłanie linku na email.
-   **Kluczowe informacje do wyświetlenia:** Formularz do podania adresu email.
-   **Kluczowe komponenty widoku:** Formularz (pole email), `Button` (Wyślij Link Resetujący), Link do `/login`.
-   **UX, dostępność i względy bezpieczeństwa:** Informacja o wysłaniu linku (Toast). Poprawne użycie `label`.

### Widok 4: Reset Hasła (Ustawienie Nowego)
-   **Nazwa widoku:** Reset Hasła - Ustawienie Nowego
-   **Ścieżka widoku:** `/reset-password/[token]` (Token dynamiczny w URL)
-   **Główny cel:** Umożliwienie użytkownikowi ustawienia nowego hasła po kliknięciu w link resetujący.
-   **Kluczowe informacje do wyświetlenia:** Formularz do ustawienia nowego hasła.
-   **Kluczowe komponenty widoku:** Formularz (pole nowe hasło, potwierdź nowe hasło), `Button` (Ustaw Nowe Hasło).
-   **UX, dostępność i względy bezpieczeństwa:** Jasne wymagania dotyczące hasła, walidacja pól, informacja o sukcesie/błędzie (Toast). Poprawne użycie `label`, `aria-invalid`.

### Widok 5: Dashboard / Lista Raportów
-   **Nazwa widoku:** Dashboard / Lista Raportów
-   **Ścieżka widoku:** `/reports` (lub `/dashboard` jako alias)
-   **Główny cel:** Wyświetlenie listy raportów użytkownika, umożliwienie zarządzania nimi (edycja, usuwanie) i nawigacji do generowania nowego raportu.
-   **Kluczowe informacje do wyświetlenia:** Lista raportów (tytuł, data utworzenia), kontrolki filtrowania/sortowania, paginacja.
-   **Kluczowe komponenty widoku:** `Button` (Generuj Nowy Raport), `Input` (Filtr po tytule), `ReportList` (wykorzystujący `Table` na desktop, `ReportCard` na mobile), Akcje dla raportu (`Button`/Ikony: Edytuj, Usuń), `Pagination`, `LoadingIndicator`, Komunikat o braku raportów.
-   **UX, dostępność i względy bezpieczeństwa:** Responsywność (tabela/karty), czytelne akcje (tooltipy), obsługa stanu ładowania i pustego stanu. Semantyka tabeli/kart, dostępność kontrolek. Dane filtrowane po `userId`.

### Widok 6: Generowanie Raportu
-   **Nazwa widoku:** Generowanie Raportu
-   **Ścieżka widoku:** `/reports/generate`
-   **Główny cel:** Wprowadzenie tekstu źródłowego, wygenerowanie raportu AI, wyświetlenie wyniku oraz umożliwienie edycji i zapisu.
-   **Kluczowe informacje do wyświetlenia:** Pole na tekst źródłowy, wygenerowane sekcje raportu (streszczenie, wnioski, kluczowe dane), pole na tytuł raportu.
-   **Kluczowe komponenty widoku:** `Textarea` (Tekst źródłowy), `Button` (Generuj Raport), `LoadingIndicator`, `Input` (Tytuł raportu), `RichTextEditor` (do wyświetlania/edycji wygenerowanej treści), `Button` (Zapisz Raport).
-   **UX, dostępność i względy bezpieczeństwa:** Informacja o minimalnej długości tekstu, wyraźny wskaźnik ładowania, możliwość edycji przed zapisem, obsługa błędów generowania (Toast). Dostępność `Textarea` i `RichTextEditor`. Sanityzacja danych z edytora w Server Action.

### Widok 7: Szczegóły / Edycja Raportu
-   **Nazwa widoku:** Szczegóły / Edycja Raportu
-   **Ścieżka widoku:** `/reports/[id]` (ID raportu dynamiczne w URL)
-   **Główny cel:** Wyświetlenie pełnej treści zapisanego raportu oraz umożliwienie jego edycji i zapisu zmian lub usunięcia.
-   **Kluczowe informacje do wyświetlenia:** Tytuł raportu, treść raportu (streszczenie, wnioski, kluczowe dane), data utworzenia/modyfikacji.
-   **Kluczowe komponenty widoku:** `Input` (Tytuł raportu - edytowalny), `RichTextEditor` (z załadowaną treścią raportu), `Button` (Zapisz Zmiany), `Button` (Usuń Raport - z `ConfirmationDialog`), Informacje meta (daty).
-   **UX, dostępność i względy bezpieczeństwa:** Jasne rozróżnienie trybu podglądu i edycji (choć tu jest to połączone), potwierdzenie usunięcia. Dostępność edytora i kontrolek. Sanityzacja w Server Action przy zapisie.

### Widok 8: Profil Użytkownika
-   **Nazwa widoku:** Profil Użytkownika
-   **Ścieżka widoku:** `/profile`
-   **Główny cel:** Umożliwienie użytkownikowi przeglądania i edycji danych profilowych oraz zmiany hasła.
-   **Kluczowe informacje do wyświetlenia:** Dane profilu (email, imię, nazwisko), formularz zmiany hasła.
-   **Kluczowe komponenty widoku:** `ProfileForm` (pola: email - tylko do odczytu?, imię, nazwisko), `Button` (Zapisz Zmiany Profilu), `PasswordChangeForm` (pola: aktualne hasło, nowe hasło, potwierdź nowe hasło), `Button` (Zmień Hasło).
-   **UX, dostępność i względy bezpieczeństwa:** Rozdzielenie edycji profilu i zmiany hasła, walidacja pól, komunikaty o sukcesie/błędzie (Toast). Dostępność formularzy.

## 3. Mapa podróży użytkownika

Podstawowe przepływy użytkownika obejmują:

1.  **Rejestracja/Logowanie:** `/login` -> `/register` -> Wypełnienie formularza -> (Sukces) -> `/login` -> Wypełnienie formularza -> (Sukces) -> `/reports`.
2.  **Reset Hasła:** `/login` -> `/reset-password` -> Wpisanie emaila -> (Email wysłany) -> Sprawdzenie emaila -> Kliknięcie linku -> `/reset-password/[token]` -> Ustawienie nowego hasła -> (Sukces) -> `/login`.
3.  **Generowanie Raportu:** `/reports` -> Kliknięcie "Generuj Nowy Raport" -> `/reports/generate` -> Wklejenie tekstu -> Kliknięcie "Generuj Raport" -> (Ładowanie) -> Wyświetlenie wyniku w edytorze -> Wpisanie tytułu -> (Opcjonalna edycja treści) -> Kliknięcie "Zapisz Raport" -> (Sukces) -> Przekierowanie na `/reports`.
4.  **Przeglądanie i Edycja:** `/reports` -> Kliknięcie "Edytuj" przy raporcie -> `/reports/[id]` -> (Edycja tytułu/treści) -> Kliknięcie "Zapisz Zmiany" -> (Sukces) -> Pozostanie na `/reports/[id]` lub przekierowanie na `/reports`.
5.  **Usuwanie Raportu:**
    *   Z `/reports`: Kliknięcie "Usuń" -> `ConfirmationDialog` -> Potwierdzenie -> (Sukces) -> Raport znika z listy.
    *   Z `/reports/[id]`: Kliknięcie "Usuń Raport" -> `ConfirmationDialog` -> Potwierdzenie -> (Sukces) -> Przekierowanie na `/reports`.
6.  **Zarządzanie Profilem:** Nawigacja -> `/profile` -> Edycja danych/zmiana hasła -> Kliknięcie "Zapisz"/"Zmień Hasło" -> (Sukces/Błąd Toast).
7.  **Wylogowanie:** Nawigacja -> Kliknięcie "Wyloguj" -> Przekierowanie na `/login`.

## 4. Układ i struktura nawigacji

-   **Globalny Layout (`app/layout.tsx`):** Podstawowa struktura HTML, ładowanie czcionek, dostawca motywu (jeśli dotyczy), `Toaster`. Może zawierać globalną stopkę.
-   **Layout Publiczny (`app/(auth)/layout.tsx` - opcjonalny):** Wspólny layout dla stron `/login`, `/register`, `/reset-password`, np. wyśrodkowany kontener na formularz.
-   **Layout Chroniony (`app/(protected)/layout.tsx`):** Zawiera główną nawigację aplikacji dla zalogowanych użytkowników oraz logikę ochrony tras (sprawdzenie sesji/tokenu i przekierowanie do `/login` w razie braku).
    -   **Nawigacja Główna (w Layout Chroniony):**
        -   Logo/Nazwa Aplikacji (link do `/reports`)
        -   Link "Raporty" (`/reports`)
        -   Link "Profil" (`/profile`)
        -   Przycisk "Wyloguj"
-   **Nawigacja w Widokach:** Przyciski akcji (np. "Generuj", "Zapisz"), linki powrotu lub breadcrumbs (np. z `/reports/[id]` do `/reports`).

## 5. Kluczowe komponenty

Poniżej lista reużywalnych komponentów UI, bazujących głównie na `shadcn/ui` lub jako komponenty niestandardowe:

-   **`AuthForm`:** Komponent formularza do logowania i rejestracji (adaptowalny).
-   **`ProfileForm`:** Formularz do edycji danych profilu.
-   **`PasswordChangeForm`:** Formularz do zmiany hasła.
-   **`RichTextEditor`:** Komponent opakowujący edytor Lexical, z podstawowymi opcjami formatowania i metodą do pobierania/ustawiania treści (np. HTML).
-   **`ReportList`:** Komponent wyświetlający listę raportów, responsywnie zmieniający widok (Tabela/Karty).
-   **`ReportTable`:** Implementacja tabelarycznego widoku listy raportów (`shadcn/ui Table`).
-   **`ReportCard`:** Implementacja widoku karty dla pojedynczego raportu na mniejszych ekranach (`shadcn/ui Card`).
-   **`Pagination`:** Komponent paginacji (`shadcn/ui Pagination`).
-   **`Button`:** Przycisk (`shadcn/ui Button`) z różnymi wariantami.
-   **`Input`:** Pole wprowadzania (`shadcn/ui Input`).
-   **`Textarea`:** Pole tekstowe (`shadcn/ui Textarea`).
-   **`Toast`:** Komponent powiadomień (`shadcn/ui Toast`).
-   **`ConfirmationDialog`:** Modal potwierdzający akcję (`shadcn/ui AlertDialog`).
-   **`LoadingIndicator` / `Spinner`:** Wskaźnik ładowania.
-   **`Navbar`:** Komponent nawigacji głównej.
-   **`ErrorBoundary`:** Globalny komponent do łapania błędów renderowania. 