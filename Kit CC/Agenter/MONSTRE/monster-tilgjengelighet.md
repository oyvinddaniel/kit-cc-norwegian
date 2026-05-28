---
name: M:tilgjengelighet
version: 1.0
applies_to:
  paths: []
  contexts: [ui, skjema, navigasjon, modal, knapp, lenke, media, fokus, autentisering, hjelp]
last_reviewed: 2026-05-13
skip_if: aldri — alle UI-funksjoner krever tilgjengelighet
ekspert_trigger: [TILGJENGELIGHETS-ekspert]
---

# Mønster: Tilgjengelighet (obligatorisk)

> Gjelder alle UI-funksjoner. Standard er WCAG 2.2 AA. Uten dette er appen ubrukelig for minst 10% av brukerne, og kan være ulovlig i mange jurisdiksjoner. Helse/offentlig sektor krever ofte AAA.

---

## Når brukes dette mønsteret
- Alltid når UI bygges, endres eller publiseres
- Når interaktive elementer legges til (knapp, lenke, skjema, modal)
- Når fokus håndteres (popup, tabs, drag-drop, SPA-navigasjon)
- Når autentisering eller hjelp-funksjoner endres

## Når brukes det IKKE
Finnes ikke. Tilgjengelighet er aldri valgfritt for UI.

## Skip-regel
Aldri — alle UI-funksjoner krever tilgjengelighet.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Tastatur og fokus
- Kan alle handlinger nås uten mus? Tab-rekkefølge logisk?
- Escape lukker popup og avbryter pågående handling?
- Fokus alltid synlig (ikke fjernet uten erstatning)?

### Gruppe 2 — Fokus-synlighet (NYE WCAG 2.2)
- 2.4.11 Focus Not Obscured Min (AA): Fokusert element IKKE helt skjult bak sticky-header, footer, cookie-banner, chat-widget?
- 2.4.12 Focus Not Obscured Enhanced (AAA): Fokusert element HELT synlig (ingen del skjult)?
- 2.4.13 Focus Appearance (AAA): Fokus-indikator ≥ 2 CSS-px tykkelse + 3:1 kontrast mot ufokusert?

### Gruppe 3 — Pointer og målstørrelse (NYE WCAG 2.2)
- 2.5.7 Dragging Movements (AA): Alle drag-operasjoner har single-pointer-alternativ (klikk, opp/ned-piler, dropdown)?
- 2.5.8 Target Size Min (AA): Alle trykk-mål ≥ 24×24 CSS-px, ELLER 24-px avstand til naboer? Inline tekst-lenker er unntatt.

### Gruppe 4 — Skjema og autentisering (NYE WCAG 2.2)
- 3.3.7 Redundant Entry (A): Tidligere oppgitt info i samme flyt gjenbrukes (ikke be om samme adresse to ganger)?
- 3.3.8 Accessible Auth Min (AA): Innlogging krever IKKE kognitiv test (huske passord uten passordbehandler, CAPTCHA uten alternativ)? Passordfelt tillater paste/autofill/passordbehandler?
- 3.3.9 Accessible Auth Enhanced (AAA): Heller ingen objektgjenkjenning eller personlig-innhold-bildetest?

### Gruppe 5 — Konsistens og hjelp (NY WCAG 2.2)
- 3.2.6 Consistent Help (A): Hvis hjelp-funksjon (kontakt, chat, FAQ) finnes på flere sider — i samme relative posisjon overalt?

### Gruppe 6 — Skjermlesere og semantikk
- Knapper har meningsfull tekst (ikke "klikk her", ikke kun ikon uten aria-label)?
- Dynamiske endringer via aria-live? Semantisk HTML (h1-h6, button, nav, main, label)?
- Landmarks definert (header, main, nav, footer)?

### Gruppe 7 — Farger, kontrast, bevegelse
- 1.4.3 Contrast Min (AA): Tekst ≥ 4.5:1, stor tekst ≥ 3:1, UI ≥ 3:1
- 1.4.1 Use of Color: Viktig info ikke kun gjennom farge
- 2.3.3 Animation from Interactions: Respekterer prefers-reduced-motion
- 2.3.1 Three Flashes: Ingenting blinker mer enn 3 ganger/sekund

