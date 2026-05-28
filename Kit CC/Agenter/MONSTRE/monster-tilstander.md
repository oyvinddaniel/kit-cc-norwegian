---
name: M:tilstander
version: 1.0
obligatorisk: true
applies_to:
  paths: []
  contexts: ["alle UI-komponenter"]
last_reviewed: 2026-05-13
skip_if: aldri — alle interaktive flater må dekke relevante tilstander
ekspert_trigger: [TEST-GENERATOR-ekspert, UIUX-ekspert, BRUKERTEST-ekspert]
---

# Mønster: UI-tilstander (OBLIGATORISK kjernemønster)

> **Obligatorisk for ALLE interaktive flater.** NN/g rangerer manglende
> tilstandsdekning som #1 oversett UX-flate. Material 3 og IBM Carbon
> definerer dette som basis-kontrakt. "Vi tegner kun success-stien" er
> hovedårsaken til at apper føles uferdige.

---

## Når brukes dette mønsteret

ALLTID. Hver interaktiv flate — knapp, skjema, liste, kort, modal, navigasjon
— må dekke de tilstandene som er relevante.

## Når brukes det IKKE

Kun rent dekorativt, ikke-interaktivt innhold (statisk bilde uten klikk).

## Skip-regel

**Aldri.** Obligatorisk. PHASE-GATES validerer dekning. Hvis en tilstand ikke
gjelder, må det dokumenteres med begrunnelse.

---

## Tilstander (de seks kjerne-tilstandene)
### 1. Loading (lasting)
- **Spinner** når struktur er ukjent eller varighet er kort (<1 sek)
- **Skeleton** når layout er forutsigbar og varighet >500 ms (lett shimmer)
- **Progress-bar** når fremdrift er målbar; **Inline** i knapp for ett-element-handlinger
- <200 ms: ingen indikator. >5 sek: progress + "tar litt tid"
- Disable interaksjon. Aria: `aria-busy="true"`

### 2. Empty (tomt)
- **Vennlig overskrift** — ikke "Ingen resultater"; forklar fra brukerens side
- **Onboarding-prompt** for førstegangs-bruker
- **Neste-handling-CTA** — alltid synlig (opprett / fjern filter / importer)
- **Differensier**: aldri-data vs filter-tom vs alt-slettet
- Valgfri illustrasjon — fjern hvis distraherende

### 3. Error (feil)
- **Menneskespråk** — aldri "HTTP 500" eller "null pointer"
- **Identifiser** hva som skjedde (WCAG 3.3.1)
- **Recovery-action** primær: prøv igjen. **Alternativ rute**: gå tilbake / kontakt
- Feilkode skjult bak "Detaljer" for støtte
- Aria: `role="alert"` eller `aria-live="assertive"`

### 4. Success (suksess)
- **Bekreftelse** kort og konkret: "Lagret", "Sendt", "Slettet"
- **Neste-steg-suggestion** — "Lagret. Del nå?"
- **Varighet** toast 3-5 sek, inline 2-3 sek, banner til lukket
- **Angre** hvis destruktiv (se M:angre). Aria: `aria-live="polite"`

### 5. Disabled (deaktivert)
- **Visuell**: opasitet 38-50% + cursor `not-allowed`
- **Tooltip med hvorfor** — obligatorisk; ikke la bruker gjette
- **Tastatur-fokuserbar** — så skjermleser kan lese forklaring
- **Aldri skjul** hvis handling kan bli aktiv senere
- Aria: `aria-disabled="true"`. Kontrast 3:1 for ikke-tekst

