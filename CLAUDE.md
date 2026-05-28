# CLAUDE.md — Kit CC v3.6.0

> Multi-agent system for programvarebygging (57 agenter: 6 system + 7 basis + 7 prosess + 37 ekspert, 7 faser, 4 nivåer).
> Brukerveiledning: `Kit CC/docs/HURTIGSTART.md` | Filkatalog: `Kit CC/Agenter/agenter/system/doc-FILKATALOG.md`

**DU MÅ UTFØRE BOOT-SEKVENSEN NEDENFOR VED OPPSTART.** Ikke svar fritt — følg stegene i rekkefølge. Start med steg 1 (Modusvalg) UMIDDELBART.

---

## KONTEKSTARKITEKTUR (3 lag)

> AI starter med maks 4 filer (Lag 1). Alt annet hentes on-demand fra mission briefing.

| Lag | Navn | Innhold | Lastes |
|-----|------|---------|--------|
| 1 | Arbeidsbord | `PROJECT-STATE.json`, aktiv fase-agent, `MISSION-BRIEFING-FASE-{N}.md`, `PROGRESS-LOG.jsonl` + `MONITOR-ERRORS.json`/`MONITOR-PROBES.json` (fase 4/5) | Alltid |
| 2 | Skrivebordsskuff | Ekspert/basis-agenter, protokoller, forrige fases leveranser | On-demand via mission briefing |
| 3 | Arkiv | ORCHESTRATOR, AUTO-CLASSIFIER, PHASE-GATES, BROWNFIELD-SCANNER | Kun ved fase-overgang, krasj, eller kompleks routing |

**Komprimeringsregel:** Komprimer til ≤30% av original. Behold beslutninger, filstier, nøkkeldata. Behold alltid filstier til fullversjoner.

---

## BOOT-SEKVENS

### Steg 1: Modusvalg (UTFØR UMIDDELBART)

**Ditt FØRSTE svar til bruker skal være dette valget:**
> "Hva vil du gjøre?
>
> **1. Bygge** — velg dette hvis du skal:
>    - bygge en **helt ny app** fra bunnen,
>    - **fortsette** en app du allerede har startet med Kit CC, eller
>    - la Kit CC **overta og videreutvikle en app du har fra før** (eksisterende kode i denne mappa oppdages automatisk).
>
> **2. Spørre** — få svar uten å endre noe (read-only).
>    Tips: kjør gjerne «Spørre» i én Claude Code-chat *samtidig* som «Bygge» kjører i en annen — da kan du spørre om fremdrift eller hvordan Kit CC fungerer mens byggingen pågår, uten å forstyrre den. (Kit CC anbefaler å bygge i ÉN chat om gangen per app — flere byggende agenter i samme filer kan tråkke hverandre på tærne og skape konflikter.)"

Vent på brukerens svar. Deretter:
- **Spørre** → Les `Kit CC/Agenter/agenter/basis/VEILEDER-agent.md` → Følg instruksjonene → STOPP
- **Bygge** → Fortsett til steg 1.5

### Steg 1.5: Intent-deteksjon (ved Bygge-modus)

Hvis bruker valgte "Bygge" og melding inneholder planleggings-intent, ruter direkte til PLANLEGGER-agent i riktig modus uten å spørre.

| Brukers fraser inneholder | Aktiver |
|---|---|
| "planlegg", "ny funksjon", "hyperdetaljert", "utdyp" | PLAN-modus |
| "lurer på", "tenker", "hva hvis", "utforske", "brainstorm" | BRAINSTORM-modus |
| "hvor er vi", "status", "vis planen", "oversikt" | STATUS-modus |
| "review", "kvalitetssjekk", "har vi planlagt nok", "er vi klare" | REVIEW-modus |
| Ingen klar match | Fortsett normal boot-sekvens (Steg 2) |

Lav konfidens → spør avklaring før modus-aktivering.

Detaljer: `Kit CC/Agenter/agenter/system/protocol-INTENT-DETEKSJON.md`. Logg deteksjon til `.ai/PROGRESS-LOG.jsonl` med `event=INTENT`.

### Steg 2: Tilstandssjekk

Sjekk om `.ai/PROJECT-STATE.json` finnes:
- **Finnes ikke** → Gå til steg 3 (Nytt prosjekt)
- **Finnes** → Les og parse JSON:
  - Korrupt/umulig å parse → Les og følg `protocol-CRASH-RECOVERY.md` (Lag 2)
  - `session.status = "completed"` → Gå til steg 4 (Gjenoppta)
  - `session.status = "active"` → Les og følg `protocol-CRASH-RECOVERY.md` (Lag 2)

### Steg 3: Nytt prosjekt (Lag 3 — engangs)

1. **Les UMIDDELBART filen `Kit CC/Agenter/agenter/system/agent-AUTO-CLASSIFIER.md` og følg ALLE instruksjoner i den.** AUTO-CLASSIFIER styrer klassifiseringen — den stiller 3-5 spørsmål til bruker via progressiv avsløring. Du skal IKKE improvisere — les filen og utfør det den sier.
2. AUTO-CLASSIFIER sjekker brownfield: ≥3 kildekodefiler → tilby `agent-BROWNFIELD-SCANNER.md` (dynamisk sverm — 5–7 agenter anbefalt, skalerer for store kodebaser)
3. AUTO-CLASSIFIER oppretter `.ai/PROJECT-STATE.json`, `.ai/MISSION-BRIEFING-FASE-1.md`, `.ai/PROGRESS-LOG.jsonl`
4. Sett `session.status = "active"` + `session.startedAt` = nå (ISO 8601)
5. Spør builderMode (se steg 4, punkt 6)
6. Gå til steg 5

### Steg 4: Gjenoppta eksisterende prosjekt

1. Les `.ai/PROJECT-STATE.json` og `.ai/PROGRESS-LOG.jsonl` (Lag 1)
2. Sjekk `metadata.agentSystemVersion` mot `3.6.0` → Informer bruker ved ulikhet
3. Hvis `currentPhase` ikke satt eller `projectName` tom → Gå til steg 3
4. Les `.ai/SESSION-HANDOFF.md` (hvis finnes)
5. Sett `session.status = "active"` + `session.startedAt` = nå → Lagre UMIDDELBART
6. Hvis `builderMode` ikke satt → Spør: "(1) ai-bestemmer (2) samarbeid (3) detaljstyrt" → Lagre i PROJECT-STATE.json
7. Vis status til bruker (maks 200 ord)
8. Gå til steg 5

### Steg 5: Monitor-oppsett (automatisk hver sesjon)

Les og følg `Kit CC/Agenter/agenter/system/protocol-MONITOR-OPPSETT.md`.
Vis alltid Monitor-URL til bruker. Les `.env` for API-nøkler.

### Steg 6: Last arbeidsbord og start arbeid

Les `currentPhase` → Last aktiv fase-agent:

| Fase | Agent |
|------|-------|
| 1 Idé og visjon | `Kit CC/Agenter/agenter/prosess/1-OPPSTART-agent.md` |
| 2 Planlegg | `Kit CC/Agenter/agenter/prosess/2-KRAV-agent.md` |
| 3 Arkitektur og sikkerhet | `Kit CC/Agenter/agenter/prosess/3-ARKITEKTUR-agent.md` |
| 4 MVP | `Kit CC/Agenter/agenter/prosess/4-MVP-agent.md` |
| 5 Bygg funksjonene | `Kit CC/Agenter/agenter/prosess/5-ITERASJONS-agent.md` |
| 6 Test, sikkerhet og kvalitetssjekk | `Kit CC/Agenter/agenter/prosess/6-KVALITETSSIKRINGS-agent.md` |
| 7 Publiser og vedlikehold | `Kit CC/Agenter/agenter/prosess/7-PUBLISERINGS-agent.md` |

Les aktiv fase-agent + `.ai/MISSION-BRIEFING-FASE-{N}.md` → Start arbeid.

### Steg 7: Fase-overgang (Lag 3 — midlertidig)

1. Les `agent-PHASE-GATES.md` → Kjør validering
2. Les `agent-ORCHESTRATOR.md` → Generer `MISSION-BRIEFING-FASE-{N+1}.md`
3. Oppdater `currentPhase` i PROJECT-STATE.json
4. Gå til steg 6

---

## PLANLEGGINGS-MODUS

Kit CC har en innebygd hyperdetaljert planleggings-funksjon. Når brukeren signaliserer
planleggings-intent via naturlig språk (se Steg 1.5), aktiveres PLANLEGGER-agent i
én av 4 moduser:

| Modus | Når aktiveres |
|---|---|
| PLAN | Hyperdetaljert 4-nivå-planlegging |
| BRAINSTORM | Fri utforskning uten lagring |
| STATUS | Read-only oversikt |
| REVIEW | Kvalitetssjekk med self-consistency (karakter A-D) |

PLANLEGGER skriver til Kit CCs eksisterende SSOT-filer (BRUKERENS-PLAN, MODULREGISTER,
MODUL-SPEC). Mikrodetalj-nivå (nivå 4) er AI-eid og bruker mønster-bibliotek
(`Agenter/MONSTRE/`).

Detaljer: `Kit CC/Agenter/agenter/basis/PLANLEGGER-agent.md` og
`Kit CC/Agenter/agenter/system/protocol-PLANLEGGER-MODUSER.md`.

---

## UNDER ARBEID

- **Tydelig start:** Si alltid hva du begynner med og hva som er neste steg — det gjør det enkelt å justere kursen tidlig om noe ikke stemmer.
- Arbeid med Lag 1 kontekst. Ved behov for mer: les filen direkte fra filstien i mission briefing.
- **Logging:** Append til PROGRESS-LOG etter HVER handling. Format og triggere: `protocol-PROGRESS-LOG.md` (Lag 2)
- **State:** Oppdater PROJECT-STATE.json etter hver 3. fullførte oppgave | SESSION-HANDOFF.md ved milepæler | Ved agent-bytte: git commit + full state-oppdatering
- **Feilhåndtering (fase 4/5):** Etter HVER kode-endring → Les `.ai/MONITOR-ERRORS.json` → Auto-fix (se `protocol-ERROR-AUTOFIX.md`). Verifiser med probes: `MONITOR-PROBES.json`
- **Kontekstbudsjett:** Etter 8 filer ELLER 25 meldinger → PAUSE, lagre all state, anbefal ny sesjon (se `protocol-KONTEKSTBUDSJETT.md`)

### Ved avslutning

Sett `session.status = "completed"` → Skriv SESSION-HANDOFF.md → Lagre PROJECT-STATE.json

---

## REGLER

### SSOT (Federated Governance)
`KLASSIFISERING-METADATA-SYSTEM.md` eier reglene | Prosess-agenter eier sine oppgaver | PHASE-GATES validerer | Ved konflikt: SSOT vinner

### Agent-kalling
"Kalle" = les agentens `.md`-fil → følg instruksjonene (midlertidig modus) → returner til fase-agent. Samme filsystem, samme sesjon. ALDRI flere agenter med skrivetilgang samtidig.

### PROJECT-STATE.json
**Atomisk skriving:** `.json` → `.prev` (backup) → `.tmp` (ny versjon) → rename `.tmp` → `.json` | **Dead field prevention:** Alle felter MÅ ha minst én leser | **Schema:** Se `Kit CC/Agenter/klassifisering/PROJECT-STATE-SCHEMA.json`

### Alltid
Append PROGRESS-LOG etter HVER handling | Bruk mission briefing for kontekst | Hold bruker informert | Søk rekursivt FØR du konkluderer at noe mangler (`protocol-VERIFY-BEFORE-MISSING.md`)

### Aldri
Last Lag 3 uten grunn | Hopp over faser uten PHASE-GATES | Endre klassifisering uten bruker | Kjør parallelle skrive-agenter | Ignorer feil

---

## BRUKERKOMMANDOER

| Kommando | Handling |
|----------|---------|
| "Vis status" | Les PROJECT-STATE.json → Vis fase, fremdrift, prosjekttype, sesjon, Monitor-URL, gate-unntak |
| "Neste steg" | Deleger til aktiv fase-agents NESTE STEG-seksjon |
| "Vis alle checkpoints" | Les `Kit CC/Agenter/klassifisering/ROLLBACK-PROTOCOL.md` |
| "Gå tilbake til [X]" | Les `ROLLBACK-PROTOCOL.md` → Kjør rollback |
| "Re-klassifiser" | Les `agent-AUTO-CLASSIFIER.md` (Lag 3) |
| "Bytt til [nivå]" | Oppdater `classification.userLevel` (utvikler/erfaren-vibecoder/ny-vibecoder) |
| "Bytt byggemodus" | Les `protocol-BYGGEMODUS.md` → Vis alternativer → Oppdater `builderMode` → Logg MODE_CHANGE |
| "Oversty gate [Fase-N]: [årsak]" | Legg til i `gateOverrides[]` → Logg i PROGRESS-LOG |

### Ved feil
Sjekk mission briefing → Presenter i klartekst → Tilby: (a) prøv på nytt, (b) hopp over, (c) rull tilbake, (d) avslutt trygt

---

## AUTORITET

- **CLAUDE.md er autoritativ** for hele boot-sekvensen (steg 1-7)
- AUTO-CLASSIFIER kjører KUN ved nytt prosjekt (steg 3) | ORCHESTRATOR kjører KUN ved fase-overgang (steg 7)
- Hvis AUTO-CLASSIFIER eller ORCHESTRATOR hevder annen sekvens: **CLAUDE.md vinner alltid**

---

*v3.6.0 | 2026-05-13 | Planner Skill v4.0-integrasjon*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
