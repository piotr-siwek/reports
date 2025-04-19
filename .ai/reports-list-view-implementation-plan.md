# Plan implementacji widoku Dashboard / Lista Raportów (`/reports`)

## 1. Przegląd
Widok Dashboardu / Listy Raportów jest głównym ekranem aplikacji po zalogowaniu. Wyświetla listę raportów utworzonych przez użytkownika, umożliwiając ich przeglądanie (nawigację do szczegółów/edycji), usuwanie oraz inicjowanie generowania nowego raportu. Widok powinien obsługiwać filtrowanie po tytule, sortowanie (domyślnie po dacie utworzenia malejąco) oraz paginację.

## 2. Routing widoku
Widok będzie dostępny pod główną chronioną ścieżką: `/reports`. Może istnieć alias `/dashboard` przekierowujący do `/reports`.
- Ścieżka pliku: `app/(protected)/reports/page.tsx` (zakładając, że `/` przekierowuje do `/reports` lub jest layoutem chronionym)
- Layout: `app/(protected)/layout.tsx` (zawiera nawigację i ochronę trasy)

## 3. Struktura komponentów
```
src/app/
└── (protected)/                   # Layout dla zalogowanych użytkowników
    ├── layout.tsx               # Navbar, logika ochrony trasy
    └── reports/
        └── page.tsx             # Komponent strony Listy Raportów (Server Component)
            ├── div (Header)
            │   ├── h1 ("Twoje Raporty")
            │   └── Button (Link do /reports/generate, "Generuj Nowy Raport")
            ├── div (Controls)
            │   └── ReportFilterInput (Client Component)
            │   // Sortowanie może być dodane później
            └── ReportListWrapper (Server Component z Suspense)
                ├── LoadingIndicator (Skeleton dla tabeli/kart)
                ├── div (Komunikat o braku raportów)
                └── ReportList (Komponent renderujący listę)
                    ├── ReportTable (shadcn/ui Table, widok desktop)
                    │   ├── TableHeader (Tytuł, Data Utworzenia, Akcje)
                    │   └── TableBody
                    │       └── ReportTableRow (mapowanie raportów)
                    │           ├── TableCell (Tytuł)
                    │           ├── TableCell (Data)
                    │           └── TableCell (Akcje: Button Edytuj, Button Usuń)
                    └── div (Widok mobile - alternatywa dla tabeli)
                        └── ReportCard (mapowanie raportów)
                            ├── CardHeader (Tytuł)
                            ├── CardContent (Data)
                            └── CardFooter (Akcje: Button Edytuj, Button Usuń)
            └── Pagination (Client Component)

// Komponenty pomocnicze:
src/components/reports/
├── ReportListWrapper.tsx         # (SC) Pobiera dane, zarządza Suspense, stanem pustym, renderuje ReportList
├── ReportList.tsx                # (CC?) Renderuje ReportTable lub ReportCard (responsywność)
├── ReportTable.tsx               # Implementacja tabeli z shadcn/ui
├── ReportTableRow.tsx            # Wiersz tabeli z akcjami
├── ReportCard.tsx                # Karta raportu dla widoku mobilnego
├── ReportDeleteButton.tsx        # (CC) Przycisk usuwania z ConfirmationDialog + Server Action
├── ReportFilterInput.tsx         # (CC) Input do filtrowania, aktualizuje URL
└── ReportsPagination.tsx         # (CC) Komponent paginacji, aktualizuje URL
```

## 4. Szczegóły komponentów
### `ReportsPage` (`src/app/(protected)/reports/page.tsx`)
- **Opis:** Główny SC strony `/reports`. Odczytuje `searchParams` i przekazuje je do `ReportListWrapper` oraz `ReportsPagination`. Renderuje strukturę strony.
- **Główne elementy:** Nagłówek, `Button` "Generuj Nowy Raport", `ReportFilterInput`, `Suspense` wokół `ReportListWrapper`, `ReportsPagination`.
- **Propsy:** `{ searchParams?: { page?: string; filter?: string; sort?: string; limit?: string; } }`

