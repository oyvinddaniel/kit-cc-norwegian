# Funksjonsoversikt — Komplett

> Komplett funksjonsoversikt for Kit CC agent-systemet med brukerforklaringer og klassifisering-metadata.
>
> **SSOT:** Den autoritative listen over alle oppgave-IDer og deres MÅ/BØR/KAN-klassifisering finnes i `KLASSIFISERING-METADATA-SYSTEM.md` (KOMPLETT FASE-OPPGAVER REGISTER). Denne filen gir **detaljerte brukerforklaringer** for alle funksjoner, organisert i tre deler:
> 1. **Kategoriserte funksjoner** (INF, VKT, PRO) — med fulle beskrivelser, analogier og klassifisering
> 2. **Fase-dokumentasjon** — alle 7 faser med alle prosess-, ekspert-, basis- og system-agenter
> 3. **Oppsummeringsmatriser** — hurtigreferanse for klassifisering og intensitetsnivåer

---

## Hurtigreferanse: Kategorier

| Kategori | Beskrivelse | Brukervalg? |
|----------|-------------|-------------|
| 🔧 **INFRASTRUKTUR** | Får systemet til å fungere. Usynlig for bruker. | ❌ Aldri |
| 🔌 **VERKTØY** | Avhenger av tech stack og preferanser | ⚡ Auto / 🔘 Velg |
| 📋 **PROSESS** | Koster tid/ressurser. Viktigere for større prosjekter | ✅ Ja |

---

## KATEGORI 1: INFRASTRUKTUR (Alltid på)

> Brukeren velger IKKE disse. De fungerer automatisk i bakgrunnen.

### INF-01: CIRCUIT-BREAKER

**Hva gjør denne funksjonen?**
Stopper automatisk prosessen hvis noe går galt flere ganger på rad, og gir deg kontroll over hva som skal skje videre.

**Tenk på det som:**
En sikring i sikringsskapet - slår av strømmen før noe tar fyr, slik at du kan undersøke problemet trygt.

**Hvor viktig er den?**
Kritisk for stabilitet. Uten denne kan AI-en gå i løkke og bruke opp tid/ressurser på noe som ikke fungerer.

**Krever dette eksterne tjenester?**
Nei - innebygd i systemet.

**Koster det mer?**
Nei - helt gratis.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - du merker den kun hvis noe går galt.

---

### INF-02: CHECKPOINT-RECOVERY

**Hva gjør denne funksjonen?**
Lagrer tilstanden til prosjektet ved viktige milepæler, slik at du alltid kan gå tilbake hvis noe går galt.

**Tenk på det som:**
Auto-save i et spill - du kan laste inn fra siste checkpoint hvis du dør.

**Hvor viktig er den?**
Kritisk. Uten denne mister du alt arbeid hvis noe krasjer.

**Krever dette eksterne tjenester?**
Git (som du allerede bruker).

**Koster det mer?**
Nei - bruker Git som allerede er gratis.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - lagrer ved hver fase-overgang.

---

### INF-03: CONTEXT-LOADER

**Hva gjør denne funksjonen?**
Husker prosjektet ditt mellom samtaler. Laster inn CLAUDE.md, tidligere beslutninger og viktige filer når du starter en ny chat.

**Tenk på det som:**
En assistent som leser møtenotatene før hvert møte, slik at dere ikke starter fra scratch.

**Hvor viktig er den?**
Kritisk. Uten denne må du forklare alt på nytt hver gang.

**Krever dette eksterne tjenester?**
Nei - leser filer i prosjektmappen.

**Koster det mer?**
Nei.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - kjører ved oppstart.

---

### INF-04: AGENT-PROTOCOL

**Hva gjør denne funksjonen?**
Definerer hvordan agentene snakker sammen - standard format for meldinger, overleveringer og feilhåndtering.

**Tenk på det som:**
Grammatikk for et språk - uten den forstår ikke agentene hverandre.

**Hvor viktig er den?**
Kritisk for systemet, usynlig for deg.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - alltid aktiv.

---

### INF-05: PHASE-GATES

**Hva gjør denne funksjonen?**
Sjekker at alt er på plass før du går videre til neste fase. Forhindrer at du hopper over viktige steg.

**Tenk på det som:**
Sjekkliste før avgang på et fly - du tar ikke av før alt er grønt.

**Hvor viktig er den?**
Kritisk for kvalitet. Sikrer at fundamentet er solid før du bygger videre.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - kjører ved hver fase-overgang.

---

## KATEGORI 2: VERKTØY-INTEGRASJONER

> Noen aktiveres automatisk basert på din stack, andre velger du selv.

### VKT-01: Supabase-integrasjon ⚡ AUTO

**Hva gjør denne funksjonen?**
Aktiverer Supabase-spesifikke funksjoner: RLS-policyer, Edge Functions, Realtime, Auth-integrasjon.

**Tenk på det som:**
Spesialtilpassede verktøy for Supabase - som å ha en Supabase-ekspert tilgjengelig.

**Hvor viktig er den?**
Kritisk hvis du bruker Supabase. Irrelevant ellers.

**Krever dette eksterne tjenester?**
Ja - Supabase (du har allerede valgt dette).

**Koster det mer?**
Nei - bruker Supabase du allerede betaler for.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - aktiveres når du sier du bruker Supabase.

**Er den relevant for Supabase og Vercel?**
✅ Supabase: JA - dette ER Supabase-integrasjonen.
⚪ Vercel: Nøytral - fungerer med Vercel, men ikke spesifikk.

---

### VKT-02: Vercel-integrasjon ⚡ AUTO

**Hva gjør denne funksjonen?**
Aktiverer Vercel-spesifikke funksjoner: Edge Functions, preview deploys, miljøvariabler, analytics.

**Tenk på det som:**
Spesialtilpassede verktøy for Vercel - som å ha en Vercel-ekspert tilgjengelig.

**Hvor viktig er den?**
Kritisk hvis du bruker Vercel. Irrelevant ellers.

**Krever dette eksterne tjenester?**
Ja - Vercel (du har allerede valgt dette).

**Koster det mer?**
Nei - bruker Vercel du allerede betaler for.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - aktiveres når du sier du bruker Vercel.

**Er den relevant for Supabase og Vercel?**
⚪ Supabase: Nøytral.
✅ Vercel: JA - dette ER Vercel-integrasjonen.

---

### VKT-03: GitHub Actions CI/CD ⚡ AUTO

**Hva gjør denne funksjonen?**
Setter opp automatisk testing og deploy via GitHub Actions. Hver gang du pusher kode, kjøres tester og deploy automatisk.

**Tenk på det som:**
En robot som sjekker koden din og legger den ut på nettet hver gang du lagrer.

**Hvor viktig er den?**
Svært viktig for konsistent kvalitet og automatisering.

**Krever dette eksterne tjenester?**
Ja - GitHub (gratis for public repos, inkludert i betalte planer).

**Koster det mer?**
Nei for de fleste - 2000 min/mnd gratis. Store prosjekter kan trenge mer.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - aktiveres når du bruker GitHub.

**Er den relevant for Supabase og Vercel?**
✅ Supabase: JA - deployer til Supabase automatisk.
✅ Vercel: JA - integrerer sømløst med Vercel.

---

### VKT-04: Playwright MCP 🔘 VELG

