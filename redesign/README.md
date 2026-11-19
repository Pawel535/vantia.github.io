# VANTIA — redesign

Osobna, pełna wersja serwisu do porównania z obecnym `../index.html`.
Nie zastępuje strony produkcyjnej i ma `noindex`.

## Podgląd lokalnie

```bash
cd /mnt/dysk/Zostaje/Programowanie/Strony/Vantia/redesign
python3 -m http.server 8081
```

Otwórz `http://localhost:8081`.

## Zakres

- `index.html` — strona główna,
- `portfolio.html` — lista sześciu koncepcji,
- `blog.html` + `blog/*.html` — listing i pięć artykułów,
- `privacy.html`, `terms.html` — dokumenty prawne,
- `404.html` — strona błędu,
- `demos/*.html` — sześć demo przeniesionych bez zmian, żeby linki z portfolio działały,
- `google5fb8f827439360b7.html` — plik weryfikacji Google.

## Co jest zrobione

- siatka swiss, hairline'y 1 px, bez gradientów, cieni, glassmorphism i zaokrąglonych kart,
- hero z podglądem przykładowej strony kancelarii,
- sekcja zakresu,
- przełączane branże: kancelaria / stomatologia / beauty,
- proces, cennik, formularz z walidacją,
- mobilne menu, klawiaturowa obsługa tabów, kopiowanie e-maila,
- spójny header i footer na wszystkich podstronach,
- artykuły i dokumenty prawne w nowym układzie typograficznym.

## Zgodność z obecną ofertą

- Core: 499 zł dla pierwszych 3 firm, potem 599 zł,
- Expand: 1 499 zł,
- Premium: od 2 499 zł,
- wdrożenie: 48 h od kompletu materiałów,
- 2 rundy poprawek,
- kontakt: `vantia.official@interia.pl`.

## Przed wdrożeniem

- formularz nie ma backendu — podłączyć FormSubmit albo inny endpoint,
- jeśli redesign ma zastąpić produkcję, przenieść style do `styles.css` / `styles.min.css` i przepisać sekcje do istniejącego systemu,
- podmienić dane przykładowe w demach, jeśli mają być publikowane jako realizacje,
- plik weryfikacji Google musi być dostępny w katalogu głównym domeny, nie tylko w `redesign/`.
