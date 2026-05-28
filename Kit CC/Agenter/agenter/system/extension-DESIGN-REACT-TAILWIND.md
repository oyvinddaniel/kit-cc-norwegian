# extension-DESIGN-REACT-TAILWIND v2.0.0

> React + Tailwind CSS-spesifikk designimplementering med wow-faktor-oppskrifter.
> Denne filen UTVIDER extension-DESIGN-QUALITY.md for React+Tailwind-prosjekter.
> **v2.0:** Gorgeous UI-agent-integrasjon. Token-baserte oppskrifter. OKLCH med HSL fallback.

---

## GORGEOUS UI-AGENT-INTEGRASJON

Gorgeous UI-agenten genererer automatisk:
- `globals.css` — Alt i én fil: CSS custom properties (OKLCH), `@theme inline` (Tailwind v4 config), `@custom-variant dark` (dark mode), komponentklasser, keyframes

**Tailwind v4 bruker CSS-first config.** Alt defineres i globals.css — ingen `tailwind.config.ts` nødvendig for farger, dark mode eller tema.

**Du trenger IKKE sette opp tokens manuelt.** Les globals.css og bygg videre.

**Fonter:** Bruk alltid `next/font` — aldri Google Fonts CDN direkte (layout shift + GDPR).

---

## FORMÅL

Gi BYGGER-agent konkrete implementeringsoppskrifter for å bygge visuelt imponerende UI med React og Tailwind CSS. Inkluderer 2026 designtrender og wow-faktor-komponenter.

**Aktivering:** Automatisk når stack = React + Tailwind CSS i PROJECT-STATE.json.
**Avhengighet:** Krever at `extension-DESIGN-QUALITY.md` (base-laget) er lastet først + Gorgeous UI-agenten har kjørt.

Si tydelig hvilket punkt du er på i oppsettet FØR du fortsetter. Hvert steg her er basert på det vi har sett gå galt når det hoppes over.

---

## TAILWIND v4 — NYE MULIGHETER

### OKLCH Farger (Tailwind v4)
```css
/* Tailwind v4 bruker OKLCH som standard — bredere fargerom, bedre gradienter */
@theme {
  --color-primary: oklch(0.65 0.25 260);
  --color-primary-hover: oklch(0.55 0.25 260);
  --color-accent: oklch(0.75 0.18 160);
}
```

**Fordel over hex/rgb:** Perseptuelt jevne gradienter, bedre kontrast-kontroll, rikere fargepalett.

### CSS Custom Properties med Tailwind
```html
<!-- Semantiske tokens implementert med Tailwind v4 -->
<button class="bg-[--button-bg] hover:bg-[--button-bg-hover] text-[--button-text]">
  Klikk meg
</button>
```

### OKLCH Kontrast-validering

OKLCH farger gir deg full kontroll over lightness (L-verdien), som direkte påvirker kontrast. WCAG AA krever minimum kontrastforhold:

- **Normal tekst:** 4.5:1 (L-diff ≥ 0.4 typisk)
- **Stor tekst (≥18px bold):** 3:1 (L-diff ≥ 0.3 typisk)
- **UI-komponenter (ikoner, borders):** 3:1

