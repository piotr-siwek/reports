# Plan implementacji widoku Generowanie Raportu (`/reports/generate`)

## 1. Przegląd
Widok Generowania Raportu pozwala użytkownikowi wprowadzić tekst źródłowy, zainicjować proces generowania raportu przez AI (za pomocą API), a następnie przejrzeć, edytować (tytuł i treść) oraz zapisać wygenerowany raport. Widok powinien obsługiwać stan ładowania podczas generowania i zapisywania.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/reports/generate` w ramach chronionej części aplikacji.
- Ścieżka pliku: `app/(protected)/reports/generate/page.tsx`
- Layout: `app/(protected)/layout.tsx`

## 3. Struktura komponentów
```
app/
└── (protected)/
    ├── layout.tsx
    └── reports/
        └── generate/
            └── page.tsx         # Komponent strony Generowania Raportu (Client Component)
                ├── h1 ("Generuj Nowy Raport")
                ├── Form (react-hook-form / shadcn)
                │   ├── FormField (sourceText)
                │   │   ├── Label ("Tekst źródłowy")
                │   │   ├── Textarea (shadcn)
                │   │   └── FormDescription ("Minimalna długość: 100 znaków")
                │   ├── Button (type="button", onClick={handleGenerate}, disabled={isLoading || !isSourceTextValid}, text="Generuj Raport")
                │   └── LoadingIndicator (wyświetlany warunkowo podczas generowania)
                ├── div (Sekcja Wyników - wyświetlana po wygenerowaniu)
                │   ├── h2 ("Wygenerowany Raport")
                │   ├── FormField (title)
                │   │   ├── Label ("Tytuł raportu")
                │   │   └── Input (shadcn)
                │   ├── RichTextEditor (wyświetla/edytuje summary, conclusions, keyData)
                │   │   // Komponent opakowujący Lexical lub podobny edytor
                │   │   // Powinien pozwalać na edycję poszczególnych sekcji
                │   ├── Button (type="button", onClick={handleSave}, disabled={isSaving}, text="Zapisz Raport")
                │   └── LoadingIndicator (wyświetlany warunkowo podczas zapisywania)
                └── Toast (shadcn, do pokazywania błędów i sukcesów)

