# VANTIA Studio — SEO Setup Guide

## Pliki do dodania do projektu

### 1. sitemap.xml
Zawiera wszystkie podstrony witryny z priorytetami i częstotliwością aktualizacji.
- URL: https://vantia.vercel.app/sitemap.xml

### 2. robots.txt
Dyrektywy dla robotów wyszukiwarek (Google, Yandex, Bing itd.)
- URL: https://vantia.vercel.app/robots.txt

### 3. Structured Data (JSON-LD)
Schematy dla Organization, WebSite, ProfessionalService i FAQPage.
- Zawartość: org-schema.json, portfolio-schema.json
- Lub bezpośrednio w HTML jako `<script type="application/ld+json">`

### 4. SEO Head Templates
Szablony gotowe do wklejenia do index.html i portfolio.html:
- seo-head-template.html
- portfolio-seo-head-template.html

## Co należy zrobić

### A. Zaktualizować index.html
Zamienić sekcję `<head>` na wersję z seo-head-template.html

### B. Zaktualizować portfolio.html
Zamienić sekcję `<head>` na wersję z portfolio-seo-head-template.html

### C. Dodać brakujące pliki
- `favicon.svg` - ikona strony (wektorowa)
- `apple-touch-icon.png` - ikona 180x180px
- `og-image.png` - obrazek Open Graph 1200x630px

### D. Zgłosić sitemap do Google
1. Google Search Console: https://search.google.com/search-console
2. Dodaj właściwość: https://vantia.vercel.app
3. W sekcji "Indeks" > "Sitemaps" wpisz: sitemap.xml

### E. Zgłosić sitemap do Yandex
1. Yandex Webmaster: https://webmaster.yandex.pl
2. Dodaj witrynę i zgłoś sitemap

## Struktura URL
```
https://vantia.vercel.app/              (strona główna, priorytet 1.0)
https://vantia.vercel.app/portfolio.html (portfolio, priorytet 0.9)
```

## Zmienne do dostosowania
1. `og-image.png` - obrazek do social media
2. `favicon.svg` - ikona w pasku przeglądarki
3. Daty `lastmod` w sitemap.xml - aktualizuj przy zmianach
4. `dateCreated` w schema - rok utworzenia strony

## Meta tagi dodane
- title z rozszerzonymi słowami kluczowymi
- description z CTA i cenami
- keywords (mimo że Google ich nie używa, dla innych wyszukiwarek)
- geo.region, geo.country
- theme-color
- robots z pełnymi dyrektywami
- Open Graph dla Facebook/Messenger
- Twitter Cards
- Canonical URLs
- hreflang dla wielu języków
- Preconnect i dns-prefetch

## Structured Data
- Organization (dane firmy/studia)
- WebSite (z potentialAction)
- ProfessionalService (usługi z cennikiem)
- FAQPage (odpowiedzi na częste pytania - może pojawić się w Google)
- CollectionPage dla portfolio
