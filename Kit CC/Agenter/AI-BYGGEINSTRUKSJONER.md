# Byggeinstruksjoner for AI

> **📋 INTERNT UTVIKLINGSDOKUMENT** — Denne filen ble brukt til å bygge Kit CC og er ikke nødvendig for bruk av systemet. Kan trygt ignoreres av brukere.

> **Formål:** Gi AI klare, presise instruksjoner for å bygge alle 57 agenter automatisk.

---

## KRITISK: NAVNEKONVENSJON

**Alle agent-filer MÅ følge navnekonvensjonen:**

### System-mappen (`agenter/system/`):
- **Agenter:** `agent-[NAVN].md` (f.eks. `agent-ORCHESTRATOR.md`)
- **Protokoller:** `protocol-[NAVN].md` (f.eks. `protocol-CODE-QUALITY-GATES.md`)
- **Dokumentasjon:** `doc-[NAVN].md` (f.eks. `doc-INTENSITY-MATRIX.md`)
- **Extensions:** `extension-[NAVN].md` (f.eks. `extension-ORCHESTRATOR-MONITORING.md`)

### Andre mapper:
- **Basis:** `[NAVN]-agent.md` (f.eks. `BYGGER-agent.md`)
- **Prosess:** `[NR]-[NAVN]-agent.md` (f.eks. `4-MVP-agent.md`)
- **Ekspert:** `[NAVN]-ekspert.md` (f.eks. `GDPR-ekspert.md`)

**VIKTIG:** Bruk ALLTID riktig prefix/suffix! Dette gjør det 100% tydelig hva som er en agent.

---

## STEG 0: Før du starter

```
1. Les denne filen HELT
2. Sjekk PROJECT-STATE.json for å se aktuell byggeprogresjon
3. Les relevant MAL-[TYPE].md for agenttypen du skal bygge
4. Les AGENT-BYGGEGUIDE-2026.md for beste praksis
```

---

## STEG 1: Finn neste agent å bygge

```python
# Pseudo-kode for å finne neste agent
def finn_neste_agent():
    les PROJECT-STATE.json for aktuell byggeprogresjon

    for fase in byggerekkefølge.faser:
        for agent_id in fase.agenter:
            agent = finn_agent(agent_id)
            if agent.status == "ikke_startet":
                return agent

    return None  # Alle ferdig
```

**Prioritet:**
1. System-agenter (nivå 0)
2. Basis-agenter (nivå 1)
3. Prosess-agenter (nivå 2)
4. Ekspert-agenter (nivå 3)

---

## STEG 2: Les relevant mal

| Agent-type | Mal-fil |
|------------|---------|
| System | `maler/MAL-SYSTEM.md` |
| Basis | `maler/MAL-BASIS.md` |
| Prosess | `maler/MAL-PROSESS.md` |
| Ekspert | `maler/MAL-EKSPERT.md` |

---

## STEG 3: Samle kontekst

For å bygge en god agent, samle denne informasjonen:

### For alle agenter:
- [ ] Agent-ID og navn (fra PROJECT-STATE.json eller CALLING-REGISTRY.md)
- [ ] Beskrivelse (fra CALLING-REGISTRY.md)
- [ ] Avhengigheter (hvilke andre agenter den samarbeider med)

### For prosess-agenter:
- [ ] Les relevant prosess-agent for oppgavene i fasen: `Kit CC/Agenter/agenter/prosess/{N}-{NAVN}-agent.md`
- [ ] Identifiser hvilke eksperter den skal kalle
- [ ] Identifiser hvilke basis-agenter den bruker

### For ekspert-agenter:
- [ ] Hvilke prosess-agenter kaller denne eksperten
- [ ] Spesifikke oppgaver fra prosess-agentenes OPPGAVER-seksjon (`Kit CC/Agenter/agenter/prosess/{N}-{NAVN}-agent.md`)
- [ ] Domene-spesifikk kunnskap som trengs

---

## STEG 4: Bygg agent-prompten

### Struktur for alle agenter:

```markdown
# [AGENT-NAVN] v1.0

## IDENTITET
[Hvem er agenten, ekspertise, stil]

## FORMÅL
[Hovedoppgave, suksesskriterier]

## KONTEKST
[Hvilke filer å lese, constraints]

## AKTIVERING
[Hvordan aktivere agenten]

## PROSESS
[Steg-for-steg arbeidsflyt]

## VERKTØY
[Tilgjengelige tools og når bruke dem]

## GUARDRAILS
[ALLTID/ALDRI/SPØR-regler]

## OUTPUT
[Format for output]

## ESKALERING
[Når og til hvem å eskalere]
```

### Viktige prinsipper:

1. **Vær spesifikk** - Unngå vage instruksjoner
2. **Bruk eksempler** - Vis konkret hva som forventes
3. **Definer grenser** - Klare ALDRI/ALLTID-regler
4. **Inkluder feilhåndtering** - Hva gjør agenten når noe går galt

---

## STEG 5: Lagre agent-filen

### Filnavn-konvensjon:
```
agenter/[nivå]/[AGENT-NAVN].md

Eksempler:
- agenter/system/agent-ORCHESTRATOR.md
- agenter/basis/BYGGER-agent.md
- agenter/prosess/1-OPPSTART-agent.md
- agenter/ekspert/GDPR-ekspert.md
```

### Etter lagring:
1. Oppdater `.ai/PROJECT-STATE.json`:
   - Legg til i `history.events[]`: `{ "type": "AGENT_CREATED", "agent": "[NAVN]", "timestamp": "..." }`
2. Oppdater STATUS.md med ny fremgang

---

## STEG 6: Verifiser agent

Sjekk at agenten har:

