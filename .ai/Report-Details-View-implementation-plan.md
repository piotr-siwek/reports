# Plan implementacji widoku Szczegółów/Edycji Raportu

## 1. Przegląd
Widok Szczegółów/Edycji Raportu umożliwia zalogowanemu użytkownikowi przeglądanie pełnej treści wybranego raportu, edytowanie jego tytułu oraz sekcji (streszczenie, wnioski, kluczowe dane) za pomocą edytora tekstu sformatowanego, zapisywanie zmian oraz usuwanie raportu. Widok ten łączy funkcjonalności z historyjek użytkownika US-009, US-010 i US-011.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką: `/reports/[id]`, gdzie `[id]` jest numerycznym identyfikatorem raportu. Implementacja znajdzie się w pliku `src/app/(protected)/reports/[id]/page.tsx`.

## 3. Struktura komponentów
Hierarchia komponentów dla tego widoku będzie następująca:

```
ReportDetailsPage (Server Component / Plik strony)
└── ReportEditForm (Client Component)
    ├── Input (shadcn/ui - Tytuł)
    ├── ReportMetadata (Client Component)
    │   └── (Wyświetla daty utworzenia/modyfikacji)
    ├── ReportSectionEditor (Client Component - Streszczenie)
    │   ├── Label
    │   └── RichTextEditor (Client Component)
    ├── ReportSectionEditor (Client Component - Wnioski)
    │   ├── Label
    │   └── RichTextEditor (Client Component)
    ├── ReportSectionEditor (Client Component - Kluczowe Dane)
    │   ├── Label
    │   └── RichTextEditor (Client Component)
    ├── Button (shadcn/ui - Zapisz Zmiany)
    ├── Button (shadcn/ui - Usuń Raport, wariant destructive)
    └── DeleteConfirmationDialog (Client Component)
        └── AlertDialog (shadcn/ui)
```

## 4. Szczegóły komponentów

### `ReportDetailsPage` (`app/(protected)/reports/[id]/page.tsx`)
-   **Opis komponentu:** Główny komponent strony (Server Component). Odpowiedzialny za pobranie danych raportu na podstawie `id` z URL po stronie serwera (wykorzystując `reportService.getReportDetails`), obsługę stanu ładowania (przez Suspense) i błędów (Not Found, Server Error - przez `error.tsx` lub try/catch). Renderuje `ReportEditForm`, przekazując pobrane dane jako propsy.
-   **Główne elementy:** Kontener strony, logika pobierania danych, renderowanie `ReportEditForm`.
-   **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika (renderowanie serwerowe).
-   **Obsługiwana walidacja:** Walidacja `id` z URL (musi być liczbą całkowitą).
-   **Typy:** `params: { id: string }`. Wewnętrznie operuje na `ReportDto`.
-   **Propsy:** Przyjmuje `params` od Next.js.

### `ReportEditForm` (Client Component)
-   **Opis komponentu:** Główny formularz do wyświetlania i edycji raportu. Używa `react-hook-form` do zarządzania stanem formularza (tytuł, sekcje edytora) i walidacji za pomocą `zod`. Renderuje pole `Input` dla tytułu, komponenty `ReportMetadata`, `ReportSectionEditor` dla każdej sekcji oraz przyciski "Zapisz Zmiany" i "Usuń Raport". Zarządza również stanem dialogu potwierdzenia usunięcia.
-   **Główne elementy:** `<form>`, `Input` (shadcn/ui), `ReportMetadata`, `ReportSectionEditor` (x3), `Button` (shadcn/ui - Zapisz), `Button` (shadcn/ui - Usuń), `DeleteConfirmationDialog`.
-   **Obsługiwane interakcje:** Wprowadzanie tekstu w polach, edycja w edytorach, kliknięcie "Zapisz", kliknięcie "Usuń".
-   **Obsługiwana walidacja:** Walidacja pól formularza za pomocą schemy `zod`:
    -   `title`: Wymagany (`string`, niepusty), `max: 255` (do potwierdzenia).
    -   `summary`, `conclusions`, `keyData`: `string`, `max: 10000` znaków (zgodnie z API).
