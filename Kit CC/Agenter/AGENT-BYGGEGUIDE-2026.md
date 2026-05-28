# Agent-Byggeguide 2026
# Best Practices for Kit CC Agent-Utvikling

> **📋 INTERNT UTVIKLINGSDOKUMENT** — Denne filen ble brukt til å bygge Kit CC og er ikke nødvendig for bruk av systemet. Kan trygt ignoreres av brukere.

**Versjon:** 1.0
**Sist oppdatert:** 2026-02-04
**Målgruppe:** AI-utviklere som bygger agenter for Kit CC

---

## Oversikt

Denne guiden dokumenterer beste praksis for å bygge robuste, sikre og vedlikeholdbare agenter for Kit CC multi-agent systemet.

---

## Agent-Struktur

Alle agenter følger samme grunnstruktur:

### 1. Metadata-seksjon
```markdown
# [AGENT-NAVN]

**Type:** [system/prosess/basis/ekspert]
**Nivå:** [0-3]
**Ansvar:** [Kort beskrivelse]
**Kaller:** [Liste over agenter denne kaller]
**Kalles av:** [Liste over agenter som kaller denne]
```

### 2. Rollebeskrivelse
- Tydelig definert ansvar
- Når agenten aktiveres
- Hva agenten skal oppnå

### 3. Implementeringsdetaljer
- Konkrete oppgaver
- Verktøy og ressurser
- Output-forventninger

### 4. Handoff-protokoll
- Når jobben er ferdig
- Hvem som skal kalles neste
- Hva som skal overleveres

---

## Best Practices

### ✅ DO

1. **Tydelig Scope**
   - En agent = ett klart ansvar
   - Ikke overlapp med andre agenter
   - Dokumenter grenser eksplisitt

2. **Sikkerhet First**
   - Valider alle inputs
   - Aldri hardkode secrets
   - Bruk SIKKERHETS-agent når relevant

3. **Dokumentasjon**
   - Logg viktige beslutninger i prosess-output
   - ORCHESTRATOR håndterer SESSION-HANDOFF.md — agenter skriver den aldri direkte
   - Beskriv hvorfor, ikke bare hva

4. **Testbarhet**
   - Definer suksesskriterier
   - Inkluder validerings-sjekkliste
   - Dokumenter edge cases

5. **Handoff-klarhet**
   - Tydelig "neste steg"
   - Dokumenter hva som overleveres
   - Ingen implisitte antagelser

### ❌ DON'T

1. **Overlapp**
   - Ikke dupliser ansvar fra andre agenter
   - Ikke gjør andres jobber

2. **Implisitt State**
   - Ikke anta at andre agenter vet noe
   - Alltid eksplisitt handoff

3. **Hardkoding**
   - Ikke hardkod paths eller URLs
   - Bruk konfigurasjon

4. **Manglende Validering**
   - Aldri anta at input er korrekt
   - Alltid valider før prosessering

---

## Agent-Typer

### System-agenter (Nivå 0)
- **Ansvar:** Infrastruktur og orkestrering
- **Eksempler:** ORCHESTRATOR, AUTO-CLASSIFIER
- **Kjører:** Automatisk
- **Kaller:** Prosess-agenter

### Prosess-agenter (Nivå 2)
- **Ansvar:** Koordinere en hel fase
- **Eksempler:** OPPSTART-agent, MVP-agent
- **Kjører:** Kalles av ORCHESTRATOR
- **Kaller:** Ekspert-agenter + Basis-agenter

### Basis-agenter (Nivå 1)
- **Ansvar:** Tverrfaglige verktøy
- **Eksempler:** BYGGER, REVIEWER, DEBUGGER
- **Kjører:** Kalles av prosess-agenter
- **Kaller:** Ingen (leaf nodes)

### Ekspert-agenter (Nivå 3)
- **Ansvar:** Spesialistkompetanse
- **Eksempler:** OWASP-ekspert, GDPR-ekspert
- **Kjører:** Kalles av prosess-agenter
- **Kaller:** Ingen (leaf nodes)

---

## Bygging Steg-for-Steg

### 1. Les AI-OPPGAVER.json
```bash
# Finn din agent:
- id: "PRO-001"
- navn: "OPPSTART-agent"
- fase: 1
- beskrivelse: "..."
```

### 2. Les Relevant Mal
```bash
# Velg mal basert på type:
- MAL-SYSTEM.md (for system-agenter)
- MAL-PROSESS.md (for prosess-agenter)
- MAL-BASIS.md (for basis-agenter)
- MAL-EKSPERT.md (for ekspert-agenter)
```

