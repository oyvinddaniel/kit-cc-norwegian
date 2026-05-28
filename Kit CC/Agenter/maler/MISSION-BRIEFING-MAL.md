# MISSION BRIEFING — Fase {N}: {FASENAVN}

> **Generert:** {YYYY-MM-DD HH:mm} | **Forrige fase:** {N-1} ({FORRIGE_FASENAVN}) | **Intensitet:** {LEVEL} ({SCORE}/28)
> **Generert av:** {AGENT-ID} | **Prosjekt:** {PROSJEKTNAVN}
> **Brukernivå:** {userLevel} | **Byggemodus:** {builderMode}
> **Genereres av:** ORCHESTRATOR (Lag 3) ved fase-overgang. Fase-agenten forbereder input — ORCHESTRATOR produserer det endelige dokumentet.

---

## OPPDRAG

{Ett avsnitt som beskriver hva denne fasen skal oppnå. Maks 100 ord. Skal gi agenten fullstendig forståelse av oppdraget uten å lese andre filer.}

---

## KONTEKST FRA FORRIGE FASE

### Hva ble gjort (kompakt oppsummering)

| # | Leveranse | Status | Fil |
|---|-----------|--------|-----|
| 1 | {leveranse} | OK/DELVIS/HOPPET | {filsti} |
| 2 | {leveranse} | OK/DELVIS/HOPPET | {filsti} |

### Nøkkelbeslutninger

| # | Beslutning | Begrunnelse | Konsekvens for denne fasen |
|---|-----------|-------------|---------------------------|
| 1 | {hva} | {hvorfor} | {påvirkning} |

### Kjente problemer og risiko

| # | Problem | Alvorlighet | Anbefalt handling |
|---|---------|-------------|-------------------|
| 1 | {problem} | HØY/MIDDELS/LAV | {handling} |

### Hoppede BØR/KAN-oppgaver fra forrige fase

| # | Oppgave | Krav-nivå | Grunn til hopping | Konsekvens |
|---|---------|-----------|-------------------|------------|
| 1 | {oppgave} | BØR/KAN | {grunn} | {påvirkning på denne fasen} |

---

## OPPGAVER DENNE FASEN

### MÅ (Obligatorisk — blokkerer fase-gate)
| # | Oppgave-ID | Oppgave | Leveranse | Sone |
|---|------------|---------|-----------|------|
| 1 | {F{N}-XX} | {oppgave} | {fil/artifact} | {GRN/YEL/RED} |

### BØR (Anbefalt — presenter til bruker med granulær valg)
| # | Oppgave-ID | Oppgave | Leveranse | Anbefaling |
|---|------------|---------|-----------|------------|
| 1 | {F{N}-XX} | {oppgave} | {fil/artifact} | {JA/VURDER/NEI} |

### KAN (Valgfritt — kun hvis tid/ressurser)
| # | Oppgave-ID | Oppgave | Leveranse |
|---|------------|---------|-----------|
| 1 | {F{N}-XX} | {oppgave} | {fil/artifact} |

---

## NYE FILER OPPRETTET I DENNE FASEN

| # | Fil | Beskrivelse | Type |
|---|-----|-------------|------|
| 1 | {filsti} | {hva filen inneholder} | MÅ/BØR/KAN |
| 2 | {filsti} | {hva filen inneholder} | MÅ/BØR/KAN |

---

## TILGJENGELIGE RESSURSER (Lag 2 — hent ved behov)

### Relevante basis-agenter
| Agent | Filsti | Når den brukes |
|-------|--------|----------------|
| {NAVN}-agent | `Kit CC/Agenter/agenter/basis/{NAVN}-agent.md` | {brukstilfelle} |
| {NAVN}-agent | `Kit CC/Agenter/agenter/basis/{NAVN}-agent.md` | {brukstilfelle} |

