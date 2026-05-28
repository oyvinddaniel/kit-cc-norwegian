# Protocol: Integrasjons-gate (Veiledet oppsett av MCP-er, API-er og tilkoblinger)

> Ekstrahert fra 4-MVP-agent.md Steg 4.5. Brukes av MVP-agent (Fase 4).

> **Formål:** Sette opp alle integrasjoner FØR bygging starter, slik at MVP leveres komplett med bilder, database, hosting og alt annet som trengs.
> **Input:** `integrations.confirmed[]` fra PROJECT-STATE.json (satt av AUTO-CLASSIFIER B12 → KRAV-agent → ARKITEKTUR-agent)
> **Prinsipp:** Én tilkobling om gangen. Fullføres helt før neste presenteres.

#### OVERORDNET FLYT

```
1. LES PROJECT-STATE.json → integrations.confirmed[]
2. SORTER etter tier (Tier 1 først, Tier 4 sist). Tier 4 vises som informasjon (utsatt), IKKE settes opp.
2b. SJEKK at vcs, devtools og monitor finnes i confirmed[] — legg til automatisk hvis mangler (B12 garanterer disse)
3. FOR HVER integrasjon:
   a. Presenter kategori med klarspråk-beskrivelse (se kategoriene nedenfor)
   b. Bruker bekrefter, avslår eller endrer provider
   c. Veiled gjennom oppsett (API-nøkler, MCP-installasjon, verifisering)
   d. Lagre status i PROJECT-STATE.json: integrations.setup[]
   e. Logg i PROGRESS-LOG
   f. → Neste integrasjon
4. ETTER ALLE: Spør "Er det andre tilkoblinger du ønsker?" → Veiled bruker (Kategori J)
5. VIS OPPSUMMERING av alle oppsatte tilkoblinger
```

#### PRESENTASJONSREGLER

- **Tilpass ALL tekst** til `classification.userLevel` (utvikler/erfaren-vibecoder/ny-vibecoder)
- **Én tilkobling om gangen** — aldri vis flere samtidig
- **Fullstendig klarspråk** — forklar hva det er, hva det gjør, hva det koster, og veiled gjennom oppsettet steg for steg
- **Bruker kan alltid si "hopp over"** — integrasjonen flyttes til `setup[]` med status "skipped"
- **Verifiser alltid** at oppsettet fungerer (test API-nøkkel, sjekk MCP-tilgang, etc.)
- **Bruk nettsøk** for oppdatert installasjonsinstruksjoner — AI sin kunnskap om MCP-verktøy kan være utdatert

#### KATEGORI A: Bilder (Tier 1 — Visuelt synlig)

> **Allerede håndtert av B11 i AUTO-CLASSIFIER.** Ikke presenter på nytt.
> Les `imageStrategy` fra PROJECT-STATE.json. Hvis `type: "replicate"` og API-nøkkel IKKE er satt opp → veiled bruker gjennom oppsett nå.

```
SJEKK: imageStrategy.type (kan være string eller array — sjekk med "inneholder"):
├─ Inneholder "replicate" og REPLICATE_API_TOKEN ikke satt → Veiled oppsett nå (se extension-REPLICATE-IMAGES.md)
├─ Inneholder "own-images" → Informer bruker at bilder trengs før MVP
└─ Tom array, null, eller "none" → Hopp over, gå til neste kategori
```

#### KATEGORI B: GitHub — Versjonskontroll (Tier 2 — alltid)

> **Vis ALLTID. vcs finnes alltid i confirmed[] (B12 legger det til for alle prosjekter).**

```
PRESENTER TIL BRUKER:

"GitHub — Versjonskontroll

Hva er det?
GitHub er stedet der koden din lagres trygt. Tenk på det som en sikkerhetskopi
som også holder styr på alle endringer du gjør. Hvis noe går galt, kan du alltid
gå tilbake til en tidligere versjon.

Hva brukes det til i ditt prosjekt?
- Lagrer all koden din trygt i skyen
- Holder oversikt over hver endring (hvem endret hva, og når)
- Gjør det mulig å samarbeide med andre (senere)
- Kreves for publisering til Vercel, Netlify og andre hostingtjenester

Kostnad: Gratis for de fleste prosjekter (opp til 500 MB lagring)
Oppsett: Ca. 5 minutter

Vil du sette opp GitHub nå?"
```