**Validering-sjekkliste:**
1. Test med [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — lim inn eksakte OKLCH-verdier
2. Eller: Bruk DevTools → Inspect → Accessibility panel (innebygd kontrast-checker i moderne nettlesere)
3. Verifiser at alle tekstfarger oppfyller minimum krav
4. Verifiser at interaktive elementer (buttons, links) har tilstrekkelig kontrast i både default og hover-tilstand
5. Logg resultater i design-dokumentasjonen for referanse

**Eksempel — test en OKLCH-kombinasjon:**
```
Bakgrunn: oklch(0.13 0.02 260)      — L=0.13 (mørk)
Tekst:    oklch(0.95 0 0)           — L=0.95 (lys)
Kontrast: ~18:1 ✅ WCAG AAA
```

---

## WOW-FAKTOR OPPSKRIFTER (B10)

### Oppskrift 1: Dark Glassmorphism Card
```jsx
<div className="relative group">
  {/* Bakgrunnsblur + border gradient — bruker designsystem-variabler */}
  <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]
                  rounded-xl blur opacity-30 group-hover:opacity-60
                  transition duration-500" />
  <div className="relative bg-black/80 backdrop-blur-xl rounded-xl
                  border border-white/10 p-6">
    <h3 className="text-[--color-text] font-semibold">Innhold her</h3>
  </div>
</div>
```

⚠️ **Viktig:** Bruk ALLTID CSS-variabler (`var(--color-*)`) i gradienter, ikke hardkodete Tailwind-farger. Dette sikrer at gradientene oppdateres når du endrer designsystemet.

**Når:** Hero sections, feature cards, pricing cards
**Forutsetter:** Dark theme, Tailwind v4.0+

### Oppskrift 2: Mesh Gradient Bakgrunn

⚠️ **Forutsetning:** Mesh Gradient krever `animate-blob` definert i globals.css (via `@theme inline` og `@keyframes`). Uten denne konfigurasjonen vises gradienten statisk (ingen animasjon).

```jsx
{/* Tilpass fargene til ditt designsystem — bruk brand-farger fra globals.css */}
<div className="relative min-h-screen overflow-hidden">
  <div className="absolute inset-0 bg-bg-base">
    <div className="absolute top-0 -left-4 w-72 h-72 bg-brand
                    rounded-full mix-blend-screen filter blur-xl
                    opacity-30 animate-blob" />
    <div className="absolute top-0 -right-4 w-72 h-72 bg-brand
                    rounded-full mix-blend-screen filter blur-xl
                    opacity-20 animate-blob animation-delay-2000" />
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-subtle
                    rounded-full mix-blend-screen filter blur-xl
                    opacity-30 animate-blob animation-delay-4000" />
  </div>
  <div className="relative z-10">
    {/* Innhold over gradienten */}
  </div>
</div>
```

**Tailwind v4 config for animate-blob (i globals.css):**
```css
/* I globals.css — inne i @theme inline blokken */
@theme inline {
  --animate-blob: blob 7s infinite;
}

/* Utenfor @theme inline */
@keyframes blob {
  0%   { transform: translate(0px, 0px) scale(1); }
  33%  { transform: translate(30px, -50px) scale(1.1); }
  66%  { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
```

### Oppskrift 3: Micro-interaction Button
```jsx
{/* Tilpass farger til ditt designsystem */}
<button className="relative px-6 py-3 font-medium text-white
                   bg-brand rounded-lg overflow-hidden group
                   transition-transform duration-300
                   hover:shadow-[0_0_30px_var(--brand)]
                   active:scale-95">
  {/* Shine-effekt ved hover */}
  <span className="absolute inset-0 w-full h-full
                   bg-gradient-to-r from-transparent via-white/20 to-transparent
                   -translate-x-full group-hover:translate-x-full
                   transition-transform duration-700" />
  <span className="relative">Klikk meg</span>
</button>
```

**Når:** CTA-knapper, primærhandlinger
**Forutsetter:** Tailwind v3.4+

### Oppskrift 4: Animated Border Gradient

⚠️ **Forutsetning:** Animated Border Gradient krever `animate-gradient` definert i globals.css (via `@theme inline` og `@keyframes`). Uten denne konfigurasjonen vises gradienten statisk (ingen animasjon).

```jsx
{/* Tilpass fargene til ditt designsystem — bruk tokens fra globals.css */}
<div className="relative p-[1px] rounded-xl
                bg-[length:200%_200%] animate-gradient"
     style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-accent), var(--color-primary))' }}>
  <div className="bg-[--color-surface] rounded-xl p-6">
    <p className="text-[--color-text]">Innhold med animert border</p>
  </div>
</div>
```

**Tailwind v4 config for animate-gradient (i globals.css):**
```css
/* I globals.css — inne i @theme inline blokken */
@theme inline {
  --animate-gradient: gradient 3s ease infinite;
}

/* Utenfor @theme inline */
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
```

---

## KOMPONENT-BIBLIOTEK STRATEGI (B10)

### Anbefalt stack
```
shadcn/ui          — Basis-komponenter (tilgjengelig, tilpassbar)
  +
Aceternity UI      — Wow-faktor-komponenter (animasjoner, 3D-effekter)
  ELLER
Magic UI           — Alternativ til Aceternity (lettere)
  +
Framer Motion      — Avanserte animasjoner og overganger
```

### Aceternity vs Magic UI — Når bruker du hva?

| Kriterium | Aceternity UI | Magic UI |
|-----------|--------------|----------|
| **Kompleksitet** | Komplekse, avanserte animasjoner | Enklere komponenter |
| **Visuell stil** | Very premium, 3D-effekter, imponerende | Modern, minimalistisk, elegant |
| **Setup-tid** | Mer manuell integrasjon | Raskt å komme i gang |
| **Bundlestørrelse** | Større (mer JavaScript) | Mindre |
| **Best for** | Hero sections, landing pages, showrooms | Alle standard UI, apps |

**Anbefalinger etter intensitet:**
- **MINIMAL / STANDARD:** Magic UI (raskt, enkelt, får jobben gjort)
- **STANDARD+ / GRUNDIG / ENTERPRISE:** Aceternity UI (mer imponerende, bedre for landing pages / premium apps)
- **Kombinert:** Bruk Magic UI for daglig UI, Aceternity kun for hero-seksjoner

**Regel:** Wow-faktor er like aktuelt som smørbrød på dessert — bruk det sparsomt for maksimal effekt!

---

### Installasjon
```bash
# shadcn/ui (basis)
npx shadcn@latest init
npx shadcn@latest add button card dialog input

# Framer Motion (animasjoner)
npm install framer-motion

# Aceternity UI (wow-faktor) — kopier komponenter manuelt
# https://ui.aceternity.com/components
```

### Prioriteringsrekkefølge
1. **shadcn/ui** for alle standardkomponenter (buttons, forms, dialogs, etc.)
2. **Framer Motion** for overganger, page transitions, list animations
3. **Aceternity/Magic UI** for hero sections, feature showcases, landing pages

**Regel:** Bruk Aceternity/Magic UI sparsomt — wow-faktor mister effekt ved overbruk.

---

## FRAMER MOTION OPPSKRIFTER

### Page Transition
```jsx
import { motion, AnimatePresence } from "framer-motion";

function PageWrapper({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Staggered List Animation
```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function AnimatedList({ items }) {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map((i) => (
        <motion.li key={i.id} variants={item}>{i.name}</motion.li>
      ))}
    </motion.ul>
  );
}
```

### Hover Card Effect
```jsx
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
>
  {/* Card content */}