// Komponenty pomocnicze:
src/components/reports/
├── GenerateReportForm.tsx        # Główny komponent CC dla strony /generate
├── RichTextEditor.tsx            # Komponent edytora (Lexical wrapper?)
└── LoadingIndicator.tsx          # Prosty spinner/wskaźnik ładowania
```
*Uwaga:* Struktura uproszczona. `GenerateReportForm` będzie głównym komponentem Client Component (`'use client'`) dla tej strony, zarządzającym całym stanem i interakcjami.

## 4. Szczegóły komponentów
### `GenerateReportPage` (`app/(protected)/reports/generate/page.tsx`)
- **Opis:** Server Component renderujący główny Client Component formularza.
- **Główne elementy:** Renderuje `<GenerateReportForm />`.
- **Propsy:** Brak.

### `GenerateReportForm` (np. `src/components/reports/GenerateReportForm.tsx`)
- **Opis:** Główny Client Component (`'use client'`) dla widoku `/reports/generate`. Zarządza stanem formularza (tekst źródłowy, tytuł, wygenerowana treść), stanami ładowania (generowanie, zapis), walidacją i wywołaniami Server Actions (`generateReportPreview`, `saveReport`).
- **Główne elementy:** `Form`, `FormField`, `Label`, `Textarea`, `Input`, `Button`, `LoadingIndicator`, `RichTextEditor`, `Toast`.
- **Obsługiwane interakcje:**
    - Wprowadzanie tekstu źródłowego (`sourceText`).
    - Kliknięcie "Generuj Raport".
    - Wprowadzanie tytułu (`title`) po wygenerowaniu.
    - Edycja treści w `RichTextEditor` po wygenerowaniu.
    - Kliknięcie "Zapisz Raport".
- **Obsługiwana walidacja:**
    - **Tekst źródłowy:** Minimalna długość 100 znaków (walidacja `zod` lub prosta w komponencie przed wywołaniem SA `generateReportPreview`).
    - **Tytuł:** Wymagany przed zapisaniem (walidacja `zod` lub prosta w komponencie przed wywołaniem SA `saveReport`).
    - **Treść z RichTextEditor:** Może wymagać walidacji (np. czy nie jest pusta) przed zapisaniem.
- **Typy:**
    - ViewModel (częściowe): `{ sourceText: string; title: string; generatedContent: ReportPreviewDto | null }`.
    - DTO (wejściowe): `GenerateReportCommand`, `CreateReportCommand`.
    - DTO (wyjściowe): `ReportPreviewDto`, `CreateReportResponseDto`.
- **Propsy:** Brak.

### `RichTextEditor` (np. `src/components/ui/RichTextEditor.tsx`)
- **Opis:** Komponent opakowujący edytor tekstu (np. Lexical). Powinien przyjmować początkową treść (np. jako obiekt z polami `summary`, `conclusions`, `keyData` lub jako jeden blok HTML/JSON) i udostępniać metodę/stan do pobrania aktualnej treści w odpowiednim formacie do zapisu.
- **Główne elementy:** Zależne od implementacji edytora (np. obszar edycji, pasek narzędzi).
- **Obsługiwane interakcje:** Edycja tekstu, formatowanie.
- **Obsługiwana walidacja:** Brak (ewentualnie wewnętrzna edytora).
- **Typy:** Zależne od implementacji (np. `SerializedLexicalNode[]`, HTML string).
- **Propsy:** `{ initialContent: ReportPreviewDto | null; onChange: (content: /* Format edytora */) => void; readOnly?: boolean }`.

## 5. Typy
- **`GenerateReportCommand` (DTO - z `src/types.ts`):**
  ```typescript
  export interface GenerateReportCommand {
    originalText: string;
  }
  ```
- **`ReportPreviewDto` (DTO - Odpowiedź API, z `src/types.ts`):**
  ```typescript
  export interface ReportPreviewDto {
    originalText: string; // Zachowujemy dla CreateReportCommand
    summary: string;
    conclusions: string;
    keyData: string;
  }
  ```
- **`CreateReportCommand` (DTO - z `src/types.ts`):**
  ```typescript
  export interface CreateReportCommand {
    title: string;
    originalText: string; // Z ReportPreviewDto
    summary: string;      // Z RichTextEditor
    conclusions: string;  // Z RichTextEditor
    keyData: string;      // Z RichTextEditor
  }
  ```
- **`CreateReportResponseDto` (DTO - Odpowiedź API, z `src/types.ts`):**
  ```typescript
  export interface CreateReportResponseDto {
    message: string;
    report: ReportDto; // Pełny obiekt zapisanego raportu
  }
  ```
- **ViewModel/Stan komponentu `GenerateReportForm`:**
  ```typescript
  interface GenerateReportFormState {
    sourceText: string;
    isGenerating: boolean;
    generateError: string | null;
    generatedContent: ReportPreviewDto | null;
    title: string;
    editorContent: any; // Typ zależny od RichTextEditor
    isSaving: boolean;
    saveError: string | null;
  }
  ```

## 6. Zarządzanie stanem
- **Stan formularza:** Zarządzany głównie przez lokalny stan (`useState`) w `GenerateReportForm` (dla `sourceText`, `title`, `generatedContent`, `editorContent`). `react-hook-form` może być użyty, ale dla tak dynamicznego formularza prostszy `useState` może być wystarczający.
- **Stan ładowania generowania:** `isGenerating` (`useState`) w `GenerateReportForm`.
- **Stan ładowania zapisywania:** `isSaving` (`useState`) w `GenerateReportForm`.
- **Błędy (generowanie, zapis):** `generateError`, `saveError` (`useState`) w `GenerateReportForm`.
- **Treść edytora:** Stan zarządzany wewnętrznie przez `RichTextEditor`, ale przekazywany do `GenerateReportForm` przez `onChange` prop.
- **Custom Hooks:** Brak specyficznych.

## 7. Integracja API
- **Generowanie podglądu:**
  - **Server Action:** `generateReportPreview` (w `actions/reports.ts`).
  - **Logika:**
    1. Przyjmuje `sourceText`.
    2. Waliduje długość tekstu (>= 100 znaków).
    3. Wywołuje API `POST /reports/generate` z `GenerateReportCommand`.
    4. Zwraca `{ success: true, data: ReportPreviewDto }` lub `{ success: false, error: ... }`.
- **Zapisywanie raportu:**
  - **Server Action:** `saveReport` (w `actions/reports.ts`).
  - **Logika:**
    1. Przyjmuje `title`, `originalText` (z podglądu), `summary`, `conclusions`, `keyData` (z edytora).
    2. Waliduje tytuł.
    3. Wywołuje API `POST /reports` z `CreateReportCommand`.
    4. Zwraca `{ success: true, data: CreateReportResponseDto }` lub `{ success: false, error: ... }`.

## 8. Interakcje użytkownika
- **Wpisanie tekstu źródłowego:** Aktualizacja stanu `sourceText`. Walidacja długości w czasie rzeczywistym lub przed kliknięciem "Generuj".
- **Kliknięcie "Generuj Raport":**
  1. Sprawdzenie długości `sourceText`.
  2. Jeśli OK: Ustaw `isGenerating = true`, wywołaj SA `generateReportPreview`.
  3. Po odpowiedzi SA:
     - Ustaw `isGenerating = false`.
     - **Sukces:** Zapisz `ReportPreviewDto` w stanie `generatedContent`, wyświetl sekcję wyników z `RichTextEditor`.
     - **Błąd:** Ustaw `generateError`, pokaż `Toast`.
- **Wpisanie tytułu / Edycja w RichTextEditor:** Aktualizacja stanów `title` / `editorContent`.
- **Kliknięcie "Zapisz Raport":**
  1. Sprawdzenie, czy `title` nie jest pusty.
  2. Pobranie aktualnej treści z `RichTextEditor`.
  3. Jeśli OK: Ustaw `isSaving = true`, wywołaj SA `saveReport` z potrzebnymi danymi.
  4. Po odpowiedzi SA:
     - Ustaw `isSaving = false`.
     - **Sukces:** Pokaż `Toast` sukcesu, przekieruj do `/reports` (`useRouter().push("/reports")`).
     - **Błąd:** Ustaw `saveError`, pokaż `Toast`.

## 9. Warunki i walidacja
- **Tekst źródłowy:** Min. 100 znaków. Przycisk "Generuj Raport" jest nieaktywny, jeśli warunek niespełniony.
- **Tytuł:** Wymagany przed zapisem. Przycisk "Zapisz Raport" może być nieaktywny lub walidacja uruchamiana po kliknięciu.
- **Warunki API (`POST /reports/generate`):**
    - 400 (Input too short): Komunikat dla użytkownika (`Toast`).
    - 500 (Generation error): Komunikat dla użytkownika (`Toast`).
- **Warunki API (`POST /reports`):**
    - 400 (Validation errors): Komunikat dla użytkownika (`Toast`).
    - 401 (Unauthorized): Teoretycznie nie powinno wystąpić w chronionej trasie, ale obsłużyć.
    - 5xx: Komunikat dla użytkownika (`Toast`).

## 10. Obsługa błędów
- **Błędy walidacji klienta:** Komunikaty przy polach lub deaktywacja przycisków.
- **Błędy generowania (API):** Wyświetlane przez `Toast` (`generateError`). Sekcja wyników nie jest pokazywana.
- **Błędy zapisywania (API):** Wyświetlane przez `Toast` (`saveError`).
- **Błędy sieciowe / serwera (5xx):** Ogólny komunikat błędu przez `Toast`.
- **Stan ładowania (generowanie):** Wskaźnik ładowania przy przycisku "Generuj", deaktywacja przycisku.
- **Stan ładowania (zapis):** Wskaźnik ładowania przy przycisku "Zapisz", deaktywacja przycisku.

## 11. Kroki implementacji
1. Utwórz plik strony `app/(protected)/reports/generate/page.tsx` i komponent `GenerateReportForm`.
2. Zaimplementuj Server Action `generateReportPreview` i `saveReport` w `actions/reports.ts`.
3. Zaimplementuj `GenerateReportPage` renderujący `GenerateReportForm`.
4. Zaimplementuj CC `GenerateReportForm`:
   - Stany lokalne (`sourceText`, `isGenerating`, `generatedContent`, `title`, `editorContent`, `isSaving`, błędy).
   - Renderowanie formularza wejściowego (`Textarea`, przycisk "Generuj").
   - Logika `handleGenerate`: walidacja długości, wywołanie SA `generateReportPreview`, obsługa odpowiedzi, aktualizacja stanu.
   - Warunkowe renderowanie sekcji wyników (`Input` dla tytułu, `RichTextEditor`, przycisk "Zapisz").
   - Logika `handleSave`: walidacja tytułu, pobranie treści z edytora, wywołanie SA `saveReport`, obsługa odpowiedzi, przekierowanie.
5. Zaimplementuj (lub zintegruj istniejący) komponent `RichTextEditor`:
   - Musi przyjmować `initialContent`.
   - Musi wywoływać `onChange` ze zmianami.
   - Musi udostępniać sposób na pobranie aktualnej treści w formacie akceptowalnym przez `saveReport` SA.
6. Zaimplementuj `LoadingIndicator`.
7. Zintegruj `useToast` do wyświetlania powiadomień.
8. Stylizuj komponenty, dodaj obsługę responsywności.
9. Testuj: wprowadzanie tekstu, walidację długości, generowanie (sukces, błąd), edycję tytułu i treści, zapisywanie (sukces, błąd), stany ładowania, przekierowanie. 