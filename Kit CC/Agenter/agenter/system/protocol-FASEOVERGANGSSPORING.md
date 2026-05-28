# Protocol: Faseovergangssporing

> Ekstrahert fra 4-MVP-agent.md. Brukes av MVP-agent (Fase 4) ved fullføring av fasen.

## Obligatorisk sporing ved fullføring av fasen

Ved fullføring av denne fasen SKAL følgende spores i PROJECT-STATE.json:

### 1. Oppdater completedSteps med ALLE utførte oppgaver

Legg til **alle** oppgaver som ble utført, uavhengig av om de var MÅ, BØR eller KAN:

```json
"completedSteps": [
  {
    "id": "MVP-01",
    "name": "[Oppgavenavn]",
    "requirement": "MÅ",
    "status": "completed",
    "deliverable": "[filnavn].md"
  },
  {
    "id": "MVP-07",
    "name": "[Oppgavenavn]",
    "requirement": "BØR",
    "status": "completed",
    "deliverable": "[filnavn].md",
    "note": "Inkludert fordi [årsak]"
  }
]
```

### 2. Dokumenter skippede BØR-oppgaver

For hver BØR-oppgave ved gjeldende intensitetsnivå som IKKE ble utført:

```json
"skippedSteps": [
  {
    "id": "MVP-08",
    "name": "[Oppgavenavn]",
    "requirement": "BØR",
    "reason": "[Konkret begrunnelse for hvorfor den ble skipet]"
  }
]
```

**Eksempler på gode begrunnelser:**
- "Intern dashboard uten direkte konkurrenter i markedet" (for markedsanalyse)
- "Hurtigspor — detaljert spesifikasjon gjør dette redundant"
- "Ressursbegrensning — prioritert MÅ-oppgaver"
- "Allerede dekket i [annen leveranse]"

**Eksempler på dårlige begrunnelser:**
- "Glemte det" ❌
- "Hadde ikke tid" ❌ (hvis så, hvorfor? ressurser? scope?)
- Tom reason-felt ❌

### 3. Dokumenter valgte KAN-oppgaver

Hvis bruker valgte å inkludere en KAN-oppgave:

```json
"completedSteps": [
  {
    "id": "MVP-12",
    "name": "[Oppgavenavn]",
    "requirement": "KAN",
    "status": "completed",
    "deliverable": "[filnavn].md",
    "note": "Bruker valgte å inkludere for økt kvalitet"
  }
]
```

Hvis bruker valgte å IKKE inkludere en KAN-oppgave:

```json
"skippedSteps": [
  {
    "id": "MVP-12",
    "name": "[Oppgavenavn]",
    "requirement": "KAN",
    "reason": "Bruker valgte nei — ikke kritisk for MVP"
  }
]
```

### 4. Inkluder i PHASE-SUMMARY.md

Legg til følgende seksjoner i PHASE-SUMMARY.md for denne fasen:

```markdown
## BØR/KAN-oppgaver

### Utførte BØR-oppgaver (utover MÅ)
- MVP-07: [Oppgavenavn] — [kort beskrivelse]
- [liste alle BØR som ble gjort]

### Skippede BØR-oppgaver
- MVP-08: [Oppgavenavn] — **Begrunnelse:** [årsak]
- [liste alle BØR som ble skipet med begrunnelse]

### Valgte KAN-oppgaver
- MVP-12: [Oppgavenavn] — [kort beskrivelse]
- [liste KAN-oppgaver brukeren valgte]

**Total BØR-dekning:** X av Y utført eller skipet med begrunnelse (100%)
```

### 5. Inkluder i handoff-dokumentet

Når du skriver handoff-dokument til neste fase, inkluder:

```markdown
## Leveranser

### MÅ-leveranser
[Eksisterende liste]

### BØR-leveranser (utført)
- MVP-07: [leveranse] — [hva den inneholder]

### Skippede BØR-oppgaver (med begrunnelse)
- MVP-08: [oppgave] — Skipet fordi [årsak]

Neste fase skal være oppmerksom på at MVP-08 ikke ble gjort.
[Konsekvenser hvis noen]
```

---

### Verifisering før handoff

Før du overfører til neste fase, sjekk at:

1. Alle MÅ-oppgaver er i completedSteps (eller utsatt via pendingTasks med begrunnelse)
2. Alle BØR-oppgaver er i completedSteps ELLER skippedSteps
3. Alle skippedSteps har reason-felt med god begrunnelse
4. completedSteps inkluderer alle utførte BØR/KAN-oppgaver (ikke bare MÅ)
5. PHASE-SUMMARY.md har BØR/KAN-seksjoner
6. Handoff-dokument nevner alle leveranser inkl. BØR

Hvis noen av disse mangler:
- Stopp før handoff
- Oppdater PROJECT-STATE.json og dokumenter
- Deretter fortsett med handoff

---

### Hurtigspor-spesialregler

I hurtigspor-modus:
- Agent tar beslutninger autonomt (ikke spør bruker)
- **MEN:** Alle beslutninger SKAL likevel dokumenteres
- BØR-oppgaver som naturlig inngår i MÅ-arbeid: Inkluder og dokumenter
- BØR-oppgaver som ikke passer: Skip og dokumenter begrunnelse
- KAN-oppgaver: Skip med reason: "Hurtigspor-modus"

**Eksempel hurtigspor-sporing:**

```json
"completedSteps": [
  { "id": "MVP-01", "requirement": "MÅ", "status": "completed" },
  { "id": "MVP-07", "requirement": "BØR", "status": "completed",
    "note": "Inkludert i [leveranse] — naturlig del av MÅ-arbeid" }
],
"skippedSteps": [
  { "id": "MVP-08", "requirement": "BØR",
    "reason": "Hurtigspor — [spesifikk årsak]" }
]
```

---

*Ekstrahert fra 4-MVP-agent.md v3.5.0 — 2026-02-23 (referanse oppdatert 2026-04-22)*

*Kompatibel med: Kit CC v3.5.0*

> **Systemversjon:** Se `Kit CC/Agenter/VERSION.json` for Kit CC-versjon.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