-   **Typy:** `ReportDto` (dla danych inicjalnych), `ReportEditFormViewModel` (typ formularza), `zod` schema.
-   **Propsy:** `initialData: ReportDto`.

### `ReportMetadata` (Client Component)
-   **Opis komponentu:** Wyświetla metadane raportu, które nie są edytowalne, takie jak data utworzenia i ostatniej modyfikacji.
-   **Główne elementy:** Elementy tekstowe (`<p>`, `<span>`) do wyświetlania dat. Może użyć biblioteki `date-fns` do formatowania.
-   **Obsługiwane interakcje:** Brak.
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** `Pick<ReportDto, 'createdAt' | 'updatedAt'>`.
-   **Propsy:** `createdAt: string`, `updatedAt: string`.

### `ReportSectionEditor` (Client Component)
-   **Opis komponentu:** Reużywalny komponent do wyświetlania i edycji pojedynczej sekcji raportu (np. Streszczenie). Zawiera etykietę sekcji oraz komponent `RichTextEditor`. Musi być zintegrowany z `react-hook-form` nadrzędnego formularza.
-   **Główne elementy:** `Label` (shadcn/ui), `RichTextEditor`. Może być opakowany w `<Controller>` z `react-hook-form`.
-   **Obsługiwane interakcje:** Edycja treści w `RichTextEditor`.
-   **Obsługiwana walidacja:** Walidacja (np. maksymalna długość) jest delegowana do schemy `zod` w `ReportEditForm`.
-   **Typy:** `Control<ReportEditFormViewModel>`, `fieldName: keyof Pick<ReportEditFormViewModel, 'summary' | 'conclusions' | 'keyData'>`.
-   **Propsy:** `label: string`, `fieldName`, `control` (z `react-hook-form`). `initialContent` jest pobierany z `control`.

### `RichTextEditor` (Client Component - Zakładany)
-   **Opis komponentu:** Istniejący komponent opakowujący edytor Lexical. Dostarcza podstawowe możliwości formatowania. Musi przyjmować wartość początkową i informować o zmianach (np. przez `onChange` przekazywane z `react-hook-form Controller`).
-   **Główne elementy:** Struktura edytora Lexical.
-   **Obsługiwane interakcje:** Wprowadzanie i formatowanie tekstu.
-   **Obsługiwana walidacja:** Brak wewnętrznej walidacji (delegowana).
-   **Typy:** Zależne od implementacji, ale oczekiwane propsy to `value: string`, `onChange: (value: string) => void`.
-   **Propsy:** `value`, `onChange`, ewentualnie inne konfiguracyjne.

### `DeleteConfirmationDialog` (Client Component)
-   **Opis komponentu:** Modal wykorzystujący `AlertDialog` z `shadcn/ui` do potwierdzenia operacji usunięcia raportu. Wyświetlany po kliknięciu przycisku "Usuń Raport".
-   **Główne elementy:** Komponenty `AlertDialog` z `shadcn/ui` (`AlertDialogTrigger` jest w `ReportEditForm`). Zawiera `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`. Przycisk akcji powinien wyświetlać stan ładowania.
-   **Obsługiwane interakcje:** Kliknięcie "Anuluj", kliknięcie "Potwierdź usunięcie".
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** `boolean` (dla stanu ładowania).
-   **Propsy:** `isOpen: boolean`, `onClose: () => void`, `onConfirm: () => Promise<void>`, `isDeleting: boolean`.

