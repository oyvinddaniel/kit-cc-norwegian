# extension-DESIGN-QUALITY v2.0.0

> Stack-agnostisk designkvalitetskontroll for BYGGER-agent Stage 1 (UI).
> Denne filen UTVIDER BYGGER-agent — den erstatter ingenting.
> **v2.0:** Omskrevet fra oppslagsverk til handlingsprotokoll med hard gate og konkrete feil/riktig-eksempler (Gorgeous UI).

---

## HARD GATE — SJEKK FØR ALL UI-KODE (Gorgeous UI)

```
OBLIGATORISK SJEKK — INGEN UNNTAK:

1. Sjekk om designsystem finnes (globals.css med CSS variables)
2. HVIS designsystem IKKE finnes:
   → STOPP. Du har IKKE lov til å skrive UI-kode.
   → Kjør Gorgeous UI-agenten først: Les Kit CC/Agenter/agenter/ekspert/GORGEOUS-UI-ekspert.md
   → VENT til designsystem er generert
3. HVIS designsystem finnes:
   → Verifiser at globals.css eksisterer (inneholder CSS custom properties)
   → Verifiser at globals.css inneholder @theme inline og @custom-variant dark (Tailwind v4)
   → Les token-verdiene fra globals.css
   → ALLE UI-elementer MÅ referere til disse tokenene
```

**Denne gaten er UFRAVIKELIG for alle intensitetsnivåer med UI.**

---

## FORMÅL

Sikre at ALL UI-kode oppfyller grunnleggende designkvalitet uavhengig av teknologi-stack.
Denne extension-filen lastes av BYGGER-agent som Lag 2-ressurs under Stage 1 (UI).

**Aktivering:** Automatisk ved BYGGER-agent Stage 1 for STANDARD+ intensitet.
**Avhengighet:** Krever at Gorgeous UI-agenten har generert designsystem først.

Si tydelig hvilket punkt du er på i oppsettet FØR du fortsetter. Hvert steg her er basert på det vi har sett gå galt når det hoppes over.

---

## IMPLEMENTERINGSPROTOKOLL (steg-for-steg)

Etter at hard gate er passert, følg dette:

```
Steg 1: VERIFISER FILER
   → Les globals.css (eller src/app/globals.css) → Finn alle --color-*, --button-*, --card-* tokens
   → Les globals.css @theme inline blokk → Verifiser at fonter og animasjoner er konfigurert

Steg 2: IMPORTER TOKENS
   → Sørg for at globals.css importeres i appens entry-point (layout.tsx for Next.js)
   → Sørg for at fonter lastes via next/font (aldri Google Fonts CDN direkte — gir layout shift + GDPR-problemer)

Steg 3: BYGG TOKEN-FØRST
   → For HVERT UI-element: bruk semantiske tokens, ALDRI hardkodede verdier
   → Implementer i denne rekkefølgen: Layout → Typografi → Farger → Spacing → Effekter

Steg 4: VALIDER ETTER HVER FIL
   → Mental grep: Finnes text-white, bg-blue-600, text-gray-500 eller lignende?
   → Finnes hardkodede hex (#fff, #000), rgb(), eller hsl() verdier?
   → JA → FIKS umiddelbart. Erstatt med token-referanser.
```

---

## FEIL/RIKTIG-EKSEMPLER (alle token-typer)

### Farger
```
FEIL:  className="bg-blue-600 text-white hover:bg-blue-700"
FEIL:  className="text-gray-500 bg-gray-100"
FEIL:  style={{ color: '#fff', backgroundColor: '#2563eb' }}

RIKTIG: className="bg-[--button-bg] text-[--button-text] hover:bg-[--button-bg-hover]"
RIKTIG: className="text-[--color-text-muted] bg-[--color-surface]"
```

### Borders og radius
```
FEIL:  className="border border-gray-200 rounded-lg"
RIKTIG: className="border border-[--color-border] rounded-[--radius-lg]"
```

### Shadows
```
FEIL:  className="shadow-md"
RIKTIG: className="shadow-[--shadow-md]"
```

### Gradienter
```
FEIL:  className="bg-gradient-to-r from-purple-600 to-blue-500"
RIKTIG: style={{ background: 'var(--gradient-primary)' }}
```

### Fonter
```
FEIL:  className="font-sans" (Tailwind default, ikke prosjektets font)
RIKTIG: className="font-heading" (fra @theme inline i globals.css)
```