**Oppsett-veiledning (når bruker sier ja):**
```
1. SJEKK: Har bruker `gh` CLI installert? (kjør: gh --version)
   ├─ JA → Sjekk om innlogget: gh auth status
   │   ├─ Innlogget → Opprett repo: gh repo create [prosjektnavn] --private --source=. --push
   │   └─ Ikke innlogget → gh auth login → deretter opprett repo
   └─ NEI → Informer bruker:
      "Du trenger GitHub CLI. Installer med:
       Mac: brew install gh
       Linux: sudo apt install gh
       Windows: winget install GitHub.cli
       Deretter: gh auth login"

2. VERIFISER: gh repo view (sjekk at repo finnes)
3. LOGG: "GitHub: Repo opprettet og kode pushet"
```

#### KATEGORI C: Supabase — Database og autentisering (Tier 2)

> **Vis KUN hvis `database` finnes i integrations.confirmed[]**

```
PRESENTER TIL BRUKER:

"Supabase — Database og innlogging

Hva er det?
Supabase er en tjeneste som gir deg en database (der appen lagrer data) og et
innloggingssystem (der brukere registrerer seg og logger inn). Alt klart til bruk,
uten at du trenger å bygge det selv.

Hva brukes det til i ditt prosjekt?
- Lagrer brukerdata, innhold og innstillinger
- Håndterer registrering og innlogging (e-post, Google, etc.)
- Gir sanntidsoppdateringer (data oppdateres automatisk i appen)
- Sikrer dataene dine med innebygd tilgangskontroll

Kostnad: Gratis for opptil 50 000 aktive brukere/mnd
         Betalt fra $25/mnd ved høyere bruk
Oppsett: Ca. 10 minutter (krever konto på supabase.com)

Vil du sette opp Supabase nå?"
```

**Oppsett-veiledning:**
```
1. SJEKK: Har bruker Supabase MCP? (søk i tilgjengelige MCP-verktøy)
   ├─ JA → Sjekk tilkobling
   └─ NEI → Informer bruker:
      "For å koble til Supabase trenger du:
       a) Opprett gratis konto på supabase.com
       b) Opprett et nytt prosjekt
       c) Kopier prosjekt-URL og API-nøkkel (under Settings → API)
       d) [Hvis Supabase MCP tilgjengelig:]
          Installer Supabase MCP: npx @anthropic-ai/create-mcp-server@latest
          (Bruk nettsøk for oppdaterte installasjonskommandoer!)"

2. LAGRE: Supabase-URL og anon key i prosjektets .env-fil
3. VERIFISER: Test tilkobling (f.eks. med et enkelt API-kall)
4. LOGG: "Supabase: Tilkoblet [prosjekt-URL]"
```

#### KATEGORI D: Vercel — Hosting og publisering (Tier 2)

> **Vis KUN hvis `hosting` finnes i integrations.confirmed[]**

```
PRESENTER TIL BRUKER:

"Vercel — Hosting og publisering

Hva er det?
Vercel er tjenesten som gjør appen din tilgjengelig på internett. Når du
pusher kode til GitHub, oppdateres appen automatisk — ingen manuell publisering.

Hva brukes det til i ditt prosjekt?
- Publiserer appen din med en ekte nettadresse (f.eks. dinapp.vercel.app)
- Oppdaterer automatisk når du endrer koden
- Gir deg forhåndsvisning av endringer (preview deployments)
- Rask lasting over hele verden (global CDN)

Kostnad: Gratis for hobbyprosjekter (100 GB båndbredde/mnd)
         Pro fra $20/mnd ved kommersiell bruk
Oppsett: Ca. 5 minutter (krever GitHub-tilkobling)

Vil du sette opp Vercel nå?"
```

**Oppsett-veiledning:**
```
1. SJEKK: Har bruker Vercel CLI? (kjør: vercel --version)
   ├─ JA → vercel login → vercel link
   └─ NEI → npm i -g vercel → vercel login → vercel link

2. SJEKK: Vercel MCP tilgjengelig?
   └─ Informer: "Vercel MCP lar AI deploye og sjekke status direkte.
      (Bruk nettsøk for oppdaterte MCP-installasjonskommandoer!)"

3. VERIFISER: vercel whoami (sjekk at innlogget)
4. LOGG: "Vercel: Tilkoblet og klar for deployment"
```

