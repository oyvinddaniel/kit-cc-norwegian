---
name: M:liste
version: 1.0
applies_to:
  paths: []
  contexts: [liste, tabell, kort-grid, feed, oversikt]
last_reviewed: 2026-05-13
skip_if: aldri (alle mønstre bør anvendes der relevant)
ekspert_trigger: [YTELSE-ekspert, UIUX-ekspert]
---

# Mønster: Liste

> Brukes når en funksjon viser flere elementer (rader, kort, tabell, feed).
>
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

Konkrete triggere:
- Når UI viser ≥2 elementer av samme type (oversikt, innboks, søkeresultat)
- Når brukeren skal velge, sammenligne eller bla gjennom items
- Når data er tabulær eller kortbasert

## Når brukes det IKKE

- Single-detail-view → bruk M:detaljvisning
- Skjemaer med dynamiske felter → bruk M:skjema
- Tre-/hierarki-struktur → vurder dedikert tre-komponent (mønster ikke definert i v3.6.0)

## Skip-regel

Aldri — alle lister må adressere visning, tilstander, tilgjengelighet og ytelse.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Visningsformat
- Tabell, kort eller enkel liste?
- Tetthet: tett (mye info), romslig (lesbart), kompakt (mange)?
- Må elementer være like høye, eller kan de variere?
- Standardvalg hvis ingen preferanse: enkel liste, romslig tetthet

### Gruppe 2 — Innhold per element
- Primær informasjon (alltid synlig)?
- Sekundær informasjon (hover/utvidet)?
- Handlinger (rediger, slett, del) — hvor plasseres de?
- Ikoner eller farger for status?

### Gruppe 3 — Rekkefølge og mengde
- Standard sortering (nyeste først, alfabetisk, prioritert)?
- Kan brukeren endre sortering? Hvis ja → se M:filter-sortering
- Alle på én gang, paginering, eller "last mer"-knapp?
- Hvis paginering: hvor mange per side?

### Gruppe 4 — Interaksjon
- Hva skjer ved klikk på rad?
- Hover-effekter, eller skjult før klikk?
- Høyreklikk-meny?
- Støttes flervalg? Hvis ja → se M:flervalg
- Søkefelt over listen? Live eller etter Enter?

### Gruppe 5 — Endringer over tid
- Nytt element kommer inn — hvor vises det (øverst, sorteringsbasert)?
- Element slettes — animasjon eller umiddelbart?
- Element oppdateres — flasher eller stille?

### Gruppe 6 — Mobil
- Sveip for handlinger?
- Long-press for kontekst-meny?
- Annerledes visning enn web?

---

## Tilstander (states)

- **Loading** — skeleton-rader (matcher endelig layout), ikke spinner
- **Empty** — tydelig melding + primær CTA ("Opprett første X")
- **Error** — feilmelding + "Prøv igjen"-knapp, behold tidligere data hvis mulig
- **Success** — innhold rendres; ved oppdatering: subtil bekreftelse
- **Partial load** — vis det som er lastet, "Laster mer..."-indikator nederst

---

## Tilgjengelighet (WCAG 2.2)

Konsulter https://www.w3.org/WAI/WCAG22/quickref/:
- **1.3.1 Info and Relationships** — semantisk `<table>`/`<ul>`/`<li>` med riktige roller
- **1.3.2 Meaningful Sequence** — tab-rekkefølge følger visuell rekkefølge
- **2.4.7 Focus Visible** — tydelig fokus-indikator på hver rad/element
- **4.1.3 Status Messages** — aria-live ved dynamiske oppdateringer ("Lastet 20 til")
- **2.1.1 Keyboard** [VERIFISER WCAG] — pil-taster for radnavigasjon i tabeller

Skjermleser må kunngjøre: totalt antall, gjeldende posisjon ("rad 3 av 45").

---

## Kanttilfeller

- Null/undefined data fra API, tom liste (0 elementer) → empty state
- Én enkelt rad (ikke vis "1 av 1"-paginering)
- Veldig lange tekstfelter (truncate + tooltip)
- Veldig mange elementer (>1000) → virtualisering påkrevd
- Element slettes/endres mens bruker hover over det
- Optimistisk update + serverside-feil → rollback
- Stale cache etter ekstern endring
- Sortering på felt med null-verdier (hvor plasseres de?)

---

## Anti-mønster

- ❌ Spinner på hele listen ved hver oppdatering — bruk skeleton/inline
- ❌ Skjule handlinger kun bak hover — utilgjengelig på touch/tastatur
- ❌ Rendre 10.000 rader uten virtualisering — fryser nettleser
- ❌ Endre rekkefølge mens bruker scroller — mister kontekst
- ❌ "Tom"-state som ligner "Loading"-state — forvirrer

---

## Eksempler

**Eksempel 1: Innboks med e-poster**
- Tett liste, like høye rader, primær (avsender + emne), sekundær (preview)
- Sortert nyeste først, paginering 50/side
- Klikk åpner detalj, sveip-venstre for slett (mobil)
- Flervalg via avkrysningsboks → bulk-handlinger

**Eksempel 2: Produkt-grid (e-handel)**
- Kort-visning, variabel høyde tillatt, romslig tetthet
- Sortering: relevans (default), pris, popularitet
- Infinite scroll på mobil, "Last mer"-knapp på web
- Filter via M:filter-sortering i sidepanel

---

## Relaterte mønstre

- M:filter-sortering — når brukeren skal filtrere/sortere listen
- M:flervalg — når flere elementer kan velges samtidig
- M:laste-tom-feil — tilstandshåndtering på tvers av mønstre
- M:detaljvisning — visning av enkeltelement etter klikk

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