**Hva gjør denne funksjonen?**
E2E-testing som simulerer ekte brukere - klikker knapper, fyller ut skjemaer, sjekker at alt fungerer i nettleseren.

**Tenk på det som:**
En robot som tester appen din som om den var en ekte bruker.

**Hvor viktig er den?**
Veldig viktig for kundevendte apper. Mindre viktig for interne verktøy.

**Krever dette eksterne tjenester?**
Nei - kjører lokalt eller i CI/CD.

**Koster det mer?**
Nei - open source.

**Fordeler:**
- Fanger bugs før brukerne gjør det
- Tester på tvers av nettlesere
- Automatisert - kjører ved hver commit

**Ulemper:**
- 1-2 timer oppsett
- Tester må vedlikeholdes når UI endres

**Aktiveres automatisk eller er bruker involvert?**
BRUKER VELGER - alternativ er Cypress eller manuell testing.

**Er den relevant for Supabase og Vercel?**
✅ Begge: JA - tester frontend uansett backend.

**Viktighet per prosjekttype:**

| Prosjekttype | Viktighet | Kommentar |
|--------------|-----------|-----------|
| Personlige små prosjekter | ⭐ | Overkill |
| Interne små verktøy | ⭐⭐ | Nice to have |
| Interne store (5-100+ brukere) | ⭐⭐⭐ | Anbefalt |
| Eksterne for kunder, små | ⭐⭐⭐⭐ | Viktig |
| Eksterne for kunder, store | ⭐⭐⭐⭐⭐ | Kritisk |
| Offentlig fri registrering | ⭐⭐⭐⭐⭐ | Kritisk |

---

### VKT-05: OIDC Workload Identity 🔘 VELG

**Hva gjør denne funksjonen?**
Erstatter lagrede passord/API-nøkler med midlertidige tokens som utløper automatisk. GitHub Actions får tilgang til Vercel/Supabase uten permanente hemmeligheter.

**Tenk på det som:**
Hotellnøkkelkort som slutter å virke ved utsjekking - i stedet for en fysisk nøkkel som fungerer for alltid.

**Hvor viktig er den?**
Kritisk sikkerhetsforbedring. Hvis noen stjeler repoet ditt, får de ikke varig tilgang.

**Krever dette eksterne tjenester?**
Nei - GitHub Actions, Vercel og Supabase støtter dette allerede.

**Koster det mer?**
Nei - helt gratis.

**Fordeler:**
- Ingen passord å lekke
- Automatisk rotasjon
- Industri-standard sikkerhet
- Engangsoppsett

**Ulemper:**
- 15-30 min oppsett første gang
- Litt vanskeligere å debugge enn vanlige nøkler

**Aktiveres automatisk eller er bruker involvert?**
BRUKER INVOLVERT - engangsoppsett, deretter automatisk.

**Er den relevant for Supabase og Vercel?**
✅ Begge: JA - begge støtter OIDC fullt ut.

**Viktighet per prosjekttype:**

| Prosjekttype | Viktighet | Kommentar |
|--------------|-----------|-----------|
| Personlige små prosjekter | ⭐⭐ | Overkill, men god praksis |
| Interne små verktøy | ⭐⭐⭐ | Anbefalt for organisasjoner |
| Interne store (5-100+ brukere) | ⭐⭐⭐⭐ | Viktig for compliance |
| Eksterne for kunder, små | ⭐⭐⭐⭐ | Viktig for kundetillit |
| Eksterne for kunder, store | ⭐⭐⭐⭐⭐ | Kritisk - kundedataansvar |
| Offentlig fri registrering | ⭐⭐⭐⭐⭐ | Absolutt kritisk |

---

## KATEGORI 3: PROSESS-OPPGAVER (Klassifisering-styrt)

> Disse styres av MÅ/BØR/KAN/IKKE basert på prosjektets intensitetsnivå.

---

### BYGGER-FUNKSJONER

#### BYG-F1: Smart Konteksthenting

**Hva gjør denne funksjonen?**
Henter KUN relevante filer dynamisk, i stedet for å lese hele prosjektet. Holder kontekstvinduet ryddig.

**Tenk på det som:**
En forsker som slår opp akkurat den boken de trenger, i stedet for å lese hele biblioteket.

**Hvor viktig er den?**
Veldig viktig for store prosjekter. Mindre viktig for små.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei - sparer faktisk tid/tokens.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - alltid på.

**Er den relevant for Supabase og Vercel?**
⚪ Nøytral - fungerer uansett stack.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### BYG-F2: Automatisk Test-generering

**Hva gjør denne funksjonen?**
Genererer tester SAMTIDIG som kode skrives. Du slipper å huske å skrive tester etterpå.

**Tenk på det som:**
En assistent som lager oppgaver til eksamen mens du underviser - du får testet kunnskapen umiddelbart.

**Hvor viktig er den?**
Viktig for kvalitet. 40% færre bugs med samtidig testing.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Fordeler:**
- Tester alltid tilgjengelig
- Fanger bugs tidlig
- Dokumenterer forventet oppførsel

**Ulemper:**
- Tar litt mer tid per feature
- Tester må vedlikeholdes

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK for STD+, VALGFRITT for lavere nivåer.

**Er den relevant for Supabase og Vercel?**
⚪ Nøytral.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### BYG-F3: Inkrementell PR-strategi

**Hva gjør denne funksjonen?**
Holder Pull Requests under 400 linjer. Deler opp store endringer i små, forståelige biter.

**Tenk på det som:**
Å levere en rapport kapittel for kapittel, i stedet for hele boken på en gang.

**Hvor viktig er den?**
Veldig viktig for team-prosjekter. Mindre viktig for solo.

**Krever dette eksterne tjenester?**
GitHub/GitLab.

**Koster det mer?**
Nei.

**Fordeler:**
- 3x raskere code review
- Lettere å forstå endringer
- Enklere rollback

**Ulemper:**
- Flere PR-er å håndtere
- Krever bedre planlegging

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK for team-prosjekter, VALGFRITT for solo.

**Er den relevant for Supabase og Vercel?**
⚪ Nøytral.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | MÅ | MÅ |

---

#### BYG-F7: To-stegs Selvrefleksjon

**Hva gjør denne funksjonen?**
Etter at kode er skrevet, tar AI-en på "sikkerhetsekspert-hatten" og reviewer sin egen kode for sikkerhetsfeil.

**Tenk på det som:**
En kokk som smaker på maten før den serveres - fanger feil før kunden får den.

**Hvor viktig er den?**
Svært viktig. 24.7% av AI-generert kode har sikkerhetsfeil - dette fanger mange av dem.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei - litt ekstra tid, men sparer tid på bug-fixing senere.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK.

**Er den relevant for Supabase og Vercel?**
✅ Begge: JA - spesielt viktig for auth og database-kode.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| KAN | BØR | MÅ | MÅ | MÅ |

---

### SIKKERHETS-FUNKSJONER

#### SIK-F1: AI-trusselmodellering (STRIDE GPT)

**Hva gjør denne funksjonen?**
Genererer automatisk en trusselmodell basert på arkitekturen din. Tenker som en hacker for å finne svakheter.

**Tenk på det som:**
En sikkerhetskonsulent som går gjennom bygningen din og sier "her kan noen bryte seg inn, her kan noen snoke".

**Hvor viktig er den?**
Viktig for eksterne apper. Overkill for personlige prosjekter.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Fordeler:**
- Finner sikkerhetshull FØR hackere
- Dokumentert for compliance
- Automatisert