## 5. Typy
-   **`ReportDto` (z `src/types.ts`):** Podstawowy typ danych raportu pobierany z API.
    ```typescript
    interface ReportDto {
      id: number;
      userId: number;
      title: string;
      originalText: string;
      summary: string;
      conclusions: string;
      keyData: string;
      createdAt: string; // Może wymagać konwersji na Date do formatowania
      updatedAt: string; // Może wymagać konwersji na Date do formatowania
    }
    ```
-   **`UpdateReportCommand` (z `src/types.ts`):** Typ danych wysyłanych do API podczas aktualizacji. Pola są opcjonalne.
    ```typescript
    interface UpdateReportCommand {
      title?: string;
      originalText?: string; // Prawdopodobnie nieedytowalne w tym widoku
      summary?: string;
      conclusions?: string;
      keyData?: string;
    }
    ```
-   **`ReportEditFormViewModel` (Nowy typ):** Typ używany przez `react-hook-form` do zarządzania stanem formularza. Wymusza obecność tytułu i przechowuje zawartość edytorów jako string (HTML).
    ```typescript
    interface ReportEditFormViewModel {
      title: string; // Wymagany w formularzu
      summary: string; // Zawartość HTML z RichTextEditor
      conclusions: string; // Zawartość HTML z RichTextEditor
      keyData: string; // Zawartość HTML z RichTextEditor
    }
    ```
-   **`Zod Schema` (Nowy typ):** Schema walidacji dla `ReportEditFormViewModel`.
    ```typescript
    import { z } from 'zod';

    const reportEditSchema = z.object({
      title: z.string().min(1, "Tytuł jest wymagany.").max(255, "Tytuł jest za długi."),
      summary: z.string().max(10000, "Streszczenie jest za długie (max 10000 znaków)."),
      conclusions: z.string().max(10000, "Wnioski są za długie (max 10000 znaków)."),
      keyData: z.string().max(10000, "Kluczowe dane są za długie (max 10000 znaków)."),
    });

    // Typ wyinferowany ze schemy
    type ReportEditFormViewModel = z.infer<typeof reportEditSchema>;
    ```

## 6. Zarządzanie stanem
-   **Stan danych raportu:** Początkowe dane są ładowane na serwerze w `ReportDetailsPage` i przekazywane do `ReportEditForm`. Po udanej aktualizacji, dane powinny zostać odświeżone poprzez rewalidację ścieżki (`revalidatePath`) w Server Action.
-   **Stan formularza:** Zarządzany przez `react-hook-form` w komponencie `ReportEditForm`. Obejmuje wartości pól, stan walidacji (`errors`), stan "brudny" (`isDirty`) oraz stan przesyłania (`isSubmitting`).
-   **Stan UI:**
    -   `isDeleteDialogOpen` (`boolean`): Lokalny stan (`useState`) w `ReportEditForm` do kontrolowania widoczności modala potwierdzenia.
    -   `isDeleting` (`boolean`): Lokalny stan (`useState`) w `ReportEditForm` do śledzenia stanu ładowania podczas usuwania, przekazywany do `DeleteConfirmationDialog`.
-   **Custom Hooks:** Nie przewiduje się potrzeby tworzenia dedykowanych custom hooków dla tego widoku. `useForm` z `react-hook-form` jest kluczowy.

## 7. Integracja API
Interakcje z backendem będą realizowane za pomocą Server Actions.

-   **Pobieranie danych (`GET /reports/{id}`):**
    -   **Mechanizm:** Wywołanie `reportService.getReportDetails(id, userId)` wewnątrz komponentu serwerowego `ReportDetailsPage`. `userId` musi być dostępne w kontekście serwerowym (np. z sesji/middleware).
    -   **Typ odpowiedzi:** `ReportDto`.