### 6. Skeleton (plassholder)
- Form matcher endelig innhold (tittel-boks, tekst-linjer, bilde-plass)
- **Lett shimmer** — subtil gradient; respekter `prefers-reduced-motion`
- 3-5 placeholder-items, ikke flom skjermen
- Bruk over spinner når layout er kjent og varighet >500 ms
- Reduserer opplevd ventetid ~30% (NN/g)

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Hvilke tilstander gjelder
- Henter data? → Loading + Empty + Error obligatorisk
- Utfører handling? → Loading (inline) + Success + Error obligatorisk
- Kan handling være utilgjengelig? → Disabled obligatorisk
- Varighet >500 ms? → Skeleton anbefalt over spinner

### Gruppe 2 — Per-tilstand detaljer
- Loading: spinner eller skeleton? Hvor vises indikator?
- Empty: hvilke situasjoner finnes? CTA per situasjon?
- Error: hvilke feiltyper (nettverk, 401, 403, 404, 500, timeout, validering)? Recovery per type?
- Disabled: hvilke betingelser? Tooltip-tekst per betingelse?

---

## Tilgjengelighet (WCAG 2.2)

- **4.1.3 Status Messages** — KJERNE: tilstandsendringer kunngjøres uten fokusbytte (`aria-live`, `role="status"`/`role="alert"`)
- **2.2.1 Timing Adjustable** — loading-timeout og auto-dismiss kan pauses/forlenges
- **2.4.6 Headings and Labels** — empty må ha tydelig overskrift
- **3.3.1 Error Identification** — error må identifisere hva som gikk galt
- **3.3.3 Error Suggestion** — error må foreslå handling
- **1.4.1 Use of Color** — aldri kun farge; alltid ikon + tekst
- **2.3.3 Animation from Interactions** — skeleton respekterer `prefers-reduced-motion`

---

## Kanttilfeller

- Lasting >30 sek → timeout + retry. Bruker slettet alt selv → bekreftende tekst
- Filter ga 0 treff på liste med data → ulik tekst fra "aldri data"
- Disabled aktiveres mens bruker hover → oppdater tooltip umiddelbart
- Race condition: ny lasting før forrige fullføres → kanseller forrige
- Skjermleser + skeleton → `aria-busy` på region, ikke per skeleton
- Mobil disabled-tooltip → må kunne trigges med long-press
- Offline → offline-banner + cached data, ikke generisk error

---

## Anti-mønster

- "Vi tegner kun success-stien" → hovedårsaken til uferdig opplevelse
- Spinner uendelig uten timeout. "Ingen resultater" uten kontekst/CTA
- Skjult disabled-knapp i stedet for visuelt deaktivert → bryter mental modell
- Disabled uten tooltip. Skeleton uten shimmer eller med voldsom animasjon
- Teknisk feilmelding ("ECONNREFUSED") → ikke-menneskelig

---

## Eksempler

**Eksempel 1: Liste (henter data)** — Loading: 5 skeleton-rader m/shimmer, `aria-busy`. Empty: "Her vil opptakene dine dukke opp. [Start første]". Error: Banner "Kunne ikke laste. [Prøv igjen] [Gå tilbake]" + role="alert". Success: standard rendering.

**Eksempel 2: Send-knapp (handling)** — Loading: spinner inline, label "Sender…". Success: Toast "Sendt — Se status →" 4 sek, `aria-live="polite"`. Error: inline feilmelding + knapp re-aktiveres. Disabled: opasitet 50%, tooltip "Fyll ut obligatoriske felt", `aria-disabled`.

**Eksempel 3: Dashbord-kort** — Loading: skeleton matcher layout (tittel + 2 tall + graf). Empty: "Ingen data denne perioden. [Endre periode]". Error: inline "Kunne ikke laste seksjonen. [Prøv igjen]". Success: standard innhold.

---

## Relaterte mønstre

- M:laste-tom-feil — utdypning av Loading/Empty/Error for data-skjermer
- M:tilbakemelding — utdypning av Success-tilstand for handlinger
- M:angre — recovery knyttet til Success/Error

## Versjon

**v1.0** — 2026-05-13 — KJERNEMØNSTER, obligatorisk for alle UI-komponenter

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