</motion.div>
```

---

## DESIGNSYSTEM-OPPSETT FOR NYE PROSJEKTER

### Fil-struktur
```
src/
├── styles/
│   ├── globals.css          ← Tokens + Tailwind imports
│   └── animations.css       ← Egendefinerte animasjoner
├── components/
│   ├── ui/                  ← shadcn/ui komponenter
│   ├── effects/             ← Wow-faktor-komponenter (Aceternity)
│   └── layout/              ← Layout-komponenter (Nav, Footer, etc.)
└── lib/
    └── utils.ts             ← cn() helper fra shadcn
```

### globals.css mal
```css
@import "tailwindcss";

@layer base {
  :root {
    /* ===== RAW TOKENS ===== */
    --color-primary: oklch(0.65 0.25 260);
    --color-primary-hover: oklch(0.55 0.25 260);
    --color-primary-glow: oklch(0.75 0.20 260);
    --color-accent: oklch(0.75 0.18 160);
    --color-background: oklch(0.13 0.02 260);
    --color-surface: oklch(0.18 0.02 260);
    --color-text: oklch(0.95 0 0);
    --color-text-muted: oklch(0.65 0 0);
    --color-border: oklch(0.3 0.02 260);

    /* ===== SEMANTISKE TOKENS ===== */
    --button-bg: var(--color-primary);
    --button-bg-hover: var(--color-primary-hover);
    --card-bg: var(--color-surface);
    --card-border: var(--color-border);
    --input-bg: var(--color-surface);
    --input-border: var(--color-border);
    --input-border-focus: var(--color-primary);

    /* ===== GRADIENTER ===== */
    --gradient-primary: linear-gradient(135deg, var(--color-primary), var(--color-primary-glow));
    --gradient-subtle: linear-gradient(180deg, var(--color-background), var(--color-surface));
    --gradient-accent: linear-gradient(135deg, var(--color-primary), var(--color-accent));

    /* ===== SHADOWS MED FARGE ===== */
    --shadow-elegant: 0 10px 30px -10px oklch(0.65 0.25 260 / 0.3);
    --shadow-glow: 0 0 40px oklch(0.75 0.20 260 / 0.4);

    /* ===== TRANSITIONS ===== */
    --transition-fast: 150ms ease;
    --transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 500ms ease-out;
  }
}
```

### ⚠️ FARGEBUG-BESKYTTELSE

En av de vanligste AI-feilene er å blande fargeformater:

```
❌ FEIL (Tailwind v3-mønster — IKKE bruk dette):
   index.css:    --primary: 220 70% 50%        (HSL-verdier)
   tailwind.config:  primary: "hsl(var(--primary))"