### Relevante ekspert-agenter
| Agent | Filsti | Når den brukes |
|-------|--------|----------------|
| {NAVN}-ekspert | `Kit CC/Agenter/agenter/ekspert/{NAVN}-ekspert.md` | {brukstilfelle} |
| {NAVN}-ekspert | `Kit CC/Agenter/agenter/ekspert/{NAVN}-ekspert.md` | {brukstilfelle} |

### ⚠️ Brukerens originalplan (APPEND-ONLY for AI — les ALLTID)
| Dokument | Filsti | Merknad |
|----------|--------|---------|
| Brukerens ordrett plan | `docs/BRUKERENS-PLAN.md` | PRIMÆRKILDE for hva som skal bygges. AI legger til nye seksjoner med tidsstempel, men redigerer ALDRI eksisterende innhold. Les denne FØR du komprimerer eller tolker funksjonsbeskrivelser. |

### Forrige fase-leveranser (fulle versjoner)
| Dokument | Filsti | Relevans |
|----------|--------|----------|
| {dok-navn} | docs/{filnavn} | {kort beskrivelse av relevans} |

### System-referanser (Lag 2)
- `Kit CC/Agenter/klassifisering/KLASSIFISERING-METADATA-SYSTEM.md` — MÅ/BØR/KAN-matrise (SSOT)
- `Kit CC/Agenter/agenter/system/doc-INTENSITY-MATRIX.md` — Intensitetsnivå-detaljer
- `Kit CC/Agenter/agenter/system/protocol-TASK-COMPLEXITY-ASSESSMENT.md` — Oppgave-kompleksitetsvurdering

---

## FASE-GATE KRAV (fra PHASE-GATES)

### Lag 1 — MÅ-sjekk (binær, blokkerer)
{Liste over alle MÅ-oppgaver som må bestås for å gå videre}

### Lag 2 — Kvalitets-score (mål: {SCORE}%)
- Artifacts: {krav} (40%)
- Quality-Checks: {krav} (30%)
- Security: {krav} (30%)

---

## NESTE FASE-FORBEREDELSE

### Hva denne fasen skal produsere for Fase {N+1}
| Leveranse | Formål for neste fase | Kritisk? |
|-----------|----------------------|----------|
| {leveranse} | {hvordan neste fase bruker den} | {JA/NEI} |

### Anbefalt innhold i neste mission briefing
{Stikkord for hva som bør inkluderes i neste fases mission briefing}

---

## KOMPRIMERINGSREFERANSE

> **Prinsipp:** Komprimer først, oppsummer bare som siste utvei. Behold alltid filstier til fullversjoner. AI skal aldri miste muligheten til å hente fullstendig informasjon.

### Komprimert informasjon med fullversjon-referanser
| Komprimert element | Fullversjon filsti | Relevant seksjon |
|--------------------|--------------------|------------------|
| {hva som ble komprimert} | {full filsti} | {seksjonsnavn} |

---

## FASE 5-SPESIFIKK: MODULSTATUS (kun ved Fase 5)

> **Denne seksjonen inkluderes kun i missjonsbriefinger for Fase 5.**

### Fase 5 workflow (vis til bruker)
Fase 5 er en feature-loop. For HVER modul i modulregisteret:
1. **Bygg** — Implementer alle underfunksjoner, én om gangen
2. **Test** — Test hele modulen som helhet
3. **Fiks & Poler** — Fjern feil, forbedre UI, optimaliser ytelse
4. **Godkjenn** — Bruker sier "Go", "Mer arbeid" eller "Blokkert"
5. **Neste** — Gå til neste modul i registeret

Loop-en kjører til ALLE moduler har status "Done".

### Context-reset instruksjoner (Fase 5)
> Ved ny sesjon i Fase 5: Nullstill mental modell. Les KUN aktiv modul (ikke hele backloggen).
> Hent kontekst fra MODULREGISTER (gjeldende modul) + siste byggnotater. Ikke les alle moduler.

### Gjeldende modul