**Ulemper:**
- Maks 72% nøyaktighet - trenger validering
- Kan "hallusinere" trusler

**Aktiveres automatisk eller er bruker involvert?**
BRUKER INVOLVERT - du godkjenner trusselmodellen.

**Er den relevant for Supabase og Vercel?**
✅ Begge: JA - analyserer hele arkitekturen.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### SIK-F3: SBOM-generering

**Hva gjør denne funksjonen?**
Lager en "ingrediensliste" for koden din - alle biblioteker og versjoner du bruker, med kjente sikkerhetshull.

**Tenk på det som:**
Ingredienslisten på matpakken - du vet nøyaktig hva som er inni.

**Hvor viktig er den?**
Viktig for profesjonelle prosjekter. Lovpålagt i flere bransjer.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Fordeler:**
- Vet hva du er avhengig av
- Oppdager sårbarheter automatisk
- Compliance-dokumentasjon

**Ulemper:**
- 5 min oppsett
- Må oppdateres ved nye dependencies

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK ved bygg.

**Er den relevant for Supabase og Vercel?**
⚪ Nøytral - fungerer uansett stack.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | MÅ | MÅ |

---

#### SIK-F5: Pre-commit Secrets-scan

**Hva gjør denne funksjonen?**
Stopper deg fra å pushe passord eller API-nøkler til Git. Sjekker FØR du committer.

**Tenk på det som:**
En vakt som sjekker at du ikke tar med deg hemmeligheter ut av bygningen.

**Hvor viktig er den?**
Kritisk. Én lekket API-nøkkel kan koste millioner.

**Krever dette eksterne tjenester?**
Nei - lokalt verktøy (gitleaks/GitGuardian).

**Koster det mer?**
Nei - open source verktøy.

**Fordeler:**
- Stopper lekkasjer FØR de skjer
- Automatisk - ingen ekstra steg
- Fungerer offline

**Ulemper:**
- 5 min oppsett
- Kan gi false positives

**Aktiveres automatisk eller er bruker involvert?**
ENGANGSOPPSETT, deretter automatisk.

**Er den relevant for Supabase og Vercel?**
✅ Begge: JA - beskytter Supabase/Vercel API-nøkler.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| KAN | MÅ | MÅ | MÅ | MÅ |

---

#### SIK-F6: EU AI Act Compliance

**Hva gjør denne funksjonen?**
Sjekker at AI-prosjektet ditt følger EUs nye AI-reguleringer (gjelder fra august 2026).

**Tenk på det som:**
En advokat som sjekker at du følger de nye AI-lovene.

**Hvor viktig er den?**
Kritisk hvis du bygger AI-produkter for EU-markedet. Irrelevant ellers.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Aktiveres automatisk eller er bruker involvert?**
BRUKER INVOLVERT - du må svare på klassifiserings-spørsmål.

**Er den relevant for Supabase og Vercel?**
⚪ Nøytral - avhenger av om du bruker AI, ikke backend.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | BØR | MÅ |

*Note: Kun relevant for AI-systemer*

---

### GDPR-FUNKSJONER

#### GDP-01: Data Inventory

**Hva gjør denne funksjonen?**
Kartlegger ALLE personopplysninger i systemet - hvor de lagres, hvor lenge, og hvorfor.

**Tenk på det som:**
Et komplett kart over alle persondata i systemet ditt.

**Hvor viktig er den?**
Lovpålagt hvis du behandler EU-borgeres data.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Aktiveres automatisk eller er bruker involvert?**
BRUKER INVOLVERT - du svarer på spørsmål om databehandling.

**Er den relevant for Supabase og Vercel?**
✅ Supabase: JA - kartlegger database-innhold.
⚪ Vercel: Nøytral.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### GDP-02: Samtykkeforvaltning

**Hva gjør denne funksjonen?**
Implementerer korrekte samtykke-mekanismer - eksplisitt, granulert, og lett å tilbakekalle.

**Tenk på det som:**
"Vil du ha kjeks?"-varselet, men gjort riktig slik at det faktisk følger loven.

**Hvor viktig er den?**
Lovpålagt for cookies og marketing. GDPR-bøter kan være opp til 4% av omsetning.

**Krever dette eksterne tjenester?**
Nei (eller valgfri tredjepart som Cookiebot).

**Koster det mer?**
Nei for enkel løsning. Cookiebot/OneTrust koster fra €10/mnd.

**Aktiveres automatisk eller er bruker involvert?**
BRUKER INVOLVERT - du godkjenner implementeringen.

**Er den relevant for Supabase og Vercel?**
⚪ Begge: Nøytral - dette handler om frontend.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | BØR | MÅ | MÅ |

---

#### GDP-03: Rett til sletting

**Hva gjør denne funksjonen?**
Implementerer "Slett min konto"-funksjonalitet som faktisk sletter ALT - database, backups, tredjeparter.

**Tenk på det som:**
En "slett alt om meg"-knapp som virkelig sletter alt.

**Hvor viktig er den?**
Lovpålagt under GDPR. Brudd kan koste millioner.

**Krever dette eksterne tjenester?**
Nei, men må implementeres for alle steder data lagres.

**Koster det mer?**
Nei.

**Aktiveres automatisk eller er bruker involvert?**
BRUKER INVOLVERT - du må godkjenne sletteprosedyren.

**Er den relevant for Supabase og Vercel?**
✅ Supabase: JA - må slette fra database + auth.
⚪ Vercel: Nøytral - ingen brukerdata lagres der.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | BØR | MÅ | MÅ |

---

#### GDP-04: DPIA (Data Protection Impact Assessment)

**Hva gjør denne funksjonen?**
Gjennomfører en formell vurdering av personvernrisiko for høyrisiko-behandlinger.

**Tenk på det som:**
En sikkerhetsvurdering spesifikt for personvern - "hva kan gå galt og hvordan beskytter vi mot det?"

**Hvor viktig er den?**
Lovpålagt for høyrisiko-behandling (AI, helse, finans, storskaladata).

**Krever dette eksterne tjenester?**
Nei, men kan trenge juridisk rådgivning for enterprise.

**Koster det mer?**
Nei for DIY. Juridisk rådgivning koster.

**Aktiveres automatisk eller er bruker involvert?**
BRUKER INVOLVERT - du besvarer vurderingsspørsmål.

**Er den relevant for Supabase og Vercel?**
⚪ Begge: Nøytral - avhenger av datatype, ikke plattform.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | KAN | MÅ | MÅ |

---

### MVP-OPPGAVER

#### MVP-04: CI/CD-pipeline

**Hva gjør denne funksjonen?**
Setter opp automatisk testing og deploy. Kode testes og deployes automatisk ved push.

**Tenk på det som:**
En samlebånd for kode - fra commit til live på nettet, automatisk.

**Hvor viktig er den?**
Svært viktig for profesjonelle prosjekter. Overkill for hobbyprosjekter.

**Krever dette eksterne tjenester?**
GitHub Actions (gratis 2000 min/mnd).

**Koster det mer?**
Nei for de fleste.

**Aktiveres automatisk eller er bruker involvert?**
ENGANGSOPPSETT av CICD-ekspert-agent.

**Er den relevant for Supabase og Vercel?**
✅ Begge: JA - deployer til Supabase/Vercel automatisk.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | BØR | MÅ | MÅ | MÅ |

---