#### KATEGORI E: Kart — Google Maps/Mapbox (Tier 1 — Visuelt synlig)

> **Vis KUN hvis `maps` finnes i integrations.confirmed[]**

```
PRESENTER TIL BRUKER:

"Kart — Vis kart og lokasjoner i appen

Hva er det?
En karttjeneste som lar deg vise interaktive kart, markører og ruter i appen.
To alternativer:

A) Google Maps - Mest kjent
   Kostnad: $200 gratis kreditt/mnd (ca. 28 000 kartvisninger)
            Betalt etter det ($7 per 1000 visninger)
   Oppsett: Krever Google Cloud-konto og API-nøkkel (ca. 10 min)

B) Mapbox — Bedre styling
   Kostnad: 50 000 gratis kartvisninger/mnd
            Betalt etter det ($5 per 1000 visninger)
   Oppsett: Krever Mapbox-konto og access token (ca. 5 min)

Hvilket alternativ foretrekker du?"
```

**Oppsett-veiledning (Google Maps):**
```
1. Opprett Google Cloud-konto (console.cloud.google.com)
2. Aktiver Maps JavaScript API
3. Opprett API-nøkkel (under Credentials)
4. Lagre i .env: GOOGLE_MAPS_API_KEY=[nøkkel]
5. VERIFISER: Test med enkel kartvisning
```

**Oppsett-veiledning (Mapbox):**
```
1. Opprett konto på mapbox.com
2. Kopier default public token fra dashboard
3. Lagre i .env: MAPBOX_ACCESS_TOKEN=[token]
4. VERIFISER: Test med enkel kartvisning
```

#### KATEGORI F: Context7 — AI-dokumentasjonsverktøy (Tier 3 — alltid)

> **Vis ALLTID. devtools finnes alltid i confirmed[] (B12 legger det til for alle prosjekter).**

```
PRESENTER TIL BRUKER:

"Context7 — Oppdatert dokumentasjon for AI

Hva er det?
Context7 er et verktøy som gir AI tilgang til oppdatert dokumentasjon for
alle bibliotekene og rammeverkene vi bruker. Uten dette bruker AI noen ganger
utdaterte kodeeksempler.

Hva brukes det til i ditt prosjekt?
- AI skriver mer korrekt kode fordi den leser siste versjon av dokumentasjonen
- Færre feil og mindre feilsøking
- Fungerer automatisk i bakgrunnen

Kostnad: Helt gratis
Oppsett: Ca. 2 minutter

Vil du sette opp Context7 nå?"
```

**Oppsett-veiledning:**
```
Bruk nettsøk for OPPDATERTE installasjonskommandoer!
   Context7 MCP-oppsett endres ofte.

1. Søk: "Context7 MCP install [årstall]" for siste instruksjoner
2. Typisk: npx -y @anthropic-ai/create-mcp-server context7
   (men verifiser med nettsøk!)
3. VERIFISER: Test at MCP svarer med dokumentasjonsoppslag
4. LOGG: "Context7: MCP installert og verifisert"
```

#### KATEGORI G: Figma — Designverktøy (Tier 3 — betinget)

> **Vis KUN hvis `design` finnes i integrations.confirmed[]**

```
PRESENTER TIL BRUKER:

"Figma — Konverter design til kode

Hva er det?
Figma MCP lar AI lese dine Figma-design og bruke dem direkte når den bygger
komponenter. I stedet for å beskrive hvordan noe skal se ut, kan AI se designet.

Hva brukes det til i ditt prosjekt?
- AI kan lese farger, spacing, typografi fra Figma
- Komponenter bygges tettere opp mot designet
- Sparer tid på manuell CSS-justering

Kostnad: Figma er gratis for personlig bruk (betalt for team: $15/mnd/bruker)
Oppsett: Ca. 5 minutter (krever Figma-konto og personal access token)

Har du et Figma-design du vil bruke?"
```

**Oppsett-veiledning:**
```
Bruk nettsøk for OPPDATERTE installasjonskommandoer!

1. Figma → Settings → Personal access tokens → Generate new token
2. Installer Figma MCP (søk: "Figma MCP install [årstall]")
3. Konfigurer med token
4. VERIFISER: Test at AI kan lese et Figma-dokument
5. LOGG: "Figma: MCP tilkoblet"
```

