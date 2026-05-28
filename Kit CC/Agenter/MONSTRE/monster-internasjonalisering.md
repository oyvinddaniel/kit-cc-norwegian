---
name: M:internasjonalisering
version: 1.0
applies_to:
  paths: []
  contexts: [i18n, l10n, oversetting, flerspraaklig, rtl, locale, valuta, dato, tall, pluralisering]
last_reviewed: 2026-05-13
skip_if: kun hvis appen aldri vil støtte mer enn ett språk OG én locale (sjelden — bruk Intl uansett)
ekspert_trigger: [TILGJENGELIGHETS-ekspert, CROSS-BROWSER-ekspert]
---

# Mønster: Internasjonalisering (i18n)

> Brukes når appen skal støtte flere språk, regioner, eller bare formatering som respekterer brukerens locale.
>
> Selv "norsk-bare" apper bør bygge med i18n-fundament — å rette opp senere er dyrt.

---

## Når brukes dette mønsteret
- Når appen skal oversettes til mer enn ett språk
- Når brukere kan være i ulike land (dato, tall, valuta varierer)
- Når innhold inkluderer RTL-språk (arabisk, hebraisk, persisk, urdu)
- Når juridisk innhold (vilkår, personvern) må lokaliseres

## Når brukes det IKKE
- Intern admin-app, ett team, ett språk → kan utelates (men Intl-API koster lite)
- Statisk landingsside uten interaksjon → forenklet variant

## Skip-regel
Sjelden. Selv enkeltspråk-apper bør bruke `Intl.NumberFormat`/`Intl.DateTimeFormat` for locale-korrekt formatering.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Språk og locale-strategi
- Hvilke språk støttes ved launch? Hvilke senere?
- Locale-deteksjon: `Accept-Language`, IP, brukerprofil, eller eksplisitt valg? (anbefalt: eksplisitt velger + persistert)
- Fallback-språk når oversettelse mangler (typisk engelsk)?
- URL-strategi: `/no/`, `?lang=no`, eller subdomene?

### Gruppe 2 — RTL-støtte
- Skal appen støtte arabisk, hebraisk, persisk eller urdu?
- Bruker du logiske CSS-egenskaper (`margin-inline-start` istf `margin-left`)?
- Retningsikoner (piler, "tilbake") må speilvendes
- `dir="rtl"` på `<html>` eller per-element ved blanding
- Layout (sidebar, breadcrumbs, progress) speilvendes

### Gruppe 3 — Tekst-ekspansjon
- Tysk ~30-50% lengre enn engelsk → knapper og kolonner må romme
- Japansk/kinesisk kortere men trenger annen linjehøyde
- Russisk og finsk har lange sammensatte ord — wrap-strategi?
- Test med dummy-ekspansjon (×1.5) før oversettelse
- Standardvalg: design med ~40% ekspansjons-buffer

### Gruppe 4 — Datoformat
- DD/MM/YYYY (EU, NO) vs MM/DD/YYYY (US) vs YYYY-MM-DD (ISO, JP)?
- Bruk `Intl.DateTimeFormat(locale, options)` — aldri manuell
- Relative tider via `Intl.RelativeTimeFormat`
- Tidssoner: lagre UTC i DB, formater i brukerens TZ
- Ukestart: mandag (EU) vs søndag (US, JP)

### Gruppe 5 — Tallformat og valuta
- Tusenskille: `1,000.50` (US/UK) vs `1.000,50` (DE/NO) vs `1 000,50` (FR)?
- Bruk `Intl.NumberFormat(locale)` — aldri manuell
- Valuta-symbol-plassering: `$100` (US) vs `100 kr` (NO) vs `100 €` (DE)
- Valuta-avrunding: JPY 0 desimaler, BHD 3, EUR/USD/NOK 2 — `Intl` håndterer
- Vis original OG omregnet, eller kun lokal?

### Gruppe 6 — Pluralisering
- Engelsk: 2 former (one/other); norsk: 2 former
- Russisk: 4 former (one/few/many/other); arabisk: 6 (zero/one/two/few/many/other)
- Bruk `Intl.PluralRules` eller ICU MessageFormat — aldri `if (n === 1)`
- Vurder også kjønn og kasus (tysk der/die/das, polsk nominativ/genitiv)