- [ ] Komplett IDENTITET-seksjon
- [ ] Tydelig FORMÅL med målbare suksesskriterier
- [ ] Spesifikk PROSESS med nummererte steg
- [ ] GUARDRAILS med ALLTID/ALDRI/SPØR
- [ ] OUTPUT-format definert
- [ ] ESKALERING-regler

---

## SPESIELLE INSTRUKSJONER PER TYPE

### System-agenter
```
- Fokus på orkestrering og koordinering
- Må håndtere alle typer agenter
- Robust feilhåndtering
- Logging og sporbarhet
```

### Basis-agenter
```
- Generelle verktøy som brukes overalt
- Må være fleksible
- Tydelig API for å bli kalt av andre
- Standardisert input/output
```

### Prosess-agenter
```
- Fase-spesifikke
- Koordinerer eksperter og basis-agenter
- Ansvar for phase-gate validering
- Dokumenterer leveranser
```

### Ekspert-agenter
```
- Dypt spesialisert
- Kalles kun ved behov
- Kompakt og fokusert
- Returnerer strukturert output
```

---

## KVALITETSKRITERIER

Hver agent må score minst 4/5 på:

| Kriterie | Beskrivelse |
|----------|-------------|
| Klarhet | Instruksjonene er entydige |
| Fullstendighet | Alle nødvendige seksjoner er med |
| Konsistens | Følger mal og standarder |
| Praktisk | Kan faktisk brukes i praksis |
| Sikkerhet | Har passende guardrails |

---

## EKSEMPEL: Bygge en ekspert-agent

### Input fra CALLING-REGISTRY.md:
```json
{
  "id": "EKS-016",
  "navn": "GDPR-ekspert",
  "type": "ekspert",
  "faser": [6],
  "kallesAv": ["PRO-006"],
  "beskrivelse": "Personvernforordningen, DPIA, samtykke, sletting"
}
```

### Samle kontekst:
1. Les `maler/MAL-EKSPERT.md`
2. Les PROJECT-STATE.json for fase-spesifikk informasjon
3. Noter at den kalles av KVALITETSSIKRINGS-agent

### Bygg agenten:
```markdown
# GDPR-ekspert v1.0

## IDENTITET
Du er ekspert på GDPR og personvern med dyp kunnskap om:
- Personvernforordningen (GDPR)
- DPIA (Data Protection Impact Assessment)
- Samtykkeforvaltning
- Rett til sletting
- Databehandleravtaler

## FORMÅL
Verifisere at applikasjonen overholder GDPR-kravene.

Suksesskriterier:
- [ ] Alle personopplysninger er identifisert
- [ ] Behandlingsgrunnlag er dokumentert
- [ ] Samtykke-mekanismer er implementert
- [ ] Slettemekanismer fungerer
- [ ] DPIA er gjennomført (hvis påkrevd)

## AKTIVERING
Kalles av: KVALITETSSIKRINGS-agent (Fase 6)

Direkte aktivering:
```
Aktiver GDPR-ekspert.
Gjennomfør GDPR-compliance sjekk for [prosjektnavn].
```

## PROSESS
1. Les dataklassifisering fra Fase 1
2. Identifiser alle personopplysninger i systemet
3. Verifiser behandlingsgrunnlag for hver type
4. Sjekk samtykke-implementasjon
5. Test slettemekanismer
6. Vurder behov for DPIA
7. Generer compliance-rapport

## GUARDRAILS
### ✅ ALLTID
- Dokumenter alle funn
- Henvis til spesifikke GDPR-artikler
- Gi konkrete anbefalinger

### ❌ ALDRI
- Gi juridisk rådgivning
- Godkjenn uten fullstendig sjekk
- Ignorer "edge cases"

### ⏸️ SPØR
- Ved uklart behandlingsgrunnlag
- Ved sensitive personopplysninger
- Ved overføring til tredjeland

## OUTPUT
```
---GDPR-RAPPORT---
Prosjekt: [navn]
Dato: [dato]
Status: [COMPLIANT | PARTIAL | NON-COMPLIANT]

## Funn
1. [Funn med GDPR-artikkel referanse]

## Anbefalinger
1. [Konkret anbefaling]

## Neste steg
[Hva må gjøres]
---END---
```
```

### Lagre:
```
agenter/ekspert/GDPR-ekspert.md
```

### Oppdater PROJECT-STATE.json:
Logg agentopprettingen i `history.events[]` med type `AGENT_CREATED` og agent-metadata.

---

## FEILHÅNDTERING

### Hvis du mangler informasjon:
1. Sjekk prosess-agentene: `Kit CC/Agenter/agenter/prosess/{N}-{NAVN}-agent.md`
2. Sjekk AGENT-BYGGEGUIDE-2026.md
3. Spør bruker om klargjøring

### Hvis du er usikker på format:
1. Følg malen nøyaktig
2. Se på eksisterende agenter for inspirasjon
3. Prioriter klarhet over kreativitet

### Hvis avhengigheter ikke er bygd:
1. Bygg avhengigheten først
2. Eller marker som "venter på [agent]"

---

## KOMMANDOER FOR AI

### Start bygging
```
Les PROJECT-STATE.json og bygg neste agent i køen.
```

### Bygg spesifikk agent
```
Bygg agent [AGENT-ID] basert på PROJECT-STATE.json.
```

### Bygg alle i en fase
```
Bygg alle agenter i byggefase [N].
```

### Vis status
```
Vis byggestatus fra PROJECT-STATE.json.
```

### Verifiser agent
```
Verifiser at [AGENT-NAVN] oppfyller kvalitetskriteriene.
```

---

*Versjon: 1.0.0*
*Opprettet: 2026-01-31*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
