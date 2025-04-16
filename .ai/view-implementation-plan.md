/*
API Endpoint Implementation Plan: Generate Report Endpoint

## 1. Przegląd punktu końcowego
Opis: Endpoint służy do generowania podglądu raportu na podstawie dostarczonego tekstu wejściowego. Endpoint przyjmuje długi tekst, przeprowadza jego analizę za pomocą usługi AI (np. Openrouter.ai), a następnie zwraca wygenerowany podgląd raportu zawierający streszczenie, wnioski i kluczowe dane.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /reports/generate
- Parametry:
  - Wymagane:
    - `originalText` (string; minimum 100 znaków, maksymalnie 10000 znaków zgodnie z ograniczeniami bazy danych)
  - Opcjonalne: Brak
- Request Body:
  ```json
  {
      "originalText": "Large input text..."
  }
  ```

## 3. Wykorzystywane typy
- Command Model: `GenerateReportCommand`
  - Atrybuty: `originalText`
- DTO odpowiedzi: `ReportPreviewDto`
  - Atrybuty: `originalText`, `summary`, `conclusions`, `keyData`

## 4. Szczegóły odpowiedzi
- Pomyślna odpowiedź:
  - Kod: 200 OK
  - Body:
    ```json
    {
       "originalText": "Large input text...",
       "summary": "Generated summary...",
       "conclusions": "Generated conclusions...",
       "keyData": "Extracted key data..."
    }
    ```
- Możliwe błędy:
  - 400 Bad Request: Jeśli `originalText` nie spełnia wymagań (np. jest za krótki).
  - 500 Internal Server Error: W przypadku błędów podczas generowania raportu.

## 5. Przepływ danych
1. Klient wysyła żądanie POST do `/reports/generate` z właściwym JSON payload.
2. Warstwa walidacji sprawdza długość `originalText` (min 100, max 10000 znaków).
3. Po poprawnej walidacji, żądanie jest przekazywane do warstwy serwisowej, która wywołuje zewnętrzną usługę AI (Openrouter.ai) do generacji podglądu raportu.
4. Wynik zwracany przez usługę AI jest mapowany do obiektu `ReportPreviewDto`.
5. API zwraca odpowiedź z kodem 200 OK zawierającą wygenerowany podgląd raportu.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Jeśli endpoint ma być dostępny tylko dla zalogowanych użytkowników, należy dodać middleware autoryzacyjny (np. weryfikacja JWT).
- Walidacja danych wejściowych: Sprawdzanie długości `originalText` oraz sanityzacja danych, aby zapobiec atakom typu injection.
- Rate Limiting: Wdrożenie ograniczenia liczby wywołań w celu zapobiegania nadużyciom.
- Bezpieczne połączenie: Upewnić się, że komunikacja odbywa się przez HTTPS.

## 7. Obsługa błędów
- Walidacja:
  - Jeśli `originalText` jest krótszy niż wymagane 100 znaków, zwrócić błąd 400.
- Błędy zewnętrznej usługi AI:
  - W przypadku niepowodzenia żądania do usługi AI lub przekroczenia timeout, zwrócić błąd 500.
- Standardowy mechanizm logowania błędów:
  - Logowanie wszystkich błędów z odpowiednimi komunikatami i, opcjonalnie, zapisywanie w dedykowanej tabeli błędów.

## 8. Rozważania dotyczące wydajności
- Optymalizacja wywołań do zewnętrznej usługi AI, np. asynchroniczne przetwarzanie oraz ewentualne cachowanie wyników.
- Monitorowanie i skalowanie: Użycie narzędzi monitorujących (np. New Relic) oraz przewidzenie skalowania horyzontalnego backendu.
- Ograniczenie długości przetwarzanego tekstu, aby zapobiec przetwarzaniu nadmiernie dużych żądań.

## 9. Etapy wdrożenia
1. Utworzenie nowego endpointu w layerze routingu o ścieżce `/reports/generate` w backendzie (np. Next.js API route lub kontroler w innym frameworku).
2. Implementacja walidacji danych wejściowych (sprawdzenie długości `originalText`) przy użyciu odpowiednich narzędzi lub middleware.
3. Integracja z warstwą serwisową:
   - Wydzielenie logiki komunikacji z zewnętrzną usługą AI do dedykowanego modułu/serwisu.
4. Wywołanie zewnętrznej usługi AI (Openrouter.ai) oraz obsługa jej odpowiedzi.
5. Mapowanie odpowiedzi z usługi AI do DTO `ReportPreviewDto`.
6. Implementacja mechanizmów logowania błędów i zwracania odpowiednich kodów statusu (400, 500).
7. Dodanie testów jednostkowych i integracyjnych dla nowego endpointu.
8. Wdrożenie mechanizmu rate limiting oraz ostateczna walidacja zabezpieczeń.
9. Aktualizacja dokumentacji API (np. Swagger/OpenAPI) z opisem nowego endpointu.
*/ 