### `ReportFilterInput` (`src/components/reports/ReportFilterInput.tsx`)
- **Opis:** CC (`'use client'`) z polem `Input`. Używa `useRouter`, `usePathname`, `useSearchParams` do aktualizacji parametru `filter` w URL (z debounce).
- **Główne elementy:** `Input` (shadcn/ui).
- **Interakcje:** Wprowadzanie tekstu.
- **Propsy:** `initialFilterValue?: string`.

### `ReportListWrapper` (`src/components/reports/ReportListWrapper.tsx`)
- **Opis:** SC (`async`) pobierający dane raportów za pomocą Server Action `listReports` na podstawie propsów (`page`, `limit`, `filter`, `sort`). Obsługuje stan pusty. Renderuje `ReportList`.
- **Główne elementy:** Sprawdzenie `reports.length === 0` -> Komunikat "Brak raportów", w przeciwnym razie `<ReportList reports={reports} />`.
- **Propsy:** `{ page: number; limit: number; filter?: string; sort?: string; }`.
- **Typy:** `ListReportsResponseDto` (z Server Action).

### `ReportList` (`src/components/reports/ReportList.tsx`)
- **Opis:** Komponent (może być CC dla logiki responsywnej lub prosty SC/FC) renderujący `ReportTable` (desktop) lub `ReportCard` (mobile) na podstawie danych.
- **Główne elementy:** Logika CSS/Tailwind (`hidden md:block` itp.) do przełączania widoku. Mapowanie `reports` i renderowanie `ReportTableRow` lub `ReportCard`.
- **Propsy:** `{ reports: ReportSummaryDto[] }`.