❌ FEIL: RGB-verdier i HSL-wrapper
   index.css:    --primary: 59 130 246          (RGB-verdier!)
   tailwind.config:  primary: "hsl(var(--primary))"  ← GIR HELT FEIL FARGER

✅ RIKTIG (Tailwind v4): Bruk ALLTID OKLCH i globals.css + @theme inline
   globals.css:  --brand: oklch(0.65 0.25 260)
   @theme inline: --color-brand: var(--brand);
   Tailwind-klasser: bg-brand, text-brand (registrert automatisk via @theme)

SJEKK ALLTID: At OKLCH-verdier i :root/.dark matcher @theme inline-mappingene
```

### 🔍 Debugging: Farger ser gale ut?

Hvis farger i appen ikke matcher designsystemet, følg denne prosedyren:

1. **Åpne DevTools** (F12 i nettleseren)
2. **Gå til Elements-fanen** → Høyreklikk på et element med feil farge → "Inspect"
3. **Sjekk Computed-panelet** → Søk etter `--color-` eller `--button-` variablene
4. **Verifiser verdiene:**
   - Stemmer de med globals.css definisjonen?
   - Er det RGB, HSL eller OKLCH? (Skal være OKLCH med Tailwind v4)
5. **Hvis verdiene er gale:**
   - Sjekk at globals.css er korrekt lastet (ikke skriv-feil i CSS)
   - Sjekk at @theme inline i globals.css mapper CSS-variablene korrekt
6. **Hvis formatet er galt (RGB i stedet for OKLCH):**
   - Se FARGEBUG-BESKYTTELSE-seksjonen over — fix fargeformatet
   - Rebuild appen etter endring

**Eksempel av debugging-output:**
```
FEIL: --color-primary viser "rgb(139, 92, 246)" i DevTools
      Men globals.css sier "oklch(0.65 0.25 260)"
      → Sjekk at @theme inline i globals.css mapper variabelen korrekt

RIKTIG: --color-primary viser "oklch(0.65 0.25 260)" i DevTools
        Og det er akkurat det som er definert i globals.css ✅
```

---

## INTENSITETSTILPASNING

> **Konfliktløsning:** Denne tabellen definerer stack-spesifikke tilleggskrav for React+Tailwind. Ved konflikt med extension-DESIGN-QUALITY.md gjelder det STRENGESTE kravet (highest level wins). Eksempel: Hvis DESIGN-QUALITY sier BØR og denne tabellen sier MÅ for samme nivå, gjelder MÅ.

| Krav | MINIMAL | FORENKLET | STANDARD | GRUNDIG | ENTERPRISE |
|------|---------|-----------|----------|---------|------------|
| shadcn/ui basis | KAN | BØR | MÅ | MÅ | MÅ |
| Tailwind tokens | KAN | BØR | MÅ | MÅ | MÅ |
| Framer Motion | IKKE | KAN | BØR | MÅ | MÅ |
| Wow-faktor (Aceternity) | IKKE | IKKE | KAN | BØR | BØR |
| OKLCH farger | IKKE | KAN | BØR | MÅ | MÅ |
| Dark mode | IKKE | KAN | BØR | MÅ | MÅ |
| Animerte overganger | IKKE | KAN | BØR | MÅ | MÅ |

---

## KOMPONENT-VARIANTER (shadcn/ui)

shadcn-komponenter er laget for å tilpasses. Lag varianter som bruker designsystemet:

### Button-varianter
```tsx
// I button.tsx — legg til varianter som bruker designsystem-tokens
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "bg-[--button-bg] text-[--button-text] hover:bg-[--button-bg-hover]",
      secondary: "bg-[--color-surface] text-[--color-text] border border-[--color-border]",
      ghost: "hover:bg-[--color-surface] text-[--color-text-muted]",
      // NYE varianter med wow-faktor:
      premium: "bg-[--gradient-primary] text-white shadow-[--shadow-elegant] hover:shadow-[--shadow-glow] transition-[--transition-smooth]",
      hero: "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm",
    }
  }
})
```

### Card-varianter
```tsx
// Glass-variant for premium-kort
const cardVariants = {
  default: "bg-[--card-bg] border border-[--card-border] rounded-xl",
  glass: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl",
  elevated: "bg-[--card-bg] shadow-[--shadow-elegant] rounded-xl hover:shadow-[--shadow-glow] transition-[--transition-smooth]",
}
```

**Regel:** Lag varianter for ALLE tilstander en komponent kan ha. Aldri skriv ad hoc-stiler.

---

## JSON-LD STRUCTURED DATA I REACT

### Eksempel: JSON-LD for produktside

JSON-LD (Linked Data) hjelper søkemotorer forstå innholdet ditt. I React bruker du `dangerouslySetInnerHTML`:

```tsx
// components/ProductJsonLd.tsx
interface ProductJsonLdProps {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  ratingValue: number;
  reviewCount: number;
}