### Transitions
```
FEIL:  className="transition duration-300"
RIKTIG: style={{ transition: 'var(--transition-smooth)' }}
```

---

## TO-LAGS ARKITEKTUR (B09)

Design-systemet bruker en to-lags token-arkitektur:

| Lag | Fil | Innhold | Når den lastes |
|-----|-----|---------|----------------|
| Base | Denne filen (`extension-DESIGN-QUALITY.md`) | Stack-agnostiske prinsipper, hard gate, validering | Alltid ved Stage 1 (STANDARD+) |
| Stack-spesifikk | `extension-DESIGN-REACT-TAILWIND.md` | React+Tailwind oppskrifter og wow-faktor | Kun når stack = React+Tailwind |

**Prinsipp:** Base-laget definerer HVA som skal oppnås. Stack-laget definerer HVORDAN.

---

## DESIGN TOKENS — RAW (stack-agnostisk)

> **Merk:** Disse tokenene genereres nå automatisk av Gorgeous UI-agenten.
> Du trenger IKKE definere dem manuelt — les dem fra den genererte `globals.css` med CSS variables.

### Farger

```
RAW TOKENS (abstrakte verdier):

--color-primary:       Prosjektets hovedfarge
--color-primary-hover: Hovedfarge ved hover (mørkere/lysere)
--color-secondary:     Sekundærfarge for accenter
--color-background:    Bakgrunnsfarge
--color-surface:       Overflatefarge (kort, modaler, etc.)
--color-text:          Primærtekst
--color-text-muted:    Sekundærtekst (dempet)
--color-border:        Rammefarge
--color-error:         Feilfarge
--color-success:       Suksessfarge
--color-warning:       Advarselsfarge
```

### Semantiske tokens

```
SEMANTISKE TOKENS (formålsbaserte):

--button-bg:           → maps to --color-primary
--button-bg-hover:     → maps to --color-primary-hover
--button-text:         → maps to kontrast mot --button-bg
--input-bg:            → maps to --color-surface
--input-border:        → maps to --color-border
--input-border-focus:  → maps to --color-primary
--card-bg:             → maps to --color-surface
--card-border:         → maps to --color-border
--nav-bg:              → maps to --color-surface
--error-text:          → maps to --color-error
--success-text:        → maps to --color-success
```

**Regel:** Alle UI-komponenter bruker SEMANTISKE tokens, aldri raw tokens direkte.
Dette gjør det mulig å bytte tema (dark/light) ved å endre raw token-verdiene.

**Semantiske design-tokens er MÅ for FORENKLET og høyere, KAN for MINIMAL:**
Semantiske tokens er KAN for MINIMAL, MÅ for FORENKLET, STANDARD, GRUNDIG og ENTERPRISE (se intensitetstabellen). For MINIMAL kan scope reduseres kraftig eller tokens droppes helt — et lite hobbyprosjekt trenger ikke full token-arkitektur. For FORENKLET+ er prinsippet ikke forhandlingsbart: en app uten semantiske tokens blir umulig å vedlikeholde (tema-bytte blir et mareritt).

### Typografi

```
TYPOGRAFI-SKALA:

--font-family-sans:    System-font stack (sans-serif)
--font-family-mono:    Monospace for kode

--text-xs:             0.75rem / 1rem
--text-sm:             0.875rem / 1.25rem
--text-base:           1rem / 1.5rem
--text-lg:             1.125rem / 1.75rem
--text-xl:             1.25rem / 1.75rem
--text-2xl:            1.5rem / 2rem
--text-3xl:            1.875rem / 2.25rem
--text-4xl:            2.25rem / 2.5rem

--font-weight-normal:  400
--font-weight-medium:  500
--font-weight-semibold: 600
--font-weight-bold:    700
```

### Spacing

```
SPACING-SKALA (konsistent 4px-base):

--space-1:   0.25rem  (4px)
--space-2:   0.5rem   (8px)
--space-3:   0.75rem  (12px)
--space-4:   1rem     (16px)
--space-5:   1.25rem  (20px)
--space-6:   1.5rem   (24px)
--space-8:   2rem     (32px)
--space-10:  2.5rem   (40px)
--space-12:  3rem     (48px)
--space-16:  4rem     (64px)
```

### Border Radius