#### MVP-07: Test coverage 70%+

**Hva gjør denne funksjonen?**
Sikrer at minst 70% av koden er dekket av automatiserte tester.

**Tenk på det som:**
At 70% av huset er dekket av brannalarm - de viktigste rommene er beskyttet.

**Hvor viktig er den?**
Viktig for kvalitet og vedlikehold. Fanger bugs før produksjon.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Fordeler:**
- Tryggere refaktorering
- Dokumenterer forventet oppførsel
- Fanger regresjoner

**Ulemper:**
- Tar mer tid å skrive
- Tester må vedlikeholdes

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK - TEST-GENERATOR lager testene.

**Er den relevant for Supabase og Vercel?**
⚪ Begge: Nøytral.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### MVP-13: Code review før merge

**Hva gjør denne funksjonen?**
Krever at all kode blir gjennomgått av REVIEWER-agent før den merges til main-branch.

**Tenk på det som:**
En kollega som dobbeltsjekker arbeidet ditt før det publiseres.

**Hvor viktig er den?**
Svært viktig for team-prosjekter og profesjonell kode.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Fordeler:**
- Fanger bugs og sikkerhetshull
- Kunnskapsdeling
- Konsistent kodekvalitet

**Ulemper:**
- Tar ekstra tid (15-30 min per PR)
- Kan føles som overhead for solo

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK for STD+, valgfritt for lavere.

**Er den relevant for Supabase og Vercel?**
⚪ Begge: Nøytral.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | MÅ | MÅ | MÅ |

---

### KVALITETSSIKRING-OPPGAVER

#### KVA-01: Penetrasjonstest

**Hva gjør denne funksjonen?**
Simulerer ekte angrep mot applikasjonen for å finne sikkerhetshull.

**Tenk på det som:**
Å hyre en innbruddstyv for å sjekke om låsene dine holder.

**Hvor viktig er den?**
Kritisk for sensitive systemer. Overkill for interne verktøy.

**Krever dette eksterne tjenester?**
Ofte - profesjonelle pentest-leverandører koster €5-50k.

**Koster det mer?**
JA - €5.000 - €50.000+ avhengig av scope.

**Fordeler:**
- Finner hull AI/automatisering misser
- Compliance-dokumentasjon
- Profesjonell rapport

**Ulemper:**
- Dyrt
- Tar 1-4 uker
- Må gjentas årlig

**Aktiveres automatisk eller er bruker involvert?**
BRUKER BESLUTTER - må engasjere ekstern leverandør.

**Er den relevant for Supabase og Vercel?**
✅ Begge: JA - tester hele stacken.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | BØR | MÅ |

---

#### KVA-02: OWASP Top 10 Testing

**Hva gjør denne funksjonen?**
Tester applikasjonen mot de 10 vanligste sikkerhetshullene (SQL injection, XSS, etc).

**Tenk på det som:**
En sjekkliste for de 10 vanligste måtene hackere bryter seg inn.

**Hvor viktig er den?**
Svært viktig for alle eksterne apper.

**Krever dette eksterne tjenester?**
Nei - OWASP-ekspert-agent gjør dette.

**Koster det mer?**
Nei.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK i Fase 6.

**Er den relevant for Supabase og Vercel?**
✅ Begge: JA - spesielt viktig for auth og API.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | MÅ | MÅ | MÅ |

---

#### KVA-03: Tilgjengelighetstest (WCAG)

**Hva gjør denne funksjonen?**
Sikrer at appen kan brukes av personer med funksjonsnedsettelser - skjermleser, tastaturnavigasjon, fargekontrast.

**Tenk på det som:**
Å sjekke at bygningen har rullestolrampe, blindeskrift og god belysning.

**Hvor viktig er den?**
Lovpålagt i mange land. 15% av befolkningen har funksjonsnedsettelser.

**Krever dette eksterne tjenester?**
Nei.

**Koster det mer?**
Nei.

**Aktiveres automatisk eller er bruker involvert?**
AUTOMATISK i Fase 6 + manuell validering.

**Er den relevant for Supabase og Vercel?**
⚪ Begge: Nøytral - handler om frontend.

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | BØR | MÅ | MÅ |

---

## OPPSUMMERING: FUNKSJONS-KLASSIFISERINGSMATRISE

> **SSOT-referanse:** Klassifiseringsmatrisen er definert i `KLASSIFISERING-METADATA-SYSTEM.md`. Tabellen under er en KOPI for rask referanse — ved avvik gjelder SSOT.

### Infrastruktur (alltid på)
| Funksjon | Stack |
|----------|-------|
| CIRCUIT-BREAKER | ⚪ |
| CHECKPOINT-RECOVERY | ⚪ |
| CONTEXT-LOADER | ⚪ |
| AGENT-PROTOCOL | ⚪ |
| PHASE-GATES | ⚪ |

### Verktøy-integrasjoner
| Funksjon | Stack | Aktivering |
|----------|-------|------------|
| Supabase-integrasjon | 🟢 | ⚡ AUTO |
| Vercel-integrasjon | 🟣 | ⚡ AUTO |
| GitHub Actions | 🟣 | ⚡ AUTO |
| Playwright MCP | ⚪ | 🔘 VELG |
| OIDC Workload Identity | 🟣🟢 | 🔘 VELG |

### Prosess-oppgaver (klassifisering-styrt)
| Funksjon | Stack | MIN | FOR | STD | GRU | ENT |
|----------|-------|-----|-----|-----|-----|-----|
| Automatisk test-generering | ⚪ | IKKE | KAN | BØR | MÅ | MÅ |
| Inkrementell PR-strategi | ⚪ | IKKE | IKKE | KAN | MÅ | MÅ |
| To-stegs selvrefleksjon | ⚪ | KAN | BØR | MÅ | MÅ | MÅ |
| AI-trusselmodellering | ⚪ | IKKE | KAN | BØR | MÅ | MÅ |
| SBOM-generering | ⚪ | IKKE | IKKE | KAN | MÅ | MÅ |
| Pre-commit secrets-scan | ⚪ | KAN | MÅ | MÅ | MÅ | MÅ |
| EU AI Act compliance | ⚪ | IKKE | IKKE | KAN | BØR | MÅ |
| GDPR Data Inventory | ⚪ | IKKE | KAN | BØR | MÅ | MÅ |
| Samtykkeforvaltning | ⚪ | IKKE | IKKE | BØR | MÅ | MÅ |
| Rett til sletting | ⚪ | IKKE | IKKE | BØR | MÅ | MÅ |
| DPIA | ⚪ | IKKE | KAN | KAN | MÅ | MÅ |
| CI/CD-pipeline | 🟣 | IKKE | BØR | MÅ | MÅ | MÅ |
| Test coverage 70%+ | ⚪ | IKKE | KAN | BØR | MÅ | MÅ |
| Code review før merge | ⚪ | IKKE | KAN | MÅ | MÅ | MÅ |
| Penetrasjonstest | ⚪ | IKKE | IKKE | KAN | BØR | MÅ |
| OWASP Top 10 testing | ⚪ | IKKE | KAN | MÅ | MÅ | MÅ |
| Tilgjengelighetstest | ⚪ | IKKE | IKKE | BØR | MÅ | MÅ |

### Planleggings-funksjon (v3.6.0)

> Native planleggings-funksjon i PLANLEGGER-agent. Aktiveres via naturlig språk (intent-deteksjon) eller slash-kommando. Mikrodetalj-nivå (nivå 4) er kjerneverdiløftet.

