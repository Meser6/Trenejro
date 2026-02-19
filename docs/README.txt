# System Planowania Treningów - Kuba

## 🎯 Cel
Przygotowanie do 50km ultra trail we wrześniu/październiku 2026.

## 📋 Jak używać systemu

### 1. Logowanie treningów
**Dopisuj każdy trening do pliku `data/training_log.csv`**

Możesz też logować **opisowo w czacie** (zalecane): wklejasz opis treningu, a asystent
przerabia go na poprawny format CSV, dopytuje o braki i dopisuje wiersz do dziennika.

Szczegółowe instrukcje (modularnie):
- `docs/INSTRUKCJE.txt` (indeks)
- `docs/instructions/10_logowanie_treningow.txt`

Format zgodny z `data/reporting_template_schema_detailed.csv` (ale zbieramy **minimum**, reszta opcjonalna):
- **Minimum**: data, sport, czas, RPE (1–10), ból kolan **w trakcie** (0–10; lewo/prawo/oba), ból Achillesa **następnego ranka** (0–10)
- **Opcjonalnie**: dystans, przewyższenie, tempo, nawierzchnia, ból kolan następnego ranka, notatki (warunki/technika/„po 0/10”)

#### Logowanie opisowe (jak pisać)
Wystarczy tekst w stylu:
„dzisiaj biegłem na bieżni 40 min, 7.3 km, tempo 5:53/km, ból kolan 1/10 podczas i po”.
Asystent:
- rozpozna „dzisiaj/wczoraj” po dacie systemowej (`node scripts/get_date.js`)
- uzupełni pola CSV
- dopyta o brakujące rzeczy (min: data, sport, czas, RPE, ból kolan w trakcie, Achilles następnego ranka; reszta opcjonalna)

### 2. Generowanie planu na tydzień
**W nowym czacie napisz:**
```
Daj mi plan / Wygeneruj plan
```

Asystent:
- Przeczyta `docs/ATHLETE_CONTEXT.txt` (kontekst)
- Przeczyta `data/training_log.csv` (ostatnie treningi)
- Sprawdzi `data/planned_sessions.csv` (czy masz już zaplanowane aktywności w najbliższych dniach)
- Wygeneruje plan na podstawie aktywności, historii, dolegliwości (kolana/Achilles), sezonowości i adaptacji
- Zapisze plan jako JSON w `plans/current_plan.json`, a podgląd jako HTML w `plans/current_plan.html` (nie generujemy żadnych plików `.txt`)
- Wygeneruje CSV w `plans/current_plan.csv`
- Zarchiwizuje JSON+HTML+CSV w `plans/archive/`

**Zakres planu:** zawsze **7 dni rolling** = **dzisiaj + 6 kolejnych dni** (nie „od poniedziałku”).

Szczegółowe instrukcje:
- `docs/instructions/20_generowanie_planu.txt`

### 3. Struktura plików

```
trener/
├── data/                         ← DANE TRENINGOWE
│   ├── training_log.csv         ← TUTAJ DOPISUJESZ TRENINGI
│   └── reporting_template_schema_detailed.csv
├── plans/                        ← PLANY TRENINGOWE
│   ├── current_plan.json        ← Aktualny plan (źródło)
│   ├── current_plan.html        ← Aktualny plan (podgląd)
│   └── archive/                  ← Archiwum planów
│       └── YYYY-MM-DD_plan.(json|html)
├── scripts/                      ← SKRYPTY
│   ├── get_date.js
│   └── read_context.js
│   └── render_plan.js
└── docs/                         ← DOKUMENTACJA
    ├── ATHLETE_CONTEXT.txt      ← Kontekst dla asystenta (nie edytuj)
    ├── README.txt
    ├── INSTRUKCJE.txt           ← Indeks instrukcji
    └── instructions/            ← Moduły instrukcji
        ├── 00_szybki_start.txt
        ├── 10_logowanie_treningow.txt
        ├── 20_generowanie_planu.txt
        └── 30_pliki_i_skrypty.txt
```

## 📝 Przykład użycia

1. **Po treningu:** Otwórz `data/training_log.csv`, dodaj wiersz z danymi treningu
2. **Przed nowym tygodniem:** W nowym czacie napisz "Wygeneruj plan na następny tydzień"
3. **Sprawdź plan:** Otwórz `plans/current_plan.html`

## ⚠️ Ważne
- Zawsze dopisuj treningi do `data/training_log.csv`
- W nowych czatach asystent automatycznie odczyta kontekst
- Plan jest adaptacyjny - zmienia się na podstawie twoich raportów
- Monitoruj kolana i inne dolegliwości - to kluczowe dla planowania

## Preferencje aktywności (lubi/nie lubi)
- Plan będzie (w miarę możliwości) proponował Twoje ulubione aktywności: wspinaczka (ścianka/skała/góry), skitour/narty, bieganie (płasko+trail), rower (szosa), basen, trekking (także z ciężkim plecakiem), squash, sauna (regeneracja), podejścia pod paralotnię.
- Siłownia z ciężarami i ćwiczenia stacjonarne są “nielubiane” — jeśli w planie pojawia się siła, będzie to raczej krótki trening funkcjonalny bez DOMS.