```
RADIUS-SKALA:

--radius-sm:   0.25rem  (4px)   — subtile avrundinger
--radius-md:   0.375rem (6px)   — buttons, inputs
--radius-lg:   0.5rem   (8px)   — kort, modaler
--radius-xl:   0.75rem  (12px)  — store elementer
--radius-2xl:  1rem     (16px)  — svært runde elementer
--radius-full: 9999px            — piller, avatarer
```

### Shadows

```
SHADOW-SKALA:

--shadow-sm:       Subtil skygge for separasjon
--shadow-md:       Moderat skygge for hevede elementer
--shadow-lg:       Tydelig skygge for modaler/popovers
--shadow-xl:       Dramatisk skygge for floating elementer
--shadow-elegant:  Primærfarge-skygge med transparens (premium-følelse)
--shadow-glow:     Lysende skygge rundt fokuserte/hovede elementer
```

### Gradienter

```
GRADIENT-TOKENS:

--gradient-primary:   Gradient med primærfarge → primærfarge-variant (CTA-knapper, hero)
--gradient-subtle:    Myk bakgrunnsovergang (seksjoner, cards)
--gradient-accent:    Gradient med accentfarge (merkelapper, badges)
```

### Transitions

```
TRANSITION-TOKENS:

--transition-fast:    150ms ease — Mikro-interaksjoner (hover, focus)
--transition-smooth:  300ms cubic-bezier(0.4, 0, 0.2, 1) — Standard overganger
--transition-slow:    500ms ease-out — Større animasjoner (modaler, sideoverganger)
```

---

## DESIGN-TENKNING (FØR KODING)

Før du skriver en eneste linje UI-kode, gjennomfør denne kreative planleggingen:

### Steg 0.1: Inspirasjonsanalyse
- Hva slags app er dette? (SaaS, nettbutikk, dashboard, portfolio, etc.)
- Hvilke kjente apper/nettsider innenfor dette domenet har vakker design?
- Hva kjennetegner designet? (Mørkt/lyst, minimalistisk/rikt, playful/profesjonelt)

### Steg 0.2: Visuell retning
- Velg en fargepalett som passer appens formål og målgruppe
- Bestem gradient-stil (subtile/dramatiske, varme/kalde toner)
- Bestem animasjonsnivå (minimal for verktøy, rikere for forbruker-apper)
- Bestem typografi-stil (sans-serif for moderne, serif for tradisjonelt)

### Steg 0.3: Definer designsystemet FØRST
- Sett opp alle tokens (farger, gradienter, shadows, transitions) FØR du bygger komponenter
- Lag komponent-varianter for knapper, kort og andre nøkkelkomponenter
- Test at designsystemet ser bra ut isolert før du bygger sider

**Regel:** Aldri start med å bygge sider. Start med å bygge et vakert designsystem.

---

## BILDESTRATEGI

### ⚠️ KRITISK REGEL: Ingen placeholders i leveranser

**Du skal ALDRI levere en app med placeholder-bilder, grå bokser eller "Lorem ipsum"-tekst.**
Bilder er en essensiell del av designet. En app uten riktige bilder ser amatørmessig ut uansett hvor bra resten av designet er.

### Bildevalg (les `imageStrategy` fra PROJECT-STATE.json)

`imageStrategy.type` kan være en string ELLER en array (multi-select fra Monitor). Sjekk med "inneholder":

| Inneholder | Hva AI gjør | Fallback |
|-----------|-------------|----------|
| `"replicate"` | Generer bilder via Replicate API (se `extension-REPLICATE-IMAGES.md` for modellvalg og oppsett) | CSS-gradienter + SVG |
| `"own-images"` | Bruker har egne bilder — AI hjelper med plassering, optimalisering og alt-tekst | CSS-gradienter + SVG |
| Tom array/null/`"none"` | Bruk ikoner, SVG-illustrasjoner og CSS-gradienter — ingen bilder i prosjektet | — |

**Merk:** Feltet `imageStrategy.replicateModel` angir hvilken modell som brukes (kun for `replicate`). Feltet `imageStrategy.imagesGenerated` settes til `true` når bilder er generert/plassert. PHASE-GATES blokkerer Fase 4-gate hvis type inneholder `"replicate"` eller `"own-images"` og `imagesGenerated===false`.

### Når skal bilder brukes?