| Funksjon | MIN | FOR | STD | GRU | ENT |
|----------|-----|-----|-----|-----|-----|
| PLAN-modus (hyperdetaljert 4-nivå) | KAN | BØR | MÅ | MÅ | MÅ |
| BRAINSTORM-modus (fri utforskning, ingen lagring) | KAN | KAN | KAN | KAN | KAN |
| STATUS-modus (read-only oversikt) | KAN | BØR | BØR | MÅ | MÅ |
| REVIEW-modus (kvalitetssjekk, karakter A-D) | KAN | BØR | MÅ | MÅ | MÅ |
| Nivå 4 (mikrodetalj — AI-eid) | KAN | KAN | BØR | MÅ | MÅ |
| Self-consistency i REVIEW (multi-pass validering) | — | — | — | BØR | MÅ |
| Mønster-coverage 100% (alle 22 mønstre sjekket) | KAN | BØR | MÅ | MÅ | MÅ |
| Obligatoriske mønstre (M:tilstander/tilgjengelighet/kanttilfeller) | BØR | MÅ | MÅ | MÅ | MÅ |
| Mobil-mønster (M:mobil-beroring) | KAN | BØR | MÅ | MÅ | MÅ |
| Intent-deteksjon (naturlig språk → modus) | KAN | BØR | MÅ | MÅ | MÅ |
| Auto-trigger REVIEW før fase-gate | KAN | BØR | MÅ | MÅ | MÅ |
| VALIDERING karakter B+ påkrevd for launch | — | BØR | MÅ | MÅ | MÅ |

### Stack-indikatorer
| Symbol | Betydning |
|--------|-----------|
| 🟢 | Supabase-spesifikk |
| 🟣 | Vercel/GitHub-spesifikk |
| 🔵 | Annen plattform-spesifikk |
| ⚪ | Plattform-nøytral |

---

## FASE-DOKUMENTASJON

---

### FASE 1: IDÉ OG VISJON (Idea to Vision)

> Den kritiske starten der ideen formes til en konkret visjonsforklaring.

#### Prosess-agent: OPPSTART-agent

**Hovedrolle:**
Orchestrerer hele oppstart-fasen. Samordner PERSONA-ekspert, LEAN-CANVAS-ekspert og KONKURRANSEANALYSE-ekspert for å gå fra idé til validert konsept.

**Hvem er den?**
Den karismatiske startup-rådgiveren som stiller de rette spørsmålene.

**Typisk workflow:**
1. Innsamle initialbriefing
2. Kickstart med PERSONA-ekspert (hvem er brukeren?)
3. Lage business model med LEAN-CANVAS-ekspert
4. Analysere markedet med KONKURRANSEANALYSE-ekspert
5. Outputter: CLAUDE.md, persona-dokument, Lean Canvas, konkurranse-analyse

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### PERSONA-ekspert

**Hva gjør denne agenten?**
Lager detaljerte bruker-personas basert på forskning og antagelser. Beskriver mål, smertepunkter, og motivasjon for hver brukergruppe.

**Tenk på det som:**
En sosiolog som intervjuer typiske brukere og lager portretter av dem.

**Outputs:**
- Persona-dokument (3-5 personas per fase)
- Empati-kart
- User journey-maps
- Aktuell brukerhistorie

**Stack-relevans:**
⚪ Nøytral - handler om bruker, ikke teknologi

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### LEAN-CANVAS-ekspert

**Hva gjør denne agenten?**
Lager en Lean Canvas - en en-sides business model som forklarer idéen, verdiforslagene, og inntektsmodell.

**Tenk på det som:**
Den forretnings-delen av pitchen din på én side.

**Outputs:**
- Lean Canvas-diagram
- Validert verdiforslagappe
- Inntektsmodell-skisse
- KPI-forslag

**Stack-relevans:**
⚪ Nøytral

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### KONKURRANSEANALYSE-ekspert

**Hva gjør denne agenten?**
Kartlegger konkurrenter, markedsposisjonering, og din unique selling point (USP).

**Tenk på det som:**
En markedsanalytiker som sier "her er dine rivaler, og her er ditt fortrinn".

**Outputs:**
- Konkurranse-analyse-rapport
- SWOT-analyse
- Posisjoneringsmatrise
- Estimert markedsstørrelse

**Stack-relevans:**
⚪ Nøytral

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

### FASE 2: PLANLEGG (Feature Definition)

> Fra visjon til konkrete krav - hva skal systemet faktisk GJØRE?

#### Prosess-agent: KRAV-agent

**Hovedrolle:**
Orchestrerer requirements-definisjonen. Samordner WIREFRAME-ekspert, UIUX-ekspert og API-DESIGN-ekspert.

**Typisk workflow:**
1. Fra personas → feature-forslag
2. Wireframe-design med WIREFRAME-ekspert
3. UX-detaljer med UIUX-ekspert
4. Backend-kontrakter med API-DESIGN-ekspert
5. Outputter: Feature list, wireframes, UX-specs, API-spesifikasjon

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### WIREFRAME-ekspert

**Hva gjør denne agenten?**
Lager wireframes - grå bokser og linjer som viser layout og navigasjonsstruktur.

**Outputs:**
- Wireframe-diagrammer
- Navigasjonsflyt
- Skjermkart
- Interaksjons-notater

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### UIUX-ekspert

**Hva gjør denne agenten?**
Forvandles wireframes til vakre, brukervennlige design-mockups. Implementerer design-system og accessibility-prinsipper.

**Outputs:**
- Design-mockups (Figma/design-tool)
- Design-system (komponenter, farger, typografi)
- Brukertesting-plan
- Tilgjengelighets-sjekkliste

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | MÅ | MÅ | MÅ | MÅ |

---

#### API-DESIGN-ekspert

**Hva gjør denne agenten?**
Definerer API-kontrakt - hvilke endpoints, request/response-format, auth, error-handling.

**Outputs:**
- OpenAPI/Swagger-spec
- API-dokumentasjon
- Error-handling-strategi
- Autentisering-design

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

### FASE 3: ARKITEKTUR OG SIKKERHET (Technical Design)

> Fra krav til teknisk arkitektur - HOW skal systemet bygges?

#### Prosess-agent: ARKITEKTUR-agent

**Hovedrolle:**
Designerer den tekniske arkitekturen. Samordner DATAMODELL-ekspert, TRUSSELMODELLERINGS-ekspert og INFRASTRUKTUR-ekspert.

**Typisk workflow:**
1. Fra API-spec → teknologi-valg
2. Database-design med DATAMODELL-ekspert
3. Sikkerhet med TRUSSELMODELLERINGS-ekspert
4. Infrastruktur-setup med INFRASTRUKTUR-ekspert
5. Outputter: Arkitektur-diagram, database-schema, sikkerhetstrusler, infra-kode

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### DATAMODELL-ekspert

**Hva gjør denne agenten?**
Designer databasen - tabeller, relasjoner, indeks, normalisering.

**Outputs:**
- ER-diagram
- SQL-schema
- Indekserings-strategi
- Backup-strategi

**Stack-relevans:**
✅ Supabase: JA - designer PostgreSQL-schema
⚪ Vercel: Nøytral - ingen database der

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### TRUSSELMODELLERINGS-ekspert