-   **Aktualizacja danych (`PUT /reports/{id}`):**
    -   **Mechanizm:** Server Action (`updateReportAction(id: number, data: ReportEditFormViewModel)`) wywoływana z `ReportEditForm`. Akcja transformuje `ReportEditFormViewModel` na `UpdateReportCommand`, **sanitizuje HTML** z edytorów (np. używając `DOMPurify`), wywołuje odpowiednią metodę serwisową backendu, a w razie sukcesu używa `revalidatePath`.
    -   **Typ żądania (do API):** `UpdateReportCommand`.
    -   **Typ odpowiedzi (z API):** `UpdateReportResponseDto`. Server Action zwraca `{ success: boolean, errors?: ZodErrors, message?: string }`.
-   **Usuwanie danych (`DELETE /reports/{id}`):**
    -   **Mechanizm:** Server Action (`deleteReportAction(id: number)`) wywoływana z `DeleteConfirmationDialog` (poprzez `ReportEditForm`). Akcja wywołuje metodę serwisową backendu, a w razie sukcesu używa `redirect('/reports')`.
    -   **Typ odpowiedzi (z API):** `DeleteReportResponseDto`. Server Action zwraca `{ success: boolean, message?: string }` lub rzuca błąd (który może spowodować redirect).

## 8. Interakcje użytkownika
-   **Ładowanie widoku:** Użytkownik widzi stan ładowania (np. Suspense fallback), a następnie formularz wypełniony danymi raportu.
-   **Edycja pól:** Użytkownik może modyfikować tytuł w polu `Input` oraz treść w edytorach `RichTextEditor`. Przycisk "Zapisz Zmiany" staje się aktywny, jeśli formularz jest "brudny" (`isDirty`) i poprawny.
-   **Kliknięcie "Zapisz Zmiany":** Uruchamia walidację. Jeśli jest poprawna, wywoływana jest Server Action (`updateReportAction`). Przycisk pokazuje stan ładowania. Po zakończeniu wyświetlany jest Toast (sukces/błąd). W razie sukcesu dane w formularzu mogą zostać odświeżone (poprzez rewalidację).
-   **Kliknięcie "Usuń Raport":** Otwiera modal `DeleteConfirmationDialog`.
-   **Potwierdzenie usunięcia:** Wywołuje Server Action (`deleteReportAction`). Przycisk w modalu pokazuje stan ładowania. Po sukcesie wyświetlany jest Toast, a użytkownik jest przekierowywany do listy raportów (`/reports`). W razie błędu wyświetlany jest Toast, a modal może pozostać otwarty lub zostać zamknięty.
-   **Anulowanie usunięcia:** Zamyka modal `DeleteConfirmationDialog`.

## 9. Warunki i walidacja
-   **Dostęp do widoku:** Użytkownik musi być zalogowany. Autoryzacja (sprawdzenie, czy użytkownik jest właścicielem raportu) odbywa się po stronie backendu (RLS/serwis API).
-   **ID raportu:** Musi być poprawną liczbą całkowitą (walidacja w `ReportDetailsPage`).
-   **Walidacja formularza (`ReportEditForm`):**
    -   Tytuł: Wymagany, niepusty, maksymalna długość (np. 255). Wyświetlanie błędu pod polem `Input`.
    -   Sekcje (Streszczenie, Wnioski, Kluczowe Dane): Maksymalna długość 10 000 znaków. Błąd może być wyświetlany pod odpowiednim `ReportSectionEditor`.
    -   Przycisk "Zapisz Zmiany" jest aktywny tylko wtedy, gdy `formState.isDirty` jest `true` i `formState.isValid` jest `true`.

## 10. Obsługa błędów
-   **Błąd pobierania danych:**
    -   `404 Not Found`: `ReportDetailsPage` powinien przechwycić błąd `NotFoundError` z serwisu i wyświetlić dedykowaną stronę/komponent "Nie znaleziono raportu".
    -   `401 Unauthorized / 403 Forbidden`: Middleware powinno przekierować do logowania. Jeśli błąd wystąpi nieoczekiwanie, globalny `error.tsx` powinien obsłużyć.
    -   `5xx Server Error`: Globalny `error.tsx` powinien wyświetlić generyczny komunikat błędu.