#### KATEGORI H: Stripe — Betaling (Tier 4 — utsatt)

> **VIS KUN som informasjon. Ikke sett opp nå.**
> **Vis KUN hvis `payment` finnes i integrations.confirmed[]**

```
PRESENTER TIL BRUKER:

"Stripe — Betaling (settes opp etter MVP)

Betaling er viktig for prosjektet ditt, men vi setter det opp ETTER at MVP er ferdig.
Grunnen er enkel: det er viktigere å se at appen fungerer visuelt og funksjonelt
før vi kobler til betaling.

Når vi kommer til betaling (typisk i Fase 5), vil jeg hjelpe deg med:
- Opprette Stripe-konto (stripe.com)
- Sette opp test-modus (gratis — ingen ekte penger)
- Integrere betaling i appen

For nå: Vi merker i planen at betaling trengs, og tar det opp på riktig tidspunkt."
```

```
LAGRE i integrations.setup[]:
  { "category": "payment", "status": "deferred", "reason": "Settes opp etter MVP" }
```

#### KATEGORI I: E-post — Sending av e-poster (Tier 4 — utsatt)

> **VIS KUN som informasjon. Ikke sett opp nå.**
> **Vis KUN hvis `email` finnes i integrations.confirmed[]**

```
PRESENTER TIL BRUKER:

"E-post — Automatisk e-postsending (settes opp etter MVP)

Appen din trenger å sende e-poster (bekreftelser, passord-tilbakestilling, etc.),
men dette er ikke synlig i brukergrensesnittet og kan vente til etter MVP.

Når vi kommer til det, vil jeg hjelpe deg med å velge mellom:
- Resend (moderne, enkel API, gratis opptil 100 e-poster/dag)
- SendGrid (etablert, gratis opptil 100 e-poster/dag)

For nå: Vi noterer behovet og tar det opp i Fase 5."
```

```
LAGRE i integrations.setup[]:
  { "category": "email", "status": "deferred", "reason": "Settes opp etter MVP" }
```

#### KATEGORI J: Egendefinerte tilkoblinger (alltid sist)

> **Vis ALLTID som siste steg i integrasjons-gaten**

```
PRESENTER TIL BRUKER:

"Andre tilkoblinger

Vi har nå satt opp de viktigste tilkoblingene for prosjektet ditt.
Er det noe annet du ønsker å koble til?

Eksempler på ting folk ofte trenger:
- SMS-tjeneste (Twilio)
- Push-varslinger (Firebase Cloud Messaging)
- Analyseverktøy (PostHog, Mixpanel)
- Fillagring (Cloudflare R2, AWS S3)
- Søkemotor (Algolia, Meilisearch)
- Chatbot/AI i appen (OpenAI, Anthropic)

Ønsker du å legge til noe?"
```

**Hvis bruker ønsker noe:**
```
1. BRUK NETTSØK for å finne oppdatert info om tjenesten
2. Presenter med klarspråk (som de andre kategoriene)
3. Veiled gjennom oppsett
4. Lagre i integrations.setup[]
```

#### KATEGORI K: Kit CC Monitor API (Tier 3 — alltid)

> **Kjøres ALLTID. Kit CC Monitor API kobler AI-chatten i Monitor til prosjektet.**