### Gruppe 7 — Bilder, alt-tekst og språk-attributter (WCAG 3.1.1/3.1.2)
- Tekst-i-bilder unngås; bruk SVG `<text>` eller tekst-overlay
- Alt-tekst MÅ være i oversettelses-streng, ikke hardkodet
- Kulturelt sensitive bilder (gester, farger, dyr) vurderes per locale
- 3.1.1 (A): `<html lang="nb-NO">` korrekt satt (BCP 47, ikke `norwegian`)?
- 3.1.2 (AA): Sitater på annet språk merket `<span lang="en">`?

### Gruppe 8 — Skjema, input og verktøy
- Adresseformater varierer (postnr før/etter sted, antall linjer)
- Telefonnummer-formatering per land; navn-rekkefølge (JP/HU = etternavn først)
- E-post: tillat IDN/Unicode-domener?
- i18n-bibliotek (react-i18next, FormatJS/ICU, Vue i18n, next-intl)?
- Oversettelses-plattform (Crowdin, Lokalise, Phrase, Weblate)?
- ICU MessageFormat foretrukket; versjonering og fallback-strategi

---

## Tilstander
- **Loading-translation** — vis fallback-språk/skeleton, aldri rå nøkler
- **Missing-key** — fall til fallback-locale, logg manglende nøkkel
- **RTL-applied** — `dir="rtl"` + speilvendt layout aktivt
- **Locale-switching** — persistér valg, unngå flash-of-untranslated

---

## Tilgjengelighet (WCAG 2.2)
- **3.1.1 Language of Page (A)** — `lang` på `<html>` påkrevd
- **3.1.2 Language of Parts (AA)** — `lang` på elementer med annet språk
- 1.4.5 Images of Text (AA) — unngå tekst-i-bilder
- 1.4.10 Reflow (AA) — RTL-layout reflower også på 320 px
- 1.3.2 Meaningful Sequence (A) — DOM-rekkefølge i RTL stemmer med visuell
- 2.5.8 Target Size (AA) — etter tekst-ekspansjon må knapper fortsatt ≥ 24×24 px

Marker `[VERIFISER WCAG]` ved BCP 47-tvil eller blandet-språk-innhold.

---

## Kanttilfeller
- Bruker bytter språk midt i flyt — state bevares, ikke reset
- Oversettelses-cache stale ved deploy; missing-key faller til fallback
- RTL+LTR blandet (engelsk merke i arabisk) — `<bdi>` eller `unicode-bidi: isolate`
- Tall i RTL skrives fortsatt LTR (123 ikke 321)
- Datoer rundt midnatt + tidssone-bytter (UTC vs lokal vs DST)
- Plural for desimal: "1.5 stars" — `other`-form på engelsk, ikke `one`
- Streng-konkatenasjon bryter grammatikk → bruk full setning per locale
- Sortering: norsk/svensk forskjellig — bruk `Intl.Collator`

---

## Anti-mønster
- ❌ Hardkodet tekst istf oversettelses-nøkkel
- ❌ Streng-konkatenasjon over nøkler — bryter grammatikk
- ❌ `if (count === 1)` — fungerer ikke for russisk/arabisk
- ❌ Manuell datoformat med `padStart` istf `Intl.DateTimeFormat`
- ❌ `margin-left` istf `margin-inline-start` ved RTL
- ❌ Tekst-i-bilder uten oversettelsesplan; mangler `lang`-attributt
- ❌ Pris som "kr 100" overalt — bruk `Intl.NumberFormat`

---

## Eksempler
**1: Pris** — integer i minste enhet (øre/cent) + ISO-currency. Vises via `Intl.NumberFormat(userLocale, {style:'currency', currency:'NOK'})`. JPY rundes til hel automatisk.
**2: Norsk app + arabisk** — logiske CSS-egenskaper fra start (`padding-inline`, `text-align: start`). Retnings-ikoner får `transform: scaleX(-1)` i `[dir="rtl"]`. Tall/merker isoleres med `<bdi>`.
**3: Pluralisering** — ICU: `{count, plural, =0 {Ingen meldinger} one {# melding} other {# meldinger}}`. Russisk legger til `few`+`many` automatisk. Aldri konkatener.

---

## Relaterte mønstre
- M:tilgjengelighet — lang-attributter, RTL, target-size etter ekspansjon
- M:skjema — locale-spesifikke input-formater (adresse, telefon, navn)
- M:mobil-beroring — tastatur-språk-skifte på mobil

## Versjon
**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