### `ReportTable` / `ReportTableRow` (`src/components/reports/ReportTable.tsx`)
- **Opis:** Implementacja tabeli (`shadcn/ui`) i jej wierszy.
- **Główne elementy:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`. `ReportTableRow` zawiera `Link` do edycji (`/reports/[id]`) i `ReportDeleteButton`.
- **Propsy:** `ReportTableRow` przyjmuje `{ report: ReportSummaryDto }`.

### `ReportCard` (`src/components/reports/ReportCard.tsx`)
- **Opis:** Karta (`shadcn/ui Card`) dla raportu na mobile.
- **Główne elementy:** `Card`, `CardHeader`, `CardTitle`, `CardContent` (np. data), `CardFooter` z `Link` do edycji i `ReportDeleteButton`.
- **Propsy:** `{ report: ReportSummaryDto }`.

### `ReportDeleteButton` (`src/components/reports/ReportDeleteButton.tsx`)
- **Opis:** CC (`'use client'`) z przyciskiem "Usuń" i `AlertDialog`. Wywołuje Server Action `deleteReport` i odświeża widok.
- **Główne elementy:** `Button`, `AlertDialog`...
- **Interakcje:** Otwarcie dialogu, Anuluj, Potwierdź (wywołuje SA `deleteReport`).
- **Propsy:** `{ reportId: number; }`.
- **Logika:** W `handleConfirm`: wywołanie SA, obsługa `isLoading`, `useToast` dla sukcesu/błędu, `router.refresh()` przy sukcesie.

### `ReportsPagination` (`src/components/reports/ReportsPagination.tsx`)
- **Opis:** CC (`'use client'`) renderujący paginację (`shadcn/ui`). Aktualizuje parametr `page` w URL.
- **Główne elementy:** Komponenty `Pagination` z `shadcn/ui`.
- **Interakcje:** Kliknięcie numeru/strzałek.
- **Propsy:** `{ page: number; limit: number; total: number; }` (z `pagination` DTO).
- **Logika:** Oblicza `totalPages`. Tworzy linki (`href`) z nowym `page` param przy użyciu `usePathname`, `useSearchParams`.

## 5. Typy
- **`ReportSummaryDto`, `PaginationDto`, `ListReportsResponseDto`, `DeleteReportResponseDto`:** Z `src/types.ts`.
- **`ReportsPageProps` (ViewModel):** Jak w sekcji 4.

## 6. Zarządzanie stanem
- **Dane raportów:** Ładowane w SC `ReportListWrapper` przez Server Action.
- **Filtr:** Stan w `ReportFilterInput`, synchronizowany z URL `searchParams`.
- **Paginacja:** Stan w `ReportsPagination`, synchronizowany z URL `searchParams`.
- **Ładowanie danych:** Obsługiwane przez `Suspense` w `ReportsPage` wokół `ReportListWrapper`.
- **Ładowanie usuwania:** Stan `isLoading` w `ReportDeleteButton`.
- **Odświeżanie listy:** Wywołanie `router.refresh()` w `ReportDeleteButton` po udanym usunięciu.

## 7. Integracja API
- **Pobieranie listy:** Server Action `listReports` wywołuje `GET /reports` z parametrami `page`, `limit`, `filter`, `sort`. Zwraca `ListReportsResponseDto`.
- **Usuwanie raportu:** Server Action `deleteReport` wywołuje `DELETE /reports/{id}`. Zwraca `{ success: boolean, error?: string }`.

## 8. Interakcje użytkownika
- **Filtrowanie:** Wpisanie tekstu -> (debounce) -> aktualizacja URL `filter` -> `ReportsPage` re-renderuje -> `ReportListWrapper` pobiera nowe dane.
- **Paginacja:** Kliknięcie strony/strzałki -> aktualizacja URL `page` -> `ReportsPage` re-renderuje -> `ReportListWrapper` pobiera nowe dane.
- **Generuj Nowy:** Klik -> nawigacja `/reports/generate`.
- **Edytuj:** Klik -> nawigacja `/reports/[id]`.
- **Usuń:** Klik -> Otwórz Dialog -> Potwierdź -> Wywołaj SA -> (Sukces) -> Odśwież (`router.refresh()`), Toast -> (Błąd) -> Toast.

## 9. Warunki i walidacja
- **Parametry URL:** Parsowanie i podstawowa walidacja (np. czy `page` jest liczbą) w `ReportsPage` przed przekazaniem do `ReportListWrapper`.
- **Brak raportów:** Komunikat w `ReportListWrapper`.
- **Błędy API:** Obsługa w Server Actions i przekazanie do komponentów (np. `ReportDeleteButton` dla usuwania, `ReportListWrapper` może potencjalnie obsłużyć błąd ładowania listy przez wyświetlenie komunikatu błędu).

## 10. Obsługa błędów
- **Błąd ładowania listy:** `ReportListWrapper` (jeśli SC i napotka błąd w SA) może rzucić błąd (obsługiwany przez `error.tsx` Next.js) lub (jeśli CC) wyświetlić komunikat błędu.
- **Błąd usuwania:** Obsługa w `ReportDeleteButton` przez `Toast`.
- **Stan ładowania (lista):** `Suspense` + `LoadingIndicator`/Skeleton.
- **Stan ładowania (usuwanie):** W `ReportDeleteButton`.

## 11. Kroki implementacji
1. Utwórz pliki strony i komponentów.
2. Zaimplementuj Server Action `listReports` i `deleteReport`.
3. Zaimplementuj SC `ReportsPage` (odczyt `searchParams`, renderowanie struktury, `Suspense`).
4. Zaimplementuj CC `ReportFilterInput` (input, debounce, aktualizacja URL).
5. Zaimplementuj SC `ReportListWrapper` (wywołanie `listReports`, obsługa stanu pustego, renderowanie `ReportList`).
6. Zaimplementuj `ReportList` (responsywne renderowanie `ReportTable` / `ReportCard`).
7. Zaimplementuj `ReportTable` / `ReportTableRow` (tabela `shadcn`, linki, `ReportDeleteButton`).
8. Zaimplementuj `ReportCard` (karta `shadcn`, linki, `ReportDeleteButton`).
9. Zaimplementuj CC `ReportDeleteButton` (przycisk, `AlertDialog`, wywołanie SA, `router.refresh()`, `useToast`).
10. Zaimplementuj CC `ReportsPagination` (komponent `shadcn`, obliczanie stron, aktualizacja URL).
11. Dodaj komponent ładowania (Skeleton/Spinner) używany przez `Suspense`.
12. Stylizuj i przetestuj (ładowanie, filtrowanie, paginacja, usuwanie, responsywność, stany puste/błędu). 