```
KRITISK: Health-check som svarer ≠ dette prosjektets Monitor. Bruk PID-fil for eierskap.
   protocol-MONITOR-OPPSETT.md har allerede satt opp Monitor med riktig port.
   Kategori K VERIFISERER at den fortsatt kjører, og restarter hvis den har stoppet.

LES overlay.port fra PROJECT-STATE.json for å bestemme [PORT].
Hvis overlay.port mangler → Monitor ble ikke startet i steg 5. Kjør protocol-MONITOR-OPPSETT.md.

SJEKK EIERSKAP (samme logikk som STEG A/B i protocol-MONITOR-OPPSETT.md):
1. Les kit-cc-overlay/monitor.pid → Sjekk at PID lever: kill -0 [PID] 2>/dev/null
2. Health-sjekk: curl -s http://localhost:[PORT]/kit-cc/api/health

   ├─ PID lever OG health svarer → DETTE prosjektets Monitor kjører
   │   → Sjekk byggeliste-API: curl -s http://localhost:[PORT]/kit-cc/api/backlog/stats
   │   ├─ Svarer → Alt fungerer, logg og gå videre
   │   └─ Svarer ikke → Vis feilmelding og foreslå restart
   │
   ├─ PID lever men health svarer IKKE → Prosessen henger eller feil port
   │   → Drep: kill [PID]. Gå til RESTART nedenfor.
   │
   ├─ PID lever IKKE men health svarer → Annet prosjekts Monitor på denne porten!
   │   → Gå til RESTART nedenfor.
   │
   └─ PID lever IKKE og health svarer IKKE → Monitor er helt stoppet
      → Gå til RESTART nedenfor.

RESTART (kun hvis Monitor ikke kjører):
   1. Sjekk om porten er ledig: lsof -ti:[PORT]
      ├─ Ledig → Bruk denne porten
      └─ Opptatt → Finn neste ledige (4444, 4445, 4446...)
   2. Oppdater overlay.port i PROJECT-STATE.json
   3. SJEKK MODUS FØR RESTART:
      ├─ Finnes devServer.port i PROJECT-STATE.json?
      │   ├─ JA → Sett overlay.mode = "proxy" og overlay.devServerPort = [devServer.port]
      │   └─ NEI → Sjekk prosjekttype:
      │       ├─ Webapp → FEIL: Dev-server burde vært startet (steg 4.6.0). Start den først.
      │       └─ CLI/API/backend → Sett overlay.mode = "standalone"
   4. Start: PORT=[PORT] nohup node kit-cc-overlay/server.js > kit-cc-overlay/monitor.log 2>&1 &
      echo $! > kit-cc-overlay/monitor.pid
   5. Vent 2 sek, health-sjekk
      → Hvis OK: Vis "Kit CC Monitor startet — oppgaver og status synlig på http://localhost:[PORT]"
      → Hvis feil: Vis manuell instruksjon

PRESENTER TIL BRUKER (kort):
"Kit CC Monitor er aktiv på http://localhost:[PORT]
   — Du får beskjed om å åpne den i nettleseren når appen er klar."
   IKKE be brukeren åpne nettleseren ennå. Monitor kjører i standalone
   (kun dashboard) inntil dev-server er startet og proxy er aktivert (steg 4.6.1).
   Første gang brukeren åpner nettleseren skal de se appen sin, ikke bare dashboardet.

LAGRE i integrations.setup[]:
  { "category": "monitor", "status": "active", "provider": "kit-cc-monitor", "url": "http://localhost:[PORT]" }

# Merk: integrations.setup[].status har følgende gyldige verdier (PROJECT-STATE-SCHEMA v3.5.2):
#   - "active"   = integrasjonen er satt opp og fungerer
#   - "deferred" = utsatt til etter MVP
#   - "skipped"  = brukeren valgte å hoppe over
```

#### OPPSUMMERING (etter alle kategorier)

```
ETTER AT ALLE kategorier er behandlet:

VIS TIL BRUKER:
"Integrasjoner — Oppsummering

Satt opp og klart:
   [Liste over alle med status "active"]

Utsatt til etter MVP:
   [Liste over alle med status "deferred"]

Hoppet over:
   [Liste over alle med status "skipped"]

Alt er klart — vi kan begynne å bygge!"

LOGG: "FULLFØRT: Steg 4.5 Integrasjons-gate → [X] aktive, [Y] utsatte, [Z] hoppet over"
```

**KRITISKE REGLER FOR STEG 4.5:**
- **BLOKKERENDE for Tier 1 og 2:** Ikke start bygging (Steg 4.6) før Tier 1-2 integrasjoner er behandlet
- **IKKE-BLOKKERENDE for Tier 3 og 4:** Bruker kan alltid hoppe over
- **Bruk ALLTID nettsøk** for installasjonskommandoer — MCP-økosystemet endres raskt
- **Verifiser ALLTID** at oppsettet fungerer etter installasjon
- **Aldri lagre API-nøkler i kode** — alltid i .env-fil, og sjekk at .gitignore inkluderer .env

---

*Ekstrahert fra 4-MVP-agent.md v3.5.0 — 2026-02-23 (referanse oppdatert 2026-04-22)*

*Kompatibel med: Kit CC v3.5.0*

> **Systemversjon:** Se `Kit CC/Agenter/VERSION.json` for Kit CC-versjon.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