### 3. Følg Mal-Struktur
- Kopier mal-strukturen
- Fyll inn spesifikk informasjon
- Tilpass til agentens ansvar

### 4. Dokumenter Relasjoner
```markdown
**Kaller:**
- PERSONA-ekspert (brukeranalyse)
- LEAN-CANVAS-ekspert (forretningsmodell)

**Kalles av:**
- ORCHESTRATOR (ved prosjektstart)
```

### 5. Definer Suksesskriterier
```markdown
## Exit Criteria
✅ [Kriterium 1]
✅ [Kriterium 2]
✅ [Kriterium 3]
```

### 6. Test
- Sjekk at alle referanser finnes
- Valider at handoff-protokoll er komplett
- Test mot PHASE-GATES

---

## Sikkerhetssjekkliste

Før du markerer en agent som ferdig:

- [ ] Ingen hardkodede secrets
- [ ] Input-validering implementert
- [ ] Output sanitization på plass
- [ ] Følger least-privilege prinsipp
- [ ] Dokumentert i AI-OPPGAVER.json
- [ ] Testet isolert
- [ ] Testet i fasekontekst
- [ ] Handoff-protokoll komplett
- [ ] SIKKERHETS-agent konsultert (hvis relevant)

---

## Vanlige Feil

### 1. Manglende Scope-klarhet
**Problem:** Agent prøver å gjøre for mye
**Fix:** Split i flere agenter eller definer tydelig grense

### 2. Overlappende Ansvar
**Problem:** To agenter gjør samme jobb
**Fix:** Konsolider eller differensier tydelig

### 3. Brutt Handoff
**Problem:** Neste agent vet ikke hva den skal gjøre
**Fix:** Dokumenter eksplisitt hva som overleveres

### 4. Manglende Validering
**Problem:** Agent antar input er korrekt
**Fix:** Legg til input-validering

---

## Eksempel: God Agent-Struktur

```markdown
# WIREFRAME-ekspert

**Type:** ekspert
**Nivå:** 3
**Ansvar:** Lage UI-wireframes basert på brukerhistorier
**Kaller:** Ingen
**Kalles av:** KRAV-agent (Fase 2)

## Rolle
Du er WIREFRAME-ekspert. Din oppgave er å:
1. Lese brukerhistorier
2. Designe low-fidelity wireframes
3. Levere HTML/Figma-filer

## Når Aktiveres Du?
KRAV-agent kaller deg når:
- Brukerhistorier er dokumentert
- Krav er godkjent av bruker

## Hva Du Gjør
1. Les brukerhistorier fra docs/FASE-2/
2. Design wireframes for hver hovedflyt
3. Valider med bruker
4. Eksporter til docs/FASE-2/wireframes/

## Exit Criteria
✅ Alle hovedflyter har wireframes
✅ Bruker har godkjent design
✅ Filer eksportert til docs/FASE-2/wireframes/

## Handoff
Når ferdig:
- Signaliser TASK_COMPLETE til ORCHESTRATOR (som oppdaterer SESSION-HANDOFF.md)
- Returner kontroll til KRAV-agent
```

---

## Ressurser

### Viktige Filer
- **AI-OPPGAVER.json** - Alle agenter definert
- **protocol-SYSTEM-COMMUNICATION.md** - Kommunikasjonsprotokoll
- **agent-PHASE-GATES.md** - Fase-valideringskriterier
- **agent-ORCHESTRATOR.md** - Hvordan agenter aktiveres

### Maler
- **MAL-SYSTEM.md**
- **MAL-PROSESS.md**
- **MAL-BASIS.md**
- **MAL-EKSPERT.md**

### Dokumentasjon
- **CLAUDE.md** - Overordnet guide (se steg 6 for fase-tabell)
- **Kit CC/Agenter/agenter/system/doc-INTENSITY-MATRIX.md** - Intensitetsnivåer
- **Kit CC/Agenter/klassifisering/FUNKSJONSOVERSIKT-KOMPLETT.md** - Faseoversikt

---

## Oppdatering av Guiden

Denne guiden oppdateres ved:
- Nye beste praksis oppdages
- Arkitektur-endringer
- Feedback fra agent-utviklere

**Sist oppdatert:** 2026-02-04
**Neste review:** Hver 3. måned eller ved store endringer

---

*Lykke til med agent-utvikling! 🚀*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