**Hva gjør denne agenten?**
Bruker STRIDE eller lignende metodikk til å identifisere sikkerhetstruslenger systematisk.

**Outputs:**
- Trusselmodell (STRIDE-format)
- Risiko-prioritering
- Mitigation-planer
- Sikkerhetstrusler-register

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### INFRASTRUKTUR-ekspert

**Hva gjør denne agenten?**
Designerer hvor og hvordan applikasjonen skal kjøre - serverless, containers, regioner, skalering.

**Outputs:**
- Infrastruktur-diagram
- IaC (Terraform/CloudFormation)
- Skaleringsplan
- Kostnads-estimat

**Stack-relevans:**
⚪ Supabase: Supabase-hosting
🟣 Vercel: Vercel Edge Functions + serverless

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

### FASE 4: MVP (Build Minimum Viable Product)

> Fra arkitektur til første, fungerende versjon.

#### Prosess-agent: MVP-agent

**Hovedrolle:**
Leder MVP-koding. Samordner CICD-ekspert, HEMMELIGHETSSJEKK-ekspert og DESIGN-TIL-KODE-ekspert.

**Typisk workflow:**
1. Opprett code-repo med riktig struktur
2. Sett opp CI/CD med CICD-ekspert
3. Implementer hemmelighets-sjekking med HEMMELIGHETSSJEKK-ekspert
4. Kode designs til React-komponenter med DESIGN-TIL-KODE-ekspert
5. Outputter: MVP-applikasjon, deployable til prod

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### CICD-ekspert

**Hva gjør denne agenten?**
Setter opp automatisert testing og deploy-pipeline via GitHub Actions.

**Outputs:**
- GitHub Actions-workflows
- Test-setup
- Deploy-script
- Environment-konfigurasjon

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | BØR | MÅ | MÅ | MÅ |

---

#### HEMMELIGHETSSJEKK-ekspert

**Hva gjør denne agenten?**
Implementerer hemmelighets-scanning i CI/CD for å forhindre lekkasjer.

**Outputs:**
- Pre-commit hooks
- CI/CD secrets-scanning
- Hemmelighets-rotasjon-plan

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| KAN | MÅ | MÅ | MÅ | MÅ |

---

#### DESIGN-TIL-KODE-ekspert

**Hva gjør denne agenten?**
Konverterer Figma-designs til React-komponenter med tailwind/CSS.

**Outputs:**
- React-komponenter
- Storybook-dokumentasjon
- CSS-moduler
- Design-system-implementasjon

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

### FASE 5: BYGG FUNKSJONENE (Refinement and Optimization)

> MVP er live - nå optimaliserer vi basert på bruker-feedback og data.

#### Prosess-agent: ITERASJONS-agent

**Hovedrolle:**
Leder iterasjonsloop av forbedringer. Samordner REFAKTORING-ekspert, YTELSE-ekspert og BRUKERTEST-ekspert.

**Typisk workflow:**
1. Samle bruker-feedback og metrics
2. Refactor problematisk kode med REFAKTORING-ekspert
3. Optimiser ytelse med YTELSE-ekspert
4. Gjennomfør brukertest med BRUKERTEST-ekspert
5. Itera basert på funn

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### REFAKTORING-ekspert

**Hva gjør denne agenten?**
Rydder og forbedrer kode - fjerner duplikater, forbedrer design-patterns, moderniserer.

**Outputs:**
- Refactored code
- Dokumentasjon av endringer
- Migrasjonsguide ved breaking changes

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### YTELSE-ekspert

**Hva gjør denne agenten?**
Optimaliserer ytelse - Core Web Vitals, database-queries, caching, bundle-size.

**Outputs:**
- Ytelse-rapport
- Optimaliserings-anbefalinger
- Benchmark-resultater
- CDN/caching-strategi

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### BRUKERTEST-ekspert

**Hva gjør denne agenten?**
Gjennomfører og analyserer brukertest-data - både automatisert (Hotjar, Fullstory) og manuel (user interviews).

**Outputs:**
- Brukertest-rapport
- Heatmap-analyse
- Session-recordings
- Forbedringsliste

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

### FASE 6: TEST, SIKKERHET OG KVALITETSSJEKK (QA and Security)

> Grundig testing før produksjonslansering.

#### Prosess-agent: KVALITETSSIKRINGS-agent

**Hovedrolle:**
Orchestrerer omfattende QA. Samordner OWASP-ekspert, GDPR-ekspert, TILGJENGELIGHETS-ekspert, CROSS-BROWSER-ekspert, LASTTEST-ekspert, TEST-GENERATOR-ekspert og SELF-HEALING-TEST-ekspert.

**Typisk workflow:**
1. Sikkerhetstesting med OWASP-ekspert
2. Compliance-sjekk med GDPR-ekspert
3. Tilgjengelighetstest med TILGJENGELIGHETS-ekspert
4. Cross-browser-testing med CROSS-BROWSER-ekspert
5. Lasttest med LASTTEST-ekspert
6. Test-coverage med TEST-GENERATOR-ekspert
7. Vedlikeholdbare tester med SELF-HEALING-TEST-ekspert
8. Outputter: QA-rapport, sikkerhetsattest, tilgjengelighetserklæring

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | MÅ | MÅ | MÅ |

---

#### OWASP-ekspert

**Hva gjør denne agenten?**
Tester mot OWASP Top 10 - SQL injection, XSS, CSRF, broken auth, etc.

**Outputs:**
- OWASP-testing-rapport
- Sikkerhetshull-liste med prioritering
- Mitigasjon-instruksjoner

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | MÅ | MÅ | MÅ |

---

#### GDPR-ekspert

**Hva gjør denne agenten?**
Validerer GDPR-compliance - samtykke-mekanismer, data-minimalisering, rett til sletting, logging.

**Outputs:**
- GDPR-compliance-rapport
- Privatskapserklæring
- DPA-template
- Bruker-data-håndtering-oppsumering

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### TILGJENGELIGHETS-ekspert

**Hva gjør denne agenten?**
Validerer WCAG 2.1 AA/AAA-compliance - skjermleser, tastatur, fargekontrast, video-underteksting.

**Outputs:**
- Tilgjengelighets-rapport (WAVE, axe)
- Manuell testing-resultater
- Mitigasjon-plan
- Tilgjengelighetserklæring (VPAT)

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | BØR | MÅ | MÅ |

---

#### CROSS-BROWSER-ekspert

**Hva gjør denne agenten?**
Tester på tvers av nettlesere og enheter - Chrome, Firefox, Safari, Edge, mobil.

**Outputs:**
- Cross-browser testing-rapport
- Kompatibilitetsliste
- Browser-spesifikke fixes

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### LASTTEST-ekspert

**Hva gjør denne agenten?**
Simulerer høy belastning - 1000+ samtidige brukere - for å finne bottlenecks.

**Outputs:**
- Lasttest-rapport
- Skaleringsrekommendasjoner
- Performance-profiler

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### TEST-GENERATOR-ekspert

**Hva gjør denne agenten?**
Genererer og vedlikeholder tests for å oppnå minst 70%+ coverage.

**Outputs:**
- Unit-tests
- Integration-tests
- E2E-tests
- Coverage-rapport

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### SELF-HEALING-TEST-ekspert

**Hva gjør denne agenten?**
Implementerer self-healing tests som automatisk oppdaterer seg når UI endres, i stedet for å bryte.

