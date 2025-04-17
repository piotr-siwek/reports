<conversation_summary>
<decisions>
1.  Głównymi widokami aplikacji będą: Logowanie, Rejestracja, Reset Hasła, Dashboard/Lista Raportów, Generowanie Raportu, Szczegóły/Edycja Raportu, Profil Użytkownika.
2.  Preferowanym sposobem interakcji z backendem będą Server Actions, z możliwością użycia klienckich wywołań API jako fallback.
3.  Do zarządzania stanem globalnym aplikacji wykorzystany zostanie Zustand (głównie dla stanu autoryzacji), natomiast dla stanów lokalnych komponentów preferowany jest `useState`/`useReducer`.
4.  Do obsługi prostych formularzy (logowanie, rejestracja, profil, tytuł raportu) zostanie użyta biblioteka `react-hook-form` w połączeniu z `zod` do walidacji.
5.  Do edycji treści raportów (streszczenie, wnioski, kluczowe dane) zostanie wykorzystany edytor Rich Text Lexical, zarządzany niezależnie od `react-hook-form`. Dane z Lexical będą pobierane i sanityzowane (`DOMPurify`) w Server Action przed zapisem.
6.  Autoryzacja będzie oparta o JWT, z Access Tokenem i Refresh Tokenem przechowywanymi w bezpiecznych `httpOnly` cookies. Odświeżanie tokenu będzie obsługiwane (np. przez dedykowany API Route lub logikę w Server Actions).
7.  Do obsługi błędów API i walidacji będą używane komponenty `Toast` (`shadcn/ui`) oraz komunikaty przy polach formularzy (`react-hook-form`). Globalny `ErrorBoundary` zapewni obsługę błędów renderowania.
8.  Stylizacja oparta będzie na Tailwind CSS i bibliotece komponentów `shadcn/ui`.
9.  Aplikacja będzie responsywna; na mniejszych ekranach widok listy raportów zmieni się z tabeli na listę kart.
10. Zostaną zastosowane subtelne animacje (`framer-motion`) przy pojawianiu się elementów.
11. Aktualizacja danych w UI po mutacjach będzie realizowana głównie przez mechanizmy rewalidacji Next.js (`revalidatePath`/`revalidateTag`).
12. Filtrowanie raportów po dacie nie będzie implementowane w MVP.
</decisions>

<matched_recommendations>
1.  **Struktura Projektu (Next.js App Router):** Zdefiniowano klarowną strukturę folderów i routingu, w tym grupy dla tras chronionych i publicznych oraz dedykowany endpoint API dla odświeżania tokenu.
2.  **Uwierzytelnianie i Zarządzanie Sesją:** Określono sposób przechowywania tokenów (httpOnly cookies) i strategię ich odświeżania w celu zapewnienia bezpieczeństwa i ciągłości sesji.
3.  **Zarządzanie Stanem:** Wybrano podejście minimalizujące globalny stan (Zustand dla auth), preferujące lokalny stan i Server Actions z rewalidacją, oraz użycie `react-hook-form` dla standardowych formularzy.
4.  **Generowanie i Edycja Raportów:** Sprecyzowano przepływ tworzenia i edycji raportów, w tym integrację Lexical z Server Actions, `react-hook-form` dla tytułu oraz sanityzację danych.
5.  **Obsługa API i Błędów:** Ustalono standardowy format odpowiedzi Server Actions, sposób wyświetlania błędów (Toasty, komunikaty przy polach) oraz użycie globalnego `ErrorBoundary`.
6.  **Komponenty UI i Stylizacja:** Potwierdzono użycie `shadcn/ui` i Tailwind CSS, zdefiniowano podejście do responsywności (tabela -> karty) oraz dodanie subtelnych animacji.
7.  **Dostępność:** Podkreślono konieczność zapewnienia zgodności ze standardami WCAG.
8.  **Rewalidacja Danych:** Ustalono `revalidatePath`/`revalidateTag` jako główną metodę synchronizacji UI po zmianach danych.
9.  **Komponent RichTextEditor:** Zalecono stworzenie dedykowanego komponentu enkapsulującego Lexical, ułatwiającego integrację.
10. **Struktura Odpowiedzi Server Actions:** Zaakceptowano standardowy format odpowiedzi do spójnej obsługi wyników.
</matched_recommendations>

