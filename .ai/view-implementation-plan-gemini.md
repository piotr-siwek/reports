# API Endpoint Implementation Plan: Get Report Details (`GET /reports/{id}`)

## 1. Przegląd punktu końcowego
Ten punkt końcowy pobiera szczegółowe informacje o konkretnym raporcie na podstawie jego identyfikatora (`id`). Dostęp jest ograniczony tylko do uwierzytelnionego użytkownika, który jest właścicielem raportu.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Struktura URL: `/reports/{id}`
- Parametry:
  - Wymagane:
    - Parametr ścieżki: `id` (liczba całkowita, identyfikator raportu)
    - Nagłówek: `Authorization: Bearer <jwt-token>` (dostarczony przez middleware uwierzytelniania)
  - Opcjonalne: Brak
- Request Body: Brak (dla żądania GET)

## 3. Wykorzystywane typy
- `ReportDto` (z `src/types.ts`): Definiuje strukturę danych zwracanych w odpowiedzi w przypadku sukcesu. Aliasowany jako `GetReportDetailsResponseDto`.
- Wewnętrznie: Typ reprezentujący użytkownika (do uzyskania `userId` z tokena JWT).

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**
  - Typ zawartości: `application/json`
  - Treść: Obiekt `ReportDto` zawierający pełne szczegóły raportu.
  ```json
  {
    "id": 1,
    "userId": 1,
    "title": "Report Title", // Uwaga: Wymaga obecności w DB
    "originalText": "Large input text...",
    "summary": "Report summary...",
    "conclusions": "Report conclusions...",
    "keyData": "Report key data...",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- **Błędy:**
  - `400 Bad Request`: Nieprawidłowy format `id` (np. nie jest liczbą całkowitą).
  - `401 Unauthorized`: Brakujący lub nieprawidłowy token JWT (obsługiwane przez middleware).
  - `404 Not Found`: Raport o podanym `id` nie istnieje lub nie należy do uwierzytelnionego użytkownika (wynik działania RLS).
  - `500 Internal Server Error`: Błędy serwera (np. błąd bazy danych).

## 5. Przepływ danych
1. Żądanie `GET /reports/{id}` trafia do serwera.
2. Middleware uwierzytelniania weryfikuje token JWT i dołącza dane użytkownika (w tym `userId`) do obiektu żądania. Jeśli token jest nieprawidłowy, zwraca `401 Unauthorized`.
3. Middleware walidacji sprawdza, czy parametr ścieżki `id` jest prawidłową liczbą całkowitą. Jeśli nie, zwraca `400 Bad Request`.
4. Kontroler endpointu wywołuje metodę `getReportDetails(reportId, userId)` w `ReportService`, przekazując `id` z URL i `userId` z danych uwierzytelnionego użytkownika.
5. `ReportService` ustawia kontekst RLS w sesji bazy danych (np. `SET myapp.current_user_id = :userId`).
6. `ReportService` (lub powiązane Repozytorium) wykonuje zapytanie do bazy danych (Supabase/PostgreSQL), aby pobrać raport z tabeli `reports` WHERE `id = :reportId`. Polityka RLS (`report_owner_policy`) automatycznie zapewnia, że zapytanie zwróci wiersz tylko wtedy, gdy `user_id` pasuje do ustawionego `myapp.current_user_id`.
7. **Rozbieżność:** Zapytanie musi uwzględniać kolumnę `title`, która istnieje w `ReportDto` i specyfikacji API, ale nie w `db-plan.md`. Należy założyć, że schemat bazy danych zostanie zaktualizowany, aby zawierał `title`.
8. Jeśli zapytanie nie zwróci żadnego wiersza (nie znaleziono ID lub RLS odfiltrowało), `ReportService` zgłasza błąd `NotFoundError`.
9. Jeśli zapytanie zwróci wiersz, `ReportService` mapuje dane z bazy danych (snake_case) na obiekt `ReportDto` (camelCase).
10. Kontroler odbiera `ReportDto` z serwisu i zwraca odpowiedź `200 OK` z tym obiektem w treści.
11. Jeśli `ReportService` zgłosił `NotFoundError`, globalny filtr wyjątków przechwytuje go i zwraca odpowiedź `404 Not Found`.
12. W przypadku innych nieoczekiwanych błędów (np. błąd połączenia z bazą danych), globalny filtr wyjątków zwraca `500 Internal Server Error` i loguje błąd.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Zapewnione przez middleware weryfikujące token JWT.
- **Autoryzacja:** Kluczowa jest prawidłowa implementacja i wykorzystanie polityki RLS (`report_owner_policy`) w Supabase/PostgreSQL. Aplikacja musi poprawnie ustawić `myapp.current_user_id` dla każdej sesji/żądania, aby RLS działało poprawnie. Zapobiega to dostępowi użytkowników do raportów innych użytkowników (IDOR).
- **Walidacja danych wejściowych:** Walidacja parametru `id` zapobiega błędom przetwarzania i potencjalnym atakom (np. SQL injection, chociaż ORM/parametryzowane zapytania powinny to również łagodzić).
- **Bezpieczeństwo transportu:** Komunikacja powinna odbywać się wyłącznie przez HTTPS.

## 7. Obsługa błędów
- Należy zaimplementować globalny filtr wyjątków do spójnej obsługi błędów.
- Mapuj specyficzne wyjątki serwisowe (np. `NotFoundError`) na odpowiednie kody stanu HTTP (404).
- Domyślnie zwracaj `500 Internal Server Error` dla nieobsługiwanych wyjątków.
- Loguj błędy 5xx ze szczegółami (stack trace), aby ułatwić diagnozę. Logowanie błędów 4xx powinno być mniej szczegółowe.
- Odpowiedzi błędów powinny mieć spójny format JSON (np. `{ "statusCode": 404, "message": "Report not found" }`).

## 8. Rozważania dotyczące wydajności
- Zapytanie do bazy danych jest proste (SELECT ... WHERE id = ...). Wydajność powinna być dobra, zakładając, że `id` jest kluczem głównym.
- Indeks `idx_reports_user_id` (z `db-plan.md`) nie jest bezpośrednio używany w tym zapytaniu `WHERE id = ...`, ale jest kluczowy dla RLS i innych zapytań filtrujących po `user_id`.
- Upewnij się, że połączenie z bazą danych jest zarządzane efektywnie (np. pool połączeń).
- Rozmiar odpowiedzi jest zależny od długości pól tekstowych w raporcie (`originalText`, `summary` itp.). Nie przewiduje się problemów z wydajnością dla pojedynczego rekordu, chyba że teksty są ekstremalnie długie (blisko limitu 10000 znaków).

## 9. Etapy wdrożenia
1. **Aktualizacja Schematu DB:** Potwierdź i dodaj kolumnę `title` VARCHAR(255) (lub odpowiedni typ/długość) do tabeli `reports` w schemacie bazy danych (`db-plan.md` i rzeczywista migracja).
2. **Konfiguracja RLS:** Upewnij się, że polityka RLS `report_owner_policy` jest poprawnie zdefiniowana w bazie danych i że mechanizm ustawiania `myapp.current_user_id` jest gotowy.
3. **Utworzenie/Aktualizacja Serwisu:** Zaimplementuj lub zaktualizuj `ReportService` dodając metodę `async getReportDetails(reportId: number, userId: number): Promise<ReportDto>`.
    - Zaimplementuj logikę ustawiania kontekstu RLS (`myapp.current_user_id`).
    - Zaimplementuj zapytanie do bazy danych (za pomocą repozytorium lub klienta Supabase), pobierając raport wg `id`.
    - Dodaj mapowanie wyników z bazy danych (snake_case, w tym nowy `title`) na `ReportDto` (camelCase).
    - Zaimplementuj zgłaszanie `NotFoundError`, jeśli raport nie zostanie znaleziony.
4. **Utworzenie Kontrolera/Routingu:** Zdefiniuj routing `GET /reports/{id}`.
    - Zastosuj middleware uwierzytelniania.
    - Zastosuj middleware walidacji dla parametru `id` (np. sprawdzanie, czy jest to liczba całkowita).
    - Wstrzyknij `ReportService`.
    - Wywołaj `reportService.getReportDetails` z `id` z parametru ścieżki i `userId` z kontekstu uwierzytelniania.
    - Zwróć wynik jako odpowiedź `200 OK`.
5. **Obsługa Błędów:** Upewnij się, że globalny filtr wyjątków poprawnie obsługuje `NotFoundError` (mapując na 404) oraz inne potencjalne błędy (mapując na 500).
6. **Testy:**
    - Napisz testy jednostkowe dla `ReportService` (mockując bazę danych/repozytorium).
    - Napisz testy integracyjne/e2e dla endpointu `/reports/{id}`, obejmujące przypadki:
        - Sukces (200 OK)
        - Nieprawidłowy `id` (400 Bad Request)
        - Brakujący/nieprawidłowy token (401 Unauthorized)
        - Nieistniejący `id` (404 Not Found)
        - Dostęp do raportu innego użytkownika (powinien zwrócić 404 Not Found z powodu RLS)
7. **Dokumentacja:** Zaktualizuj dokumentację API (np. Swagger/OpenAPI), jeśli jest generowana automatycznie lub prowadzona ręcznie. 