**Outputs:**
- Self-healing test-framework
- Test-vedlikeholds-prosedyre
- Automation-rules

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | BØR | MÅ |

---

#### TESTSKRIVER-ekspert

**Hva gjør denne agenten?**
Genererer automatiserte tester basert på kildekode og spesifikasjoner. Analyserer test coverage og identifiserer hull i testdekningen. Lager unit-tester, integrasjonstester og regresjonstester tilpasset prosjektets tech-stack.

**Brukes når:**
- Ny funksjonalitet skal testes automatisk
- Test coverage skal forbedres mot 70%+ mål
- Regresjonstester trengs etter refaktorering

**Outputs:**
- Automatisk genererte unit-tester
- Integrasjonstester for API-endepunkter og dataflyt
- Test coverage-analyse med identifiserte hull
- Regresjonstest-suiter

**Avhengigheter:**
- BYGGER-agent output (kildekode som skal testes)

**Kalles av:**
- 4-MVP-agent, 5-ITERASJONS-agent, 6-KVALITETSSIKRINGS-agent

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

### FASE 7: PUBLISER OG VEDLIKEHOLD (Release and Maintenance)

> Fra QA-godkjent til live, med overvåking og incident-respons.

#### Prosess-agent: PUBLISERINGS-agent

**Hovedrolle:**
Orchestrerer launch og drift. Samordner SRE-ekspert, MONITORING-ekspert, INCIDENT-RESPONSE-ekspert og BACKUP-ekspert.

**Typisk workflow:**
1. Deploy til produksjon med SRE-ekspert
2. Sett opp monitoring med MONITORING-ekspert
3. Etabler incident-respons med INCIDENT-RESPONSE-ekspert
4. Konfigurer backups med BACKUP-ekspert
5. Outputter: Produksjonssystem, monitoring-dashboards, runbooks

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### SRE-ekspert

**Hva gjør denne agenten?**
Site Reliability Engineer - deployment, skalering, reliability, uptime SLA.

**Outputs:**
- Deployment-guide
- Runbooks
- Konfigurasjons-management
- SLO/SLA-definisjon

**Stack-relevans:**
🟣 Vercel: Vercel deployment + edge functions
🟢 Supabase: Supabase database + auth ops

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

#### MONITORING-ekspert

**Hva gjør denne agenten?**
Setter opp logging, metrics, alerting - slik at du vet hvis noe går galt.

**Outputs:**
- Monitoring-setup (DataDog, New Relic, CloudWatch)
- Dashboard-konfigurasjoner
- Alert-regler
- Loggings-strategi

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| KAN | BØR | MÅ | MÅ | MÅ |

---

#### INCIDENT-RESPONSE-ekspert

**Hva gjør denne agenten?**
Planlegger og automatiserer respons på pålogg - varslinger, eskalering, kommunikasjon.

**Outputs:**
- Incident-policy
- On-call-scheduling
- Post-mortem-template
- Eskalerings-prosedyre

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

#### BACKUP-ekspert

**Hva gjør denne agenten?**
Sikrer at data kan gjenopprettes ved katastrofe - daily backups, offsite storage, restore-testing.

**Outputs:**
- Backup-strategi
- RTO/RPO-definisjon
- Restore-procedure
- Disaster-recovery-plan

**Stack-relevans:**
🟢 Supabase: Supabase backup-konfigurasjoner

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| KAN | BØR | MÅ | MÅ | MÅ |

---

## BASIS-AGENTER (Brukt på tvers av alle faser)

> Disse agentene hjelper til gjennom hele prosjektets livssyklus.

---

### BYGGER-agent

**Hva gjør denne agenten?**
Koder faktisk funksjonaliteten basert på arkitektur og design. Skriver kode, tester den, og lager PRs.

**Brukes i:**
Fase 4-5 (MVP, Bygg funksjonene)

**Typiske oppgaver:**
- Feature-implementasjon
- Bug-fixing
- Refactoring-implementasjon
- Test-writing

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

### DEBUGGER-agent

**Hva gjør denne agenten?**
Lokaliserer og fikser bugs. Analyserer error-messages, replikerer problemer, og implementerer fixes.

**Brukes i:**
Fase 4-7 (MVP til Publisering)

**Typiske oppgaver:**
- Bug-reproduksjon
- Root-cause-analyse
- Fix-implementasjon
- Regression-testing

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

### DOKUMENTERER-agent

**Hva gjør denne agenten?**
Dokumenterer systemet - API-docs, README, tutorials, changelog.

**Brukes i:**
Alle faser

**Typiske oppgaver:**
- API-dokumentasjon (OpenAPI/Swagger)
- README-writing
- Tutorial-kreering
- Changelog-vedlikehold

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

### PLANLEGGER-agent

**Hva gjør denne agenten?**
Planlegger arbeid - oppretter tasks, estimerer tid, setter prioriteter.

**Brukes i:**
Alle faser

**Typiske oppgaver:**
- Oppgave-opprettelse
- Sprint-planlegging
- Estimering
- Risiko-identifikasjon

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

### REVIEWER-agent

**Hva gjør denne agenten?**
Code review - sjekker kode før merge, gir tilbakemelding, approver PRs.

**Brukes i:**
Fase 4-7 (MVP til Publisering)

**Typiske oppgaver:**
- Code review
- Security review
- Architecture review
- PR-approval

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | MÅ | MÅ | MÅ |

---

### SIKKERHETS-agent

**Hva gjør denne agenten?**
Gjennomgår alle sikkerhetsbeslutninger - authentication, encryption, secrets management, access control.

**Brukes i:**
Fase 3-7 (Arkitektur til Publisering)

**Typiske oppgaver:**
- Sikkerheetsarkitektur-review
- Secrets-management
- SSL/TLS-setup
- Auth-implementasjon
- Vulnerability-scanning

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

### VEILEDER-agent

**Hva gjør denne agenten?**
Read-only veileder som hjelper brukeren forstå Kit CC, sitt prosjekt og relevante teknologier — uten å endre noen filer. Søker proaktivt på nett ved teknologispørsmål.

**Brukes i:**
Alle faser (aktiveres via boot-gate steg 0: "Spørre")

**Typiske oppgaver:**
- Forklare Kit CC-systemet og dets prosesser
- Gi oppdatert kunnskap om koding og teknologier via automatisk nettsøk
- Hjelpe brukeren forstå prosjektets status og fremdrift
- Sokratisk veiledning for beslutningsspørsmål

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| MÅ | MÅ | MÅ | MÅ | MÅ |

---

## SYSTEM-AGENTER (Orchestration)

> Disse agentene styrer selve systemet - de er ikke mennesker eller AI med spesialkompetanse, men "ledelsesautomatasjon".

---

### ORCHESTRATOR

**Hva gjør denne agenten?**
Master-orkestratoren. Styrer hvilken fase du er i, aktiverer relevante agenter, håndterer überganger mellom faser.

**Kan hun:**
- Aktivere/deaktivere agenter basert på fase
- Verifisere at gate-kriteria er møtt før fase-overgang
- Delegere til relevante agenter
- Håndtere parallelle oppgaver

**Tenk på det som:**
Prosjektlederen som vet hvem som skal gjøre hva og når.

---

### AUTO-CLASSIFIER

**Hva gjør denne agenten?**
Automatisk klassifiserer prosjektet basert på innledende spørsmål.

