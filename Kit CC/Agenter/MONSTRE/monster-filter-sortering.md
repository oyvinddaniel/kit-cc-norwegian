---
name: M:filter-sortering
version: 1.0
applies_to:
  paths: []
  contexts: [liste, tabell, søkeresultat, oversikt]
last_reviewed: 2026-05-13
skip_if: liste har <10 elementer og kun én naturlig sortering
ekspert_trigger: [YTELSE-ekspert, UIUX-ekspert]
---

# Mønster: Filter og sortering

> Brukes når brukeren filtrerer eller sorterer data i en liste.
>
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

- Liste har >10 elementer og flere meningsfulle sorteringer
- Bruker trenger å snevre inn etter status, dato, kategori, person, etc.
- Søk på tvers av flere felter er relevant
- Brukere kommer tilbake og ønsker tidligere filter-tilstand

## Når brukes det IKKE

- Korte, statiske lister → unødvendig kompleksitet
- Single-purpose feed uten variasjon → bruk M:liste alene
- Wizard-flyt med faste steg → bruk M:skjema

## Skip-regel

Mønsteret kan hoppes over hvis ALLE er sanne:
- Listen har <10 elementer
- Det finnes kun én naturlig sortering
- Brukeren har ingen behov for å snevre inn

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Hvilke filtre
- Status (aktiv, arkivert, alle)?
- Dato-område (i dag, denne uken, egendefinert)?
- Person (min, andre, alle)?
- Kategori, tags, type?
- Fri tekst-søk?
- Standardvalg: status + fri tekst-søk

### Gruppe 2 — UI for filter
- Chips/tags, dropdown, eller sidepanel?
- Øverst i listen vs. sidebar?
- Flere filtre samtidig: kombineres med "og" eller "eller"?
- Kan brukeren se alle aktive filtre på én gang?
- Hvordan fjernes de (X på hvert, "Tøm alle"-knapp)?

### Gruppe 3 — Sortering
- Hvilke felter kan sorteres etter (dato, navn, status)?
- Stigende eller synkende — kan brukeren toggle?
- Klikk-på-kolonne-header (tabeller) eller egen "Sorter etter"-knapp (kort)?
- Multi-sortering (primær + sekundær)?

### Gruppe 4 — Persistens og deling
- Husker filter neste gang brukeren kommer tilbake?
- Per sesjon eller på tvers av sesjoner?
- Kan brukeren lagre "favoritt-filter"?
- Filter-tilstand i URL (for deling og bokmerker)?

### Gruppe 5 — Tilbakemelding
- Antall synlige vs. totalt ("Viser 23 av 156")?
- Oppdateres mens filter endres?
- Egen melding ved 0 treff etter filter (≠ "ingen data")?

### Gruppe 6 — Mobil
- Filterpanel som slår seg ut fra siden, eller full skjerm?
- Hvor store er klikk-mål? (min 44×44px)

---

## Tilstander (states)

- **Loading** — under filter-anvendelse: behold gamle resultater, vis subtil indikator
- **Empty after filter** — "Ingen treff med disse filtrene. [Tøm filtre]"
- **Error** — filter feilet → behold forrige resultat + feilmelding
- **Success** — oppdatert teller + nye resultater + aria-live kunngjøring
- **Active filter** — visuell badge/chip per aktivt filter med tydelig X

---

## Tilgjengelighet (WCAG 2.2)

Konsulter https://www.w3.org/WAI/WCAG22/quickref/:
- **4.1.3 Status Messages** — aria-live="polite" kunngjør "Filtrerer... 23 resultater"
- **1.3.1 Info and Relationships** — sortering på kolonne-header med aria-sort
- **2.4.7 Focus Visible** — tydelig fokus på filter-kontroller
- **2.1.1 Keyboard** — alle filtre og sortering tastatur-navigerbart [VERIFISER WCAG]
- **3.3.2 Labels or Instructions** — hvert filter har synlig label, ikke kun placeholder

Skjermleser må få vite når sortering endres og hvor mange resultater igjen.

---

## Kanttilfeller

- Filter med 0 treff (skill fra "ingen data overhodet")
- Ugyldig dato-område (til-dato før fra-dato) → valider før sending
- Veldig lange filter-verdier (tekst-søk på 500 tegn)
- URL med ugyldig filter-parameter (delt link) → fall tilbake til default
- Filter brukes mens nye data kommer inn (race) → re-evaluer
- Datasett >100k → serverside-filtering påkrevd
- Debounce ved fri tekst-søk (250-300ms)
- Tilbake-knapp: skal forrige filter-tilstand returnere?

---

## Anti-mønster

- ❌ Filtrere klientside på datasett >5000 → tregt + minne
- ❌ Skjule aktive filtre — bruker mister oversikt
- ❌ Nullstille filter ved sidebytte uten å varsle
- ❌ Live-filtrering uten debounce → API-spam
- ❌ Sortering uten visuell indikator (pil opp/ned) på kolonner

---

## Eksempler

**Eksempel 1: Innboks med chips-filter**
- Chips: "Ulest", "Med vedlegg", "Fra: ___"; sortering via knapp
- Fri tekst-søk øverst, debounce 300ms
- Antall vises: "23 av 156" — oppdateres live

**Eksempel 2: Tabell med kolonne-sortering**
- Klikk på header → toggle stigende/synkende, aria-sort på aktiv
- Sidebar-filter med "og"-logikk, lagret per bruker
- URL: `/saker?status=åpen&sort=dato:desc`

---

## Relaterte mønstre

- M:liste — grunnmønsteret som filter/sortering opererer på
- M:flervalg — bulk-handlinger på filtrert utvalg
- M:filter-sortering — fri tekst-søk på tvers av app

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