### Gruppe 8 — Skjema-validering
- Labels eksplisitt knyttet (`for`/`id` eller `aria-labelledby`)?
- Feilmeldinger koblet til felt (`aria-describedby`)?
- 3.3.1/3.3.3 Feil-id og forslag tydelige, ikke teknisk sjargong?

### Gruppe 9 — Språk og media
- 3.1.1 `<html lang="...">` satt? Bilder med betydning har alt-tekst, dekorative `alt=""`?
- Video har teksting (1.2.2), lyd har transkript (1.2.1)?

---

## Tilstander
- **Loading** — `aria-busy="true"` + spinner, skjermleser kunngjør
- **Empty** — beskrivende tekst + neste-handling
- **Error** — `role="alert"`/aria-live, fokus flyttes til feilmelding ved skjema-feil
- **Success** — aria-live polite, ikke bare grønn farge
- **Disabled** — `aria-disabled` framfor `disabled`, med forklaring

---

## Tilgjengelighet (WCAG 2.2 AA — påkrevd)

Verifisert mot https://www.w3.org/WAI/WCAG22/quickref/ :

**Eksisterende 2.1-kriterier:** 1.3.1, 1.4.3, 1.4.11, 2.1.1, 2.4.7, 3.3.1-3.3.4, 4.1.2, 4.1.3.

**Nye 2.2-kriterier (publisert okt 2023) — eksplisitt påkrevd:**
- 2.4.11 Focus Not Obscured (Minimum) — AA
- 2.4.12 Focus Not Obscured (Enhanced) — AAA
- 2.4.13 Focus Appearance — AAA
- 2.5.7 Dragging Movements — AA
- 2.5.8 Target Size (Minimum) — AA (24×24 CSS-px)
- 3.2.6 Consistent Help — A
- 3.3.7 Redundant Entry — A
- 3.3.8 Accessible Authentication (Minimum) — AA
- 3.3.9 Accessible Authentication (Enhanced) — AAA

Marker `[VERIFISER WCAG]` ved tvil — fanges av reviewer.

---

## Kanttilfeller
- Sticky-header/footer skjuler fokusert input ved tabbing (2.4.11)
- Drag-drop uten klikk-alternativ (kanban, sortering) bryter 2.5.7
- Ikon-knapp 16×16 px uten padding bryter 2.5.8
- CAPTCHA uten lyd/logikk-alternativ bryter 3.3.8
- Passordfelt med `paste` blokkert bryter 3.3.8
- Hjelp-chat flyttes mellom sider bryter 3.2.6
- Skjermleser-bruker mister kontekst ved SPA-rute-bytte (manglende aria-live)
- 200% zoom på 320 px viewport — sjekk 1.4.10 Reflow

---

## Anti-mønster
- ❌ `outline: none` uten erstatning
- ❌ `<div onclick>` istf `<button>` — ingen tastatur/skjermleser
- ❌ Placeholder som eneste label
- ❌ "Klikk her"-lenker uten kontekst
- ❌ Kun-farge for state (rød=feil, grønn=ok) bryter 1.4.1
- ❌ CAPTCHA uten alternativ; disabled paste i passord — bryter 3.3.8

---

## Eksempler

**1: Slett-knapp i tabellrad** — ≥ 24×24 px (2.5.8), synlig fokus, aria-label "Slett rad 5". Modal: fokus inn, Escape lukker, focus-trap. Etter: aria-live "Rad slettet, angre tilgjengelig".

**2: Innlogging** — autofill aktivert, paste tillatt (3.3.8). Ingen CAPTCHA eller alternativ tilgjengelig. Adresse fra forrige steg gjenbrukes (3.3.7).

**3: Kanban drag-drop** — drag fungerer, MEN hvert kort har også "Flytt til..."-dropdown (2.5.7). Tastatur: piler + Enter flytter.

---

## Relaterte mønstre
- M:mobil-beroring — utvider 2.5.8 for touch
- M:skjema — 3.3.x i dybden
- M:internasjonalisering — lang-attributter og alt-tekst-oversettelse

## Versjon
**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