-   **Błąd zapisu (`PUT`):**
    -   `400 Bad Request` (Błędy walidacji): Server Action zwraca błędy walidacji. `ReportEditForm` używa `setError` z `react-hook-form` do wyświetlenia błędów przy polach. Wyświetlany jest również ogólny Toast błędu.
    -   `404 Not Found`: Toast informujący, że raport nie istnieje (mógł zostać usunięty). Formularz może zostać zablokowany.
    -   `5xx Server Error`: Ogólny Toast "Nie udało się zapisać raportu".
-   **Błąd usuwania (`DELETE`):**
    -   `404 Not Found`: Toast informujący, że raport już nie istnieje. Modal jest zamykany, następuje przekierowanie do `/reports`.
    -   `5xx Server Error`: Ogólny Toast "Nie udało się usunąć raportu". Modal jest zamykany.

## 11. Kroki implementacji
1.  **Struktura plików:** Utwórz plik strony `src/app/(protected)/reports/[id]/page.tsx`. Utwórz folder `src/components/feature/report-details/` na komponenty klienckie (`ReportEditForm.tsx`, `ReportMetadata.tsx`, `ReportSectionEditor.tsx`, `DeleteConfirmationDialog.tsx`).
2.  **Pobieranie danych (`ReportDetailsPage`):** Zaimplementuj logikę pobierania danych raportu po stronie serwera, używając `reportService.getReportDetails`. Obsłuż przypadki błędów (Not Found -> `notFound()` z Next.js, inne -> propagacja do `error.tsx`). Użyj `Suspense` dla stanu ładowania.
3.  **Komponent `ReportMetadata`:** Utwórz prosty komponent kliencki do wyświetlania sformatowanych dat `createdAt` i `updatedAt`.
4.  **Komponent `ReportSectionEditor`:** Utwórz komponent kliencki, który przyjmuje `label`, `fieldName` i `control` (z `react-hook-form`). Użyj `<Controller>` do integracji z `RichTextEditor`.
5.  **Komponent `ReportEditForm`:**
    *   Zainicjuj `react-hook-form` z `ReportEditFormViewModel` i schemą walidacji `zod` (`zodResolver`). Ustaw wartości domyślne (`defaultValues`) na podstawie `initialData`.
    *   Zrenderuj pole `Input` dla tytułu, `ReportMetadata` i trzy instancje `ReportSectionEditor`.
    *   Dodaj przyciski "Zapisz Zmiany" (powiązany z `form.handleSubmit`, stan `isSubmitting`, `isDirty`, `isValid`) i "Usuń Raport".
6.  **Komponent `DeleteConfirmationDialog`:** Zaimplementuj modal `AlertDialog` kontrolowany przez stan w `ReportEditForm`. Przekaż funkcję `onConfirm` i stan `isDeleting`.
7.  **Server Actions:**
    *   Utwórz `updateReportAction(id: number, data: ReportEditFormViewModel)`: Pobiera dane z formularza, **sanitizuje HTML**, mapuje na `UpdateReportCommand`, wywołuje serwis backendowy, obsługuje błędy, zwraca status/błędy, rewaliduje ścieżkę (`revalidatePath`).
    *   Utwórz `deleteReportAction(id: number)`: Wywołuje serwis backendowy, obsługuje błędy, przekierowuje (`redirect`) do `/reports` w razie sukcesu.
8.  **Integracja Akcji:** Podłącz Server Actions do `onSubmit` formularza (`ReportEditForm`) i `onConfirm` dialogu (`DeleteConfirmationDialog`). Obsłuż stany ładowania i wyświetlanie powiadomień Toast.
9.  **Styling i Responsywność:** Zastosuj style Tailwind i komponenty `shadcn/ui`, upewniając się, że widok jest responsywny.
10. **Testowanie:** Przetestuj wszystkie przepływy użytkownika, walidację, obsługę błędów i responsywność. 