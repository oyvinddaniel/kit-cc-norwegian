# protocol-CRASH-RECOVERY.md — Krasj-deteksjon og gjenoppretting

> **SSOT for krasj-recovery.** Referert fra CLAUDE.md boot-sekvens.
> Versjon: 1.0.0 | Opprettet: 2026-02-23

---

## FORMÅL

Denne protokollen kjøres under boot når `PROJECT-STATE.json` finnes men tilstanden er uklar. Den avgjør om forrige sesjon ble avsluttet normalt, var en kontekstbudsjett-pause, eller krasjet uventet.

---

## PROSEDYRE

### 1. Forsøk å parse PROJECT-STATE.json

#### Gren A: Filen mangler
→ Behandles som nytt prosjekt. Gå til CLAUDE.md steg 3 (NYTT PROSJEKT).

> **Merk:** CLAUDE.md steg 2 håndterer "Finnes ikke"-tilfellet direkte uten å kalle denne protokollen. Gren A her er defensiv backup hvis protokollen kalles fra en annen kontekst (f.eks. re-klassifisering hvor state mangler).

#### Gren B: JSON er korrupt/umulig å parse

1. **Backup:** Kopier `PROJECT-STATE.json` til `.ai/PROJECT-STATE.json.prev`
2. **Les** `.ai/PROGRESS-LOG.jsonl` for å sjekke handlingshistorikk

3. **HVIS PROGRESS-LOG finnes og har data:**
   - Vis bruker siste 5 linjer fra PROGRESS-LOG
   - Spør: "PROJECT-STATE.json er korrupt, men jeg fant handlingsloggen. Vil du at jeg (A) rekonstruerer prosjektstatus fra loggen, eller (B) starter på nytt?"

   **Hvis A (REKONSTRUER):**
   - Les PROGRESS-LOG og ekstrahér: siste fase (fra `"event":"START"` og `"event":"COMMIT"` linjer), nåværende oppgavestatus, fullførte oppgaver/steg
   - Lag minimal ny PROJECT-STATE.json med: `session.status="active"`, `currentPhase`, `completedSteps[]`, `completedTasks[]` basert på PROGRESS-LOG
   - Lagre rekonstruert JSON atomisk (via `.tmp` → `.prev` → JSON)
   - Logg rekonstruksjon til PROGRESS-LOG: `{"ts":"<ISO 8601>","event":"RECOVERY","action":"reconstructed from PROGRESS-LOG","reason":"corrupted PROJECT-STATE.json","schemaVersion":1}`
   - Gå til CLAUDE.md steg 4 (GJENOPPTA) med rekonstruert tilstand

   **Hvis B (NYSTART):**
   - Gå til CLAUDE.md steg 3 (NYTT PROSJEKT)

4. **HVIS PROGRESS-LOG også mangler eller er tom:**
   - Spør bruker: "Prosjektet ser korrupt ut og jeg fant ingen handlingslogg. Vil du starte på nytt?"
   - Hvis ja: Gå til CLAUDE.md steg 3 (NYTT PROSJEKT)
   - Hvis nei: Behold backup og be bruker kontakte støtte

#### Gren C: JSON er gyldig

Les `session.status` fra PROJECT-STATE.json:

**Hvis `session.status = "completed"`:**
→ Alt OK. Gå til CLAUDE.md steg 4 (GJENOPPTA).

**Hvis `session.status = "active"`:**
→ Sjekk om dette er kontekstbudsjett-pause eller ekte krasj:

1. Les `.ai/PROGRESS-LOG.jsonl` (PRIMÆRKILDE)
2. HVIS PROGRESS-LOG mangler eller er tom → Behandles som ekte krasj (se nedenfor)
3. HVIS PROGRESS-LOG finnes → Sjekk siste 10 linjer for `"subtype":"CONTEXT_BUDGET"` (eller legacy `⚠️ KONTEKST: Budsjett nådd`)

**Kontekstbudsjett-pause (IKKE en krasj):**
- Fullfør lagringen som kanskje ble avbrutt:
  1. Sett `session.status = "completed"` i PROJECT-STATE.json
  2. Sjekk at SESSION-HANDOFF.md er oppdatert (oppdater hvis ikke)
- Gå til CLAUDE.md steg 4 (GJENOPPTA) — fortsett arbeidet uten spesiell velkomstmelding
- IKKE vis krasj-advarsel eller "Velkommen tilbake" — bare vis kort status og fortsett

**Ekte krasj (forrige sesjon ble avbrutt uventet):**
1. Les `session.lastSignificantAction` for siste kjente handling
2. Les `completedSteps[]`, `completedTasks[]` og `pendingTasks[]` for bekreftet fremgang og uavsluttede oppgaver
3. Les `.ai/SESSION-HANDOFF.md` milepælslogg (hvis finnes)
4. Ved uenighet mellom PROGRESS-LOG og PROJECT-STATE → **stol på PROGRESS-LOG**

**Gjenopprettingsalgoritme:**
- Hvis `completedSteps` inneholder siste planlagte oppgave:
  → Oppgaven ble fullført. Gå til neste oppgave.
- Hvis `session.lastSignificantAction` viser pågående arbeid:
  → Vis bruker hva som var underveis
  → Spør: "Skal jeg prøve på nytt, hoppe over, eller rulle tilbake?"
- Hvis ingen `session.lastSignificantAction`:
  → Sesjonen krasjet før noe arbeid startet
  → Gå direkte til CLAUDE.md steg 4 (GJENOPPTA)

5. Vis kort status til bruker (maks 100 ord)
6. Gå til CLAUDE.md steg 4 (GJENOPPTA)

---

## PRIORITETSREKKEFØLGE FOR DATAKILDER

Ved gjenoppretting, stol på kildene i denne rekkefølgen:

1. **PROGRESS-LOG.jsonl** — Mest oppdatert (append etter HVER handling)
2. **SESSION-HANDOFF.md** — Oppdatert ved milepæler
3. **PROJECT-STATE.json** — Oppdatert etter hver 3. oppgave

Ved uenighet mellom kildene vinner den med høyest prioritet.

---

## ATOMISK SKRIVING (PROJECT-STATE.json)

Alle skrivinger til PROJECT-STATE.json skal følge dette mønsteret:
1. Kopier eksisterende `.ai/PROJECT-STATE.json` til `.ai/PROJECT-STATE.json.prev` (backup)
2. Skriv ny versjon til `.ai/PROJECT-STATE.json.tmp`
3. Rename `.ai/PROJECT-STATE.json.tmp` → `.ai/PROJECT-STATE.json` (atomisk operasjon)

- Hvis steg 3 feiler: `.prev` og `PROGRESS-LOG.jsonl` brukes for gjenoppretting
- Hvis `.tmp` finnes ved oppstart: Forrige skriving feilet — ignorer `.tmp`, bruk `.prev` eller `PROGRESS-LOG.jsonl`
- Oppbevar `.prev`-filen gjennom hele prosjektet (overskrives ved hver lagring)

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
