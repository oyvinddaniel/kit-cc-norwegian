# protocol-BYGGEMODUS.md — Strukturerte Beslutningsporter

> **SSOT for byggemodus-klassifisering og agent-oppførsel**
> Alle fase-agenter følger disse reglene når de møter vesentlige beslutninger.

---

## BYGGEMODUS-OVERSIKT

| Modus | Betegnelse | Atferd | Brukstilfelle |
|-------|-----------|--------|--------------|
| **ai-bestemmer** | AI bestemmer | AI velger og implementerer autonomt | Erfarne brukere som vil ha rask fremdrift |
| **samarbeid** | Samarbeid | AI foreslår, bruker godkjenner vesentlige valg | Balansert samarbeid mellom bruker og AI |
| **detaljstyrt** | Detaljstyrt kontroll | For HVER beslutning: AI presenterer alternativer, bruker velger | Brukere som vil kontrollere alle valg |

---

## BESLUTNINGSPORT-MØNSTER (Decision Gate Pattern)

Denne algoritmen kjører HVER gang en fase-agent må ta en vesentlig beslutning.

### Algoritme

```
VED HVER VESENTLIG BESLUTNING:

1. LES MODUS:
   → Les builderMode fra PROJECT-STATE.json
   → Gyldig? (ai-bestemmer / samarbeid / detaljstyrt)
      Hvis ugyldig eller mangler → Spør bruker: "Hvilken byggemodus vil du bruke? (1) ai-bestemmer (2) samarbeid (3) detaljstyrt" → Lagre valget

2. KLASSIFISER BESLUTNINGEN (velg en kategori):

   TEKNISK BESLUTNING:
   • Rammeverk (React, Next, Vue, etc.)
   • Database (PostgreSQL, MongoDB, etc.)
   • Arkitektur (MVC, mikroservices, monolitt)
   • API-design (REST, GraphQL, gRPC)
   • Build-verktøy (webpack, vite, esbuild, etc.)
   • Testing-rammeverk
   • Deployment-strategi

   FUNKSJONELL BESLUTNING:
   • Feature-prioritering (hvilken feature først?)
   • UX-valg (design, layout, komponenter)
   • Feature-scope (hva inkluderes i feature?)
   • Bruker-flyt (hvordan skal bruker navigere?)
   • Validerings-regler

   OPERASJONELL BESLUTNING:
   • Filstruktur (folder-layout, modulnavn)
   • Navngiving-konvensjoner (camelCase, snake_case, etc.)
   • Versjonering-strategi
   • Branching-strategi
   • Dokumentasjon-format
   • Logging-nivå

3. ANVEND MODUS-REGLER:

   ╔═══════════════════════════════════════════════════════════════╗
   ║ ai-bestemmer (FULL AUTONOMI)                                 ║
   ║ Ved `ai-bestemmer`: Se ZONE-AUTONOMY-GUIDE.md for automatisk ║
   ║ risikovurdering per oppgave (GREEN/YELLOW/RED).              ║
   ╠═══════════════════════════════════════════════════════════════╣
   ║ TEKNISK:                                                      ║
   │  → Bestem selv basert på beste praksis                        ║
   │  → Logg: "⚙️ AUTO-BESLUTNING: [valg] — [begrunnelse]"        ║
   │  → Eksempel: "⚙️ AUTO-BESLUTNING: TypeScript med strict mode ║
   │     — typsikkerhet er kritisk for denne appen"               ║
   ║                                                               ║
   ║ FUNKSJONELL:                                                  ║
   │  → Bestem selv basert på wireframes/krav                      ║
   │  → Logg: "⚙️ AUTO-BESLUTNING: [valg] — [begrunnelse]"        ║
   ║                                                               ║
   ║ OPERASJONELL:                                                 ║
   │  → Bestem selv basert på beste praksis                        ║
   │  → Logg: "⚙️ AUTO-BESLUTNING: [valg] — [begrunnelse]"        ║
   ╚═══════════════════════════════════════════════════════════════╝

   ╔═══════════════════════════════════════════════════════════════╗
   ║ samarbeid (BALANSERT)                                         ║
   ╠═══════════════════════════════════════════════════════════════╣
   ║ TEKNISK:                                                      ║
   │  → Foreslå valg med 2-3 senter-setningers begrunnelse        ║
   │  → Vent på brukers godkjenning                                ║
   │  → Hvis bruker godkjenner → Logg: "🤝 GODKJENT: [valg]"      ║
   │  → Format: "Anbefalt: [valg]. Grunner: [1-3 bullets]"        ║
   ║                                                               ║
   ║ FUNKSJONELL:                                                  ║
   │  → Foreslå feature-prioritering med begrunnelse               ║
   │  → Vent på brukers godkjenning                                ║
   │  → Logg: "🤝 GODKJENT: [valg]"                               ║
   ║                                                               ║
   ║ OPERASJONELL:                                                 ║
   │  → Bestem selv basert på beste praksis                        ║
   │  → Logg: "⚙️ AUTO-BESLUTNING: [valg] — [begrunnelse]"        ║
   ╚═══════════════════════════════════════════════════════════════╝

   ╔═══════════════════════════════════════════════════════════════╗
   ║ detaljstyrt (FULL KONTROLL)                                   ║
   ╠═══════════════════════════════════════════════════════════════╣
   ║ TEKNISK:                                                      ║
   │  → List 2-4 alternativer                                      ║
   │  → For hvert alternativ: 2-3 senter-setningers fordeler +    ║
   │     1-2 setningers ulemper                                    ║
   │  → Spør bruker: "Hvilket alternativ velger du?"               ║
   │  → Vent på brukers valg                                       ║
   │  → Logg: "🔀 VALGT: [brukervalg] (av [X] alternativer)"      ║
   ║                                                               ║
   ║ FUNKSJONELL:                                                  ║
   │  → List prioriterings-alternativer                            ║
   │  → Vis konsekvenser (tidsplan-påvirkning, risiko)             ║
   │  → Spør bruker: "Hvilken rekkefølge?"                         ║
   │  → Logg: "🔀 VALGT: [brukervalg]"                            ║
   ║                                                               ║
   ║ OPERASJONELL:                                                 ║
   │  → Foreslå valg med begrunnelse                               ║
   │  → Spør bruker: "Godkjenn eller endre?"                       ║
   │  → Logg: "🔀 VALGT: [brukervalg]"                            ║
   ╚═══════════════════════════════════════════════════════════════╝
```

### Eksempler fra praksis

**Scenario 1: Velge database (TEKNISK beslutning)**

- **ai-bestemmer:** "⚙️ AUTO-BESLUTNING: PostgreSQL med Prisma ORM — relasjonsdatabase gir best integritet for e-handelsdata"
- **samarbeid:** "Anbefalt: PostgreSQL. Grunner: ACID-garantier, godt TypeScript-støtte, skalerer til stor volum. OK?"
- **detaljstyrt:** "Tre alternativer:
  1. PostgreSQL (Prisma) — ACID-garantier, maturer ORM, best for relasjonell data
  2. MongoDB (Mongoose) — Fleksibel schema, raskere dev, mindre transaksjonsstøtte
  3. Supabase (PostgreSQL i skyen) — Samme som 1, men hosted, mindre ops
  Hvilket velger du?"

**Scenario 2: Prioritere features i Fase 5 (FUNKSJONELL beslutning)**

- **ai-bestemmer:** "⚙️ AUTO-BESLUTNING: Bygg innlogging først — blokkerer alle andre features"
- **samarbeid:** "Anbefalt rekkefølge: 1) Innlogging 2) Produktliste 3) Handlekurv. Grunner: innlogging er kritisk, resten avhenger av det. Enig?"
- **detaljstyrt:** "Tre rekkefølger mulig:
  1. Innlogging → Produktliste → Handlekurv (kritisk-først) — blokkerer mindre, ferdig tidligere
  2. Produktliste → Innlogging → Handlekurv (brukbar demo) — kan vise data uten auth først
  3. Handlekurv → Innlogging → Produktliste (shopping-først) — uvanlig, ikke anbefalt
  Hvilket velger du?"

**Scenario 3: Bestemme fil-struktur (OPERASJONELL beslutning)**

- **ai-bestemmer:** "⚙️ AUTO-BESLUTNING: Feature-based struktur (src/features/auth/, src/features/products/, etc.) — skalerer bedre"
- **samarbeid:** "Bestemmer: Feature-based fil-struktur. (Operasjonelle valg tas autonomt.)"
- **detaljstyrt:** "Foreslår: Feature-based struktur. Fordel: hver feature har kode + tester + komponenter samlet. Godkjenn eller endre?"

---

## SIKKERHETSNETT (Security-Override)

**Selv i `ai-bestemmer` modus** — disse beslutningene KREVER ALLTID bruker-godkjenning:

1. **Sikkerhetsbeslutninger:**
   - Authentication og autorisasjon
   - Kryptering og data-sensitiv håndtering
   - Tilgangskontroll og permissions
   - GDPR/personvern-relatert

2. **Irreversible valg:**
   - Sletting av filer, data eller historikk
   - Breaking changes på API eller database-schema
   - Konfigurasjoner som ikke kan rulles tilbake
   - Publisering eller deployment

3. **Økonomiske/ressurs-konsekvenser:**
   - Valg av betalt infrastruktur
   - Endring av SLA eller ytelse-karakteristikker
   - Valg som øker operational complexity

**Format for sikkerhetsnett-spørsmål:**

```
⚠️ SIKKERHET-SJEKK — Krever bruker-godkjenning (selv i ai-bestemmer):

[Beskrivelse av valg]
Konsekvenser: [hva betyr dette?]
Reversibelt? [Ja/Nei]

OK? (ja/nei)
```

---

## FASE 5 UNNTAK — BRUKER GODKJENNER ALLTID RESULTATET

> **Selv i `ai-bestemmer` modus** gjelder dette i Fase 5 (Bygg funksjonene):

**builderMode styrer KUN tekniske implementasjonsvalg** — altså HOW (hvordan koden skrives):
- Hvilken database, hvilket pattern, hvilken filstruktur, hvilken rekkefølge
- Discussion Gate i BYGGER-agent tilpasses builderMode

**builderMode styrer ALDRI kvalitetsvurdering av resultatet** — altså WHETHER (om resultatet er godt nok):
- Etter at en modul er ferdigbygd, MÅ bruker alltid se resultatet og godkjenne
- AI kan IKKE auto-godkjenne en modul, uansett byggemodus
- Steg 5B (Modul-godkjenning) i ITERASJONS-agent er et hard-stop som gjelder alle modi

**Praktisk forskjell i Fase 5:**

| Handling | ai-bestemmer | samarbeid | detaljstyrt |
|----------|-------------|-----------|-------------|
| Tekniske valg under bygging | AI bestemmer | AI foreslår, bruker godkjenner | Bruker velger fra alternativer |
| Modul ferdigbygd → vise og godkjenne | **Bruker MÅ godkjenne** | **Bruker MÅ godkjenne** | **Bruker MÅ godkjenne** |
| Gå videre til neste modul | **Kun etter bruker sier "Go"** | **Kun etter bruker sier "Go"** | **Kun etter bruker sier "Go"** |

**Begrunnelse:** Fase 5 er der brukeren ser resultatet av sitt prosjekt for første gang. Selv den mest autonome byggemodus skal ikke ta fra brukeren retten til å vurdere om resultatet er godt nok. "AI bestemmer" betyr "AI bestemmer teknisk tilnærming" — ikke "AI bestemmer at brukeren er fornøyd."

---

## MODUS-BYTTE KOMMANDO

**Brukerkommando:** `"Bytt byggemodus"`

**Agentens arbeidsflyt:**

1. **Les gjeldende modus** fra `PROJECT-STATE.json` → `builderMode`
2. **Vis status til bruker:**
   ```
   🔧 BYGGEMODUS: Bytte

   Gjeldende: [NAVN] ([modus])

   Hva betyr hver modus?
   • ai-bestemmer: AI tar alle beslutninger autonomt. Du godkjenner når vi er ferdig.
   • samarbeid: AI foreslår valg, du godkjenner vesentlige beslutninger (teknisk + funksjonell).
   • detaljstyrt: For hver beslutning, stopp og spør deg. Du velger fra alternativer.

   Hvilken modus vil du bruke?
   ```

3. **Les brukerens valg** → `[ny-modus]`

4. **Valider** at `[ny-modus]` ∈ {ai-bestemmer, samarbeid, detaljstyrt}

5. **Oppdater PROJECT-STATE.json:**
   ```json
   {
     "builderMode": "[ny-modus]",
     "modeChangedAt": "[ISO 8601 timestamp]"
   }
   ```

6. **Logg til `.ai/PROGRESS-LOG.jsonl`:**
   ```
   {"ts":"<ISO 8601>","event":"MODE_CHANGE","from":"[fra]","to":"[til]","schemaVersion":1}
   ```

7. **Bekrefter til bruker:**
   ```
   ✅ Byggemodus endret: [fra] → [til]

   Fra nå av: [kort beskrivelse av ny atferd]
   ```

---

## KLASSIFISERING AV BESLUTNINGER — RASK REFERANSE

| Beslutningstype | Eksempel | Teknisk | Funksjonell | Operasjonell |
|-----------------|----------|---------|------------|--------------|
| Framework | "Bruke React?" | ✅ | | |
| Database | "SQL eller NoSQL?" | ✅ | | |
| API-design | "REST eller GraphQL?" | ✅ | | |
| Feature-prioritering | "Hva først?" | | ✅ | |
| UX-valg | "Modal eller side?" | | ✅ | |
| Filstruktur | "Feature-based?" | | | ✅ |
| Navngiving | "camelCase?" | | | ✅ |
| Branching | "Git flow?" | | | ✅ |

**Regel:** Hvis du er usikker — klassifiser som TEKNISK (mest konservativt, krever mest kontroll).

---

## LOGGING-FORMAT

Alle byggemodus-beslutninger loggføres til `.ai/PROGRESS-LOG.jsonl` med konsistent format:

```
{"ts":"<ISO 8601>","event":"AUTO_DECISION","what":"[valg]","reason":"[kort begrunnelse, 1-2 setninger]","schemaVersion":1}
{"ts":"<ISO 8601>","event":"APPROVED","what":"[valg]","by":"user","schemaVersion":1}
{"ts":"<ISO 8601>","event":"USER_CHOICE","what":"[brukervalg]","mode":"detaljstyrt","schemaVersion":1}
{"ts":"<ISO 8601>","event":"MODE_CHANGE","from":"[fra]","to":"[til]","schemaVersion":1}
```

---

## IMPLEMENTERING FOR FASE-AGENTER

### Steg-for-steg for agentfiler

1. **Før hver vesentlig beslutning:**
   ```
   # I agentfilen, før koden som gjør beslutningen:
   → Les builderMode fra PROJECT-STATE.json
   → Klassifiser beslutningen (teknisk/funksjonell/operasjonell)
   → Følg beslutningsport-mønsteret (Algoritme-seksjonen)
   ```

2. **Implementer beslutningen** basert på modus

3. **Logg til `.ai/PROGRESS-LOG.jsonl`** umiddelbart etter implementering

4. **Oppdater PROJECT-STATE.json** etter 3 fullførte oppgaver (eller modus-bytte)

### Template for agentfiler

```markdown
## BYGGEMODUS-RESPEKT

Denne agenten følger `protocol-BYGGEMODUS.md`:
- Lesing: `builderMode` fra PROJECT-STATE.json
- Ved hver TEKNISK/FUNKSJONELL/OPERASJONELL beslutning: anvend modus-regler
- Logging: Append til `.ai/PROGRESS-LOG.jsonl` med riktig format (⚙️ / 🤝 / 🔀)
- Sikkerhetsnett: Sikkerhet + irreversible + økonomisk krever alltid bruker-godkjenning

Se `protocol-BYGGEMODUS.md` → BESLUTNINGSPORT-MØNSTER for full algoritme.
```

---

## FEIL-HÅNDTERING

### Hvis `builderMode` er:
- **Ugyldig eller mangler** → Be bruker velge byggemodus ved å vise alternativer: ai-bestemmer, samarbeid, detaljstyrt
- **Endret under sesjon** → les ny verdi fra PROJECT-STATE.json ved neste beslutning

### Hvis bruker ikke svarer på spørsmål
- **samarbeid-modus** etter 30 sekunder → anta bruker godkjenner, logg "🤝 GODKJENT: [forslag] (timeout, antar ja)"
- **detaljstyrt-modus** etter 30 sekunder → still spørsmål på nytt, max 2 ganger. Etter det → eskalér til bruker

### Hvis beslutningen er uvanlig
- Kontakt ORCHESTRATOR (Lag 3) hvis du er usikker på klassifisering
- Logg din usikkerhet i PROGRESS-LOG: "❌ USIKKER: [beslutning] — trenger oppklaring"
- Kontakt bruker før implementering

---

## VERSJONERING

| Versjon | Dato | Endring |
|---------|------|--------|
| 1.0 | 2026-02-16 | Initiell release — Strukturerte Beslutningsporter for byggemodus |
| 1.1 | 2026-02-20 | Fase 5 unntak — bruker godkjenner alltid modul-resultat uansett builderMode |
| 1.1.0 | 2026-04-22 | Versjonsnormalisering — footer synkronisert til v1.1.0 |

---

## RELATERTE FILER

- **CLAUDE.md** — Hovedoppstart, definerer "Bytt byggemodus"-kommando
- **MISSION-BRIEFING-MAL.md** — Inkluderer `builderMode` i header
- **protocol-SYSTEM-COMMUNICATION.md** — Kommunikasjonsstil basert på bruker-nivå (separate fra byggemodus)
- **PROJECT-STATE.json** — Lagrer gjeldende `builderMode` og `modeChangedAt`
- **`.ai/PROGRESS-LOG.jsonl`** — Logger alle byggemodus-beslutninger

---

*Versjon: 1.1.0*
*Sist oppdatert: 2026-04-22*
*Mal-versjon: 1.1.0*
*Kompatibel med: Kit CC v3.5.0*
*Hierarkisk kontekstlag: Lag 2 (Skrivebordsskuff)*
*SSOT: Ja — Denne filen er eneste kilde for byggemodus-oppførsel*

> **Systemversjon:** Se `Kit CC/Agenter/VERSION.json` for Kit CC-versjon.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