**Kan hun:**
- Stille 10 spørsmål for å bestemme intensitetsnivå (MINIMAL-ENTERPRISE)
- Anpass funksjoner basert på klassifisering
- Lagre klassifisering i CLAUDE.md

**Eksempel-spørsmål:**
- Hvor mange brukere venter du?
- Behandles det personopplysninger?
- Brukes AI-modeller i systemet?
- Og flere...

**Tenk på det som:**
En automatisk "kjør diagnostikk"-funksjon som sier "basert på svarene dine, her er hva du VIRKELIG trenger".

---

### PHASE-GATES

**Hva gjør denne agenten?**
Sjekker at alle krav for en fase er oppfylt før neste fase kan starte.

**Gate-eksempler:**

**Fase 1 → 2:**
- ✅ Personas-dokument eksisterer
- ✅ Lean Canvas godkjent
- ✅ Konkurranse-analyse gjort

**Fase 2 → 3:**
- ✅ Wireframes signert av stakeholders
- ✅ API-spec komplett
- ✅ UX-design i Figma

**Fase 3 → 4:**
- ✅ Arkitektur-diagram godkjent
- ✅ Database-schema definert
- ✅ Trusselmodell og mitigasjon
- ✅ Infra-kode skrevet

**Tenk på det som:**
En pilot-sjekkliste før takeoff - "alt må være grønt før vi flyr".

---

### CONTEXT-LOADER

**Hva gjør denne agenten?**
Starter hver sesjon ved å laste inn relevant kontekst.

**Laster inn:**
- CLAUDE.md (main project file)
- Fase-spesifikt dokument
- Nylig arbeidede filer
- Beslutningshistorikk

**Tenk på det som:**
"Assistent som leser møtenotatene før møte".

---

### AGENT-PROTOCOL

**Hva gjør denne agenten?**
Definerer standard format for agent-kommunikasjon.

**Standardiserer:**
- Message-format
- Handover-prosedyre
- Error-handling
- Logging

**Tenk på det som:**
"Grammatikk for agent-språk".

---

## ANDRE EKSPERT-AGENTER

> Spesialiserte agenter som brukes ved behov.

---

### AI-GOVERNANCE-ekspert

**Hva gjør denne agenten?**
Sikrer at AI-bruk i systemet følger retningslinjer - model-valg, prompt-engineering, feedback-loops, bias-testing.

**Brukes når:**
- Du bruker AI-modeller i systemet (chatbots, rekomendasjoner, etc)
- Du må dokumentere AI-avgjørelser (compliance)

**Outputs:**
- AI-governance-policy
- Model-selection-guide
- Bias-testing-resultat

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | BØR | MÅ |

---

### CODE-QUALITY-GATE-ekspert

**Hva gjør denne agenten?**
Implementerer og vedlikeholder automatiske kodekvality-gates - linting, formatting, complexity-analyser.

**Brukes når:**
- Du vil sikre konsistent kodekvalitet
- Du har streng compliance-krav

**Outputs:**
- ESLint/Prettier-konfigurering
- Code-complexity-treshold
- Quality-gate-reports

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | KAN | BØR | MÅ | MÅ |

---

### MIGRASJON-ekspert

**Hva gjør denne agenten?**
Planlegger og implementerer migrasjoner - av data, arkitektur, platform, eller teknologi-stack.

**Brukes når:**
- Bytting av database-system
- Bytting av hosting-provider
- Major versjon-upgrades

**Outputs:**
- Migrasjons-plan
- Rollback-strategi
- Data-validering-script

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | BØR | MÅ |

---

### PROMPT-INGENIØR-ekspert

**Hva gjør denne agenten?**
Optimaliserer prompts til AI-modeller for bedre resultat - eksperimenter med struktur, tone, examples.

**Brukes når:**
- Du bruker AI-modeller og er usatisfakt med resultat
- Du vil forbedre prompt-quality

**Outputs:**
- Optimaliserte prompts
- Few-shot-examples
- Prompt-testing-resultat

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | KAN | BØR |

---

### SUPPLY-CHAIN-ekspert

**Hva gjør denne agenten?**
Sikrer sikkerhet i hele dependency-kjeden - scanning av packages, compliance-sjekk, license-audits.

**Brukes når:**
- Du har strenge sikkerhet-krav
- Du må dokumentere alle dependencies

**Outputs:**
- SBOM (Software Bill of Materials)
- Vulnerability-rapport
- License-compliance-rapport

**Klassifisering:**

| MIN | FOR | STD | GRU | ENT |
|-----|-----|-----|-----|-----|
| IKKE | IKKE | KAN | BØR | MÅ |

---

## OPPSUMMERING: KLASSIFISERINGS-INTENSITETSNIVÅER

### Kort forklaring

| Nivå | Hvem er det for? | MÅ | BØR | KAN | Typisk tid |
|------|-----------------|-----|------|------|-----------|
| **MINIMAL** | Solo hobbyprosjekter | Kjerne | ❌ | ❌ | 1-2 uker |
| **FORENKLET** | Små interne verktøy | Kjerne | Noen | ❌ | 3-4 uker |
| **STANDARD** | Normale kundeprosjekter | Alle | Alle | Noen | 6-8 uker |
| **GRUNDIG** | Enterprise/sensitive | Alle | Alle | Alle | 10-12 uker |
| **ENTERPRISE** | Høy risiko + compliance | Alle + extra | Alle + extra | Alle + extra | 14-16 uker |

### Hva endrer seg mellom nivåer

| Aspekt | MINIMAL | FORENKLET | STANDARD | GRUNDIG | ENTERPRISE |
|--------|---------|-----------|----------|---------|-----------|
| **Design** | Wireframe | Wireframe | Full | Full + prototype | Full + user-tested |
| **Testing** | Manual | Unit-tests | Unit + E2E | 80%+ coverage | 90%+ coverage + pentest |
| **Security** | Basis | HTTPS + auth | OWASP Top 10 | Trusselmodell | Penetrasjon + compliance |
| **GDPR** | ❌ | ✅ Data-inventory | ✅ + samtykke | ✅ + DPIA | ✅ + juridisk review |
| **Performance** | ❌ | Manual | Automated | Lasttest | 24/7 monitoring |
| **Documentation** | ❌ | README | API docs | Full docs | Compliance docs |

---

## QUICK START: Velge intensitet

**Svar på disse spørsmålene:**

1. **Hvor mange brukere?**
   - Under 10 → MINIMAL
   - 10-100 → FORENKLET
   - 100-1000 → STANDARD
   - 1000+ → GRUNDIG/ENTERPRISE

2. **Sensitiv data?**
   - Ingen → -1 nivå
   - Persondata (GDPR) → +1 nivå
   - Helsedata/finans → +2 nivå

3. **Kundes penger involvert?**
   - Nei → -1 nivå
   - Ja, under €10k → neutral
   - Ja, over €10k → +1 nivå

4. **Team størrelse?**
   - Solo → -1 nivå
   - 1-3 personer → neutral
   - 3+ personer → +1 nivå

---

*Versjon: 2.2.1*
*Opprettet: 2026-02-02*
*Sist oppdatert: 2026-04-22*
*Agent-fasit: Se `Agenter/VERSION.json` (6 system + 7 basis + 7 prosess + 37 ekspert = 57 totalt)*
*Status: Komplett og godkjent — Dekker alle 3 kategorier (INF/VKT/PRO), alle 7 faser, alle 57 agenter*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