function ProductJsonLd({
  name,
  description,
  price,
  imageUrl,
  ratingValue,
  reviewCount,
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: name,
    description: description,
    image: imageUrl,
    offers: {
      "@type": "Offer",
      url: typeof window !== "undefined" ? window.location.href : "",
      priceCurrency: "NOK",
      price: price.toString(),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount.toString(),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default ProductJsonLd;
```

**Bruk i en side:**
```tsx
<head>
  <ProductJsonLd
    name="Premium Lederveske"
    description="Håndlaget italiensk leder, perfekt for profesjonell bruk"
    price={2500}
    imageUrl="/produkter/veske.jpg"
    ratingValue={4.8}
    reviewCount={124}
  />
</head>
```

**Når brukes JSON-LD (extension-DESIGN-QUALITY klassifisering):**
- **MÅ:** ENTERPRISE, KRITISK, GRUNDIG (SEO-viktig)
- **BØR:** STANDARD, STANDARD+
- **KAN:** MINIMAL, FORENKLET

---

## BILDEHÅNDTERING I REACT+TAILWIND

### Bilde-komponent med fallback
```tsx
// components/ui/smart-image.tsx
function SmartImage({ src, alt, className }) {
  const [error, setError] = useState(false);

  // URL validation — prevent XSS vectors
  const isValidUrl = (url) => {
    if (!url) return false;
    // Only allow HTTPS, HTTP, relative paths, and data URIs
    return /^(https?:\/\/|\/|data:)/.test(url);
  };

  if (error || !src || !isValidUrl(src)) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-[--gradient-subtle]",
        className
      )}>
        {/* SVG-ikon eller gradient som fallback — ALDRI grå boks */}
        <svg
          className="w-12 h-12 text-[--color-text-muted] opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={cn("object-cover", className)}
    />
  );
}
```

### Hero med bilde + gradient overlay
```tsx
// Aldri en bar hero uten visuelt innhold
<div className="relative min-h-[60vh] overflow-hidden">
  <img src={heroImage} alt={heroAlt} className="absolute inset-0 w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-[--color-background] via-[--color-background]/60 to-transparent" />
  <div className="relative z-10 flex items-center min-h-[60vh] px-6">
    <h1 className="text-4xl font-bold text-[--color-text]">Overskrift</h1>
  </div>
</div>
```

**Regel:** Generer/hent bilder basert på `imageStrategy` fra PROJECT-STATE.json (`type` kan være string eller array — sjekk med "inneholder"). Se extension-DESIGN-QUALITY.md BILDESTRATEGI for fullstendig fallback-hierarki.

---

## FOR BYGGER-AGENT: INTEGRASJON

```
STAGE 1 (UI) — MED REACT+TAILWIND:

0. Design-tenkning er allerede gjort (se extension-DESIGN-QUALITY.md Steg 0)
1. Base-lag er allerede lastet (extension-DESIGN-QUALITY.md)
2. Installer avhengigheter: shadcn/ui, framer-motion
3. Sett opp fil-struktur (se ovenfor)
4. Definer ALLE tokens i globals.css:
   → Farger (OKLCH), gradienter, shadows (inkl. elegant/glow), transitions
   → SJEKK fargeformat-kompatibilitet (se FARGEBUG-BESKYTTELSE)
5. Lag komponent-varianter FØRST (default, premium, hero, glass, elevated)
6. Bygg sider med komponentene — ALDRI ad hoc-stiler
7. Generer/hent bilder basert på imageStrategy — ALDRI placeholder
8. Legg til animasjoner med Framer Motion (STANDARD+)
9. Bruk wow-faktor-oppskrifter for hero/CTA (STANDARD+)
10. Kjør design-sjekkliste fra extension-DESIGN-QUALITY.md
```

---

*Versjon: 2.0.0*
*Opprettet: 2026-02-14*
*Oppdatert: 2026-02-20*
*Formål: React+Tailwind-spesifikk designimplementering med wow-faktor-oppskrifter for BYGGER-agent Stage 1*
*Beslutning: B09 (Two-layer token-arkitektur), B10 (shadcn/ui + Aceternity/Magic UI + Framer Motion, dark glassmorphism, OKLCH), Gorgeous UI-agent*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