Bilder bør brukes PROAKTIVT — ikke bare når en komponent "trenger" et bilde:

- **Hero-seksjoner:** ALLTID ha et visuelt element (bilde, illustrasjon, eller gradient-kunst)
- **Produktkort:** ALLTID ha produktbilder (generer hvis nødvendig)
- **Brukerprofilbilder:** Bruk avatarer eller generer
- **Bakgrunner:** Bruk subtile bilder eller gradienter for visuell dybde
- **Tomme tilstander:** Bruk illustrasjoner i stedet for bare tekst

### Fallback-hierarki (hvis foretrukket strategi feiler)

```
1. Brukerens valgte strategi (replicate/own-images)
   ↓ feiler?
2. CSS-gradienter + SVG-illustrasjoner (alltid tilgjengelig)
   ↓
ALDRI: Grå bokser, broken image-ikoner, eller "Bilde kommer snart"
```

### Bildekvalitetskrav

- Alle bilder skal ha beskrivende `alt`-tekst
- Bilder skal lazy-loades (`loading="lazy"`)
- Bilder skal ha riktige dimensjoner (unngå layout shift)
- Bilder skal komprimeres for web (WebP når mulig)
- Bilder skal passe appens fargepalett og tone

---

## SEO (Automatisk for webprosjekter)

### MÅ (alle intensitetsnivåer med UI)
- Semantisk HTML: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`
- `<title>` med hovednøkkelord (under 60 tegn)
- Alt-tekst på alle bilder med relevante nøkkelord
- Responsivt design med viewport meta tag
- Én `<h1>` per side som matcher sidens primære formål

### BØR (FORENKLET+)
- `<meta description>` (maks 160 tegn med naturlig nøkkelord)
- Lazy loading for bilder (`loading="lazy"`)
- Rene, beskrivende URL-er (ingen `/page?id=123`)
- Crawlbare interne lenker med beskrivende tekst

### KAN (STANDARD+)
- JSON-LD structured data (produkter, artikler, FAQ)
- Canonical tags for å forhindre duplikat innhold
- Performance-optimalisering (defer non-critical scripts)
- Open Graph meta tags for sosiale medier (`og:title`, `og:image`, etc.)

**Regel:** SEO er ikke noe du legger til etterpå — det bygges inn fra starten med semantisk HTML og riktig struktur.

---

## DESIGNKVALITETS-SJEKKLISTE (Stage 1 avslutning)

Før BYGGER-agent avslutter Stage 1, verifiser:

### Visuell konsistens
- [ ] Alle farger bruker semantiske tokens (ikke hardkodede hex-verdier)
- [ ] Typografi følger skalaen (ingen tilfeldige font-størrelser)
- [ ] Spacing er konsistent (bruker spacing-tokens, ikke tilfeldige px-verdier)
- [ ] Border radius er konsistent på lignende elementer

### Responsivitet
- [ ] Layout fungerer på mobile (320px+)
- [ ] Layout fungerer på tablet (768px+)
- [ ] Layout fungerer på desktop (1024px+)
- [ ] Ingen horisontal scrolling på noen breakpoint
- [ ] Touch-targets er minimum 44x44px på mobil

### Tilgjengelighet (grunnleggende)
- [ ] Alle bilder har alt-tekst
- [ ] Fargekontrast er minimum 4.5:1 for tekst
- [ ] Fokus er synlig for keyboard-navigasjon
- [ ] Skjemafelt har labels (ikke bare placeholder)
- [ ] Interaktive elementer er tilgjengelige med keyboard

### States
- [ ] Alle interaktive elementer har hover-state
- [ ] Alle interaktive elementer har focus-state
- [ ] Loading-states er implementert der relevant
- [ ] Error-states er implementert for forms
- [ ] Empty-states er implementert for lister/tabeller

### Dark mode (hvis relevant)
- [ ] Semantiske tokens byttes ved tema-endring
- [ ] Kontrast er tilstrekkelig i begge temaer
- [ ] Bilder/illustrasjoner fungerer i begge temaer

---

## KOMPONENT-KVALITETSKRAV

### Buttons
- Primær, sekundær og ghost-variant
- Hover, focus, active, disabled states
- Loading-state med spinner
- Konsistent padding og tekststørrelse

### Forms
- Label over felt (ikke bare placeholder)
- Inline feilmelding under felt
- Visuell indikasjon av påkrevde felt
- Konsistent bredde og spacing
- Focus-ring ved keyboard-navigasjon

### Kort (Cards)
- Konsistent padding og radius
- Hover-effekt hvis klikkbar
- Konsistent overskrift/innhold-hierarki

### Navigasjon
- Tydelig aktiv side-indikator
- Responsiv (hamburger på mobil)
- Keyboard-navigerbar

### Modale dialoger
- Bakgrunnsoverlegg (overlay)
- Lukk-knapp og Escape-tastatur
- Fokus-felle (focus trap)
- Animert inn/ut

---

## DESIGN-PRINSIPPER (universelle)

### ⚠️ UFRAVIKELIG REGEL: Designsystemet er ALT

**Du skal ALDRI skrive ad hoc-stiler direkte i komponenter.** All styling defineres i designsystemet (tokens, CSS custom properties, komponent-varianter). Ingen `text-white`, `bg-black`, `text-gray-500` eller andre hardkodede farger i className. Alt må gå gjennom semantiske tokens.

- ❌ `<button className="bg-blue-600 text-white hover:bg-blue-700">`
- ✅ `<button className="bg-[--button-bg] text-[--button-text] hover:bg-[--button-bg-hover]">`

Hvis du trenger en ny farge, gradient eller effekt → definer den som token i designsystemet FØRST, bruk den i komponenten ETTERPÅ. Oppdater designsystemet så ofte som nødvendig for å unngå kjedelig design.

### Kjerneprinsipper

1. **Konsistens over kreativitet** — Samme type element skal se likt ut overalt
2. **Progressiv avsløring** — Vis kun det brukeren trenger akkurat nå
3. **Visuelt hierarki** — Det viktigste skal synes først (størrelse, farge, plassering)
4. **Hvitrom er design** — Gi elementer plass til å puste
5. **Tilgjengelighet er funksjonalitet** — Utilgjengelig = ødelagt
6. **Bilder er design** — Placeholder-bilder ødelegger hele inntrykket (se BILDESTRATEGI)

---

## INTENSITETSTILPASNING

| Krav | MINIMAL | FORENKLET | STANDARD | GRUNDIG | ENTERPRISE |
|------|---------|-----------|----------|---------|------------|
| Semantiske tokens | KAN | BØR | MÅ | MÅ | MÅ |
| Responsivitet | BØR | MÅ | MÅ | MÅ | MÅ |
| Tilgjengelighet | KAN | BØR | MÅ | MÅ | MÅ |
| Dark mode | IKKE | KAN | BØR | BØR | MÅ |
| Alle states | KAN | BØR | MÅ | MÅ | MÅ |
| Design-sjekkliste | IKKE | KAN | MÅ | MÅ | MÅ |

---

## FOR BYGGER-AGENT: INTEGRASJON

```
STAGE 1 (UI) — MED DESIGN-QUALITY:

0. DESIGN-TENKNING (FØR koding):
   a) Analyser appens karakter — hva slags design passer?
   b) Velg visuell retning (fargepalett, gradient-stil, animasjonsnivå)
   c) Definer HELE designsystemet FØR du bygger komponenter
      → Farger, gradienter, shadows, transitions, radius, spacing
   d) Les imageStrategy fra PROJECT-STATE.json

1. Les designkrav fra mission briefing
2. Les denne filen (extension-DESIGN-QUALITY.md)
3. HVIS stack = React+Tailwind → Les også extension-DESIGN-REACT-TAILWIND.md (les og følg instruksjonene)
4. Sett opp designsystem med ALLE tokens (inkl. gradienter, glow, transitions)
5. Lag komponent-varianter FØRST (primær, sekundær, hero, premium)
6. Bygg UI-komponenter med tokens og varianter
7. Generer/hent bilder basert på imageStrategy — ALDRI placeholder
8. Kjør design-sjekkliste før Stage 1 avslutning
9. Dokumenter eventuelle avvik med begrunnelse
```

---

*Versjon: 2.0.0*
*Opprettet: 2026-02-14*
*Oppdatert: 2026-02-20*
*Formål: Stack-agnostisk designkvalitetskontroll for BYGGER-agent Stage 1 — med hard gate og handlingsprotokoll*
*Beslutning: B09 (Two-layer token-arkitektur), B10 (Design wow-faktor), Gorgeous UI-agent*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