| Felt | Verdi |
|------|-------|
| Modul-ID | {M-XXX} |
| Modulnavn | {navn} |
| Status | {Building/Testing/Polishing} |
| Underfunksjoner | {X ferdig} / {Y totalt} |
| MODUL-SPEC fil | `docs/moduler/M-XXX-{navn}.md` |

### Fillenker

| Ressurs | Filsti |
|---------|--------|
| Modulregister | `docs/FASE-2/MODULREGISTER.md` |
| Gjeldende MODUL-SPEC | `docs/moduler/M-XXX-{navn}.md` |
| Kildekode | `src/{relevante mapper}` |
| Tester | `tests/{relevante mapper}` |

### Fra forrige sesjon (byggnotater)

{Siste byggnotater fra MODUL-SPEC seksjon 6 — kopiert inn her for umiddelbar tilgang}

### Loop-status

| Metrikk | Verdi |
|---------|-------|
| MVP-moduler ferdig | {X} / {Y} ({Z}%) |
| Alle moduler ferdig | {X} / {Y} ({Z}%) |
| Blokkerte moduler | {X} (med årsak) |
| Gjeldende iterasjon | #{N} |

### Neste moduler i kø

| # | Modul-ID | Modulnavn | Avhengigheter | MVP? |
|---|----------|-----------|---------------|------|
| 1 | {M-YYY} | {navn} | {avhengigheter eller "Ingen"} | {Ja/Nei} |

---

## BROWNFIELD-KONTEKST (kun for brownfield-prosjekter)

> **Denne seksjonen inkluderes kun hvis `brownfield.detected = true` i PROJECT-STATE.json.**

### Prosjektportrett
Se `.ai/BROWNFIELD-DISCOVERY.md` for komplett analyse fra 25-agents sverm.

### Kritiske konvensjoner å følge
{Liste over de viktigste konvensjonene fra BROWNFIELD-DISCOVERY.md som fase-agenten MÅ følge}

| # | Konvensjon | Kilde | Eksempel |
|---|-----------|-------|---------|
| 1 | {navnekonvensjon} | A16 (Kodestil) | {eksempel} |
| 2 | {arkitekturmønster} | A04 (Arkitektur) | {eksempel} |
| 3 | {import-stil} | A16 (Kodestil) | {eksempel} |

### Eksisterende funksjonalitet (ikke dupliser)
{Liste over funksjoner som allerede finnes — fase-agenten skal IKKE bygge disse på nytt}

### Kjente teknisk gjeld
{Fra A21 — fase-agenten bør være klar over dette}

---

## INSTRUKSJONER TIL FASE-AGENT

```
1. Les dette dokumentet FØRST (du leser det nå)
2. Les PROJECT-STATE.json for nåværende status
3. HVIS brownfield: Les .ai/BROWNFIELD-DISCOVERY.md for eksisterende kodebase-kontekst
4. Tilpass kommunikasjon til brukernivå (se header) — stilregler i protocol-SYSTEM-COMMUNICATION.md → BRUKER-KOMMUNIKASJONSNIVÅER
5. Respekter byggemodus (se header) — dette styrer hvor mye bruker involveres i tekniske valg
6. DESIGN GATE (Fase 4, UI-prosjekter): globals.css med designsystem er OBLIGATORISK før UI-koding. Kjør GORGEOUS-UI-ekspert (Steg 3B) først. Ingen unntak.
7. Start med MÅ-oppgaver i prioritert rekkefølge
8. For hver BØR-oppgave: presenter til bruker med granulær valg
9. Ved behov for mer kontekst: signal NEED_CONTEXT med spesifikk filsti fra Lag 2
10. Ved avslutning: generer MISSION-BRIEFING for neste fase via ORCHESTRATOR (husk å videreføre brukernivå og byggemodus)
11. Oppdater PROJECT-STATE.json
```

---

*Mal-versjon: 2.3.0*
*Kompatibel med: Kit CC v3.5.0*
*Hierarkisk kontekstlag: Lag 1 (Arbeidsbord)*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