<ui_architecture_planning_summary>
    **a. Główne wymagania dotyczące architektury UI:**
    Architektura UI ma wspierać podstawowe funkcje aplikacji zdefiniowane w PRD: zarządzanie kontem użytkownika (rejestracja, logowanie, reset/zmiana hasła, profil), generowanie raportów AI na podstawie tekstu, edycję wygenerowanych treści, zapisywanie i zarządzanie historią raportów (przeglądanie listy, szczegółów, usuwanie). Interfejs ma być zbudowany w oparciu o Next.js (App Router), React, TypeScript, Tailwind CSS i bibliotekę komponentów `shadcn/ui`. Kluczowe jest zapewnienie responsywności, dostępności (WCAG) i bezpieczeństwa.

    **b. Kluczowe widoki, ekrany i przepływy użytkownika:**
    *   **Widoki:** `/login`, `/register`, `/reset-password`, `/dashboard` (lub `/reports`), `/reports/generate`, `/reports/[id]`, `/profile`.
    *   **Przepływy:**
        *   *Uwierzytelnianie:* Rejestracja -> Logowanie -> Dostęp do chronionych zasobów -> Wylogowanie; Reset hasła.
        *   *Zarządzanie Raportami:* Wprowadzenie tekstu -> Generowanie raportu (AI) -> Podgląd/Edycja (Lexical + Tytuł) -> Zapis raportu -> Wyświetlenie na liście -> Podgląd szczegółów -> Edycja zapisanego raportu -> Usunięcie raportu.
        *   *Profil:* Podgląd -> Edycja danych profilu.

    **c. Strategia integracji z API i zarządzania stanem:**
    *   **Integracja z API:** Głównie przez Server Actions. Stanowią one warstwę pośredniczącą między UI a endpointami API zdefiniowanymi w `api-plan.md`. Dedykowany API Route zostanie użyty do odświeżania tokenu JWT.
    *   **Zarządzanie Stanem:** Minimalny stan globalny (Zustand dla statusu autoryzacji). Większość stanu zarządzana lokalnie w komponentach (`useState`). Formularze obsługiwane przez `react-hook-form` + `zod`. Edytor Lexical zarządza swoim stanem wewnętrznie. Synchronizacja danych po mutacjach przez rewalidację (`revalidatePath`/`revalidateTag`).

    **d. Kwestie dotyczące responsywności, dostępności i bezpieczeństwa:**
    *   **Responsywność:** Aplikacja musi poprawnie wyświetlać się i funkcjonować na różnych urządzeniach (desktop, tablet, mobile). Widok listy raportów adaptuje się z tabeli do kart.
    *   **Dostępność:** Zgodność ze standardami WCAG, wykorzystanie semantycznego HTML i atrybutów ARIA, testowanie nawigacji klawiaturą i czytnikami ekranu.
    *   **Bezpieczeństwo:** Uwierzytelnianie JWT z tokenami w `httpOnly` cookies, mechanizm odświeżania tokenów, ochrona tras, sanityzacja danych wejściowych z edytora Lexical (`DOMPurify`) po stronie serwera (w Server Action).

    **e. Wszelkie nierozwiązane kwestie lub obszary wymagające dalszego wyjaśnienia:**
    *(Na tym etapie brak zidentyfikowanych, kluczowych nierozwiązanych kwestii dotyczących ogólnej architektury UI. Dalsze szczegóły implementacyjne zostaną doprecyzowane w trakcie rozwoju.)*
</ui_architecture_planning_summary>

<unresolved_issues>
*(Brak)*
</unresolved_issues>
</conversation_summary>