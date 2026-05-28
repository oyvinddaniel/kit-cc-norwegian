# protocol-VALIDERING-SKALA.md

> **Formål:** Definere karakter-skalaen A-D som REVIEW-modus bruker i `.ai/VALIDERING.md`, og hvordan PHASE-GATES tolker karakteren.
> **Tilhører:** Kit CC v3.6.0 | Lag 2 (on-demand)
> **Relaterte filer:** `protocol-PLANLEGGER-MODUSER.md` (REVIEW-modus, Steg R7) | `agent-PHASE-GATES.md` (gate-håndheving)

---

## 1. Karakter-tabell

REVIEW-modus produserer én av fire karakterer i `.ai/VALIDERING.md`. Karakteren er deterministisk basert på antall og alvorlighet av gap.

| Karakter | Kritiske gap | Viktige mangler | Obligatoriske mønstre | Konsistens |
|---|---|---|---|---|
| **A** | 0 | Maks 2 | Alle dekket | OK |
| **B** | 0 | Inntil 5 | Alle dekket | Mindre inkonsistenser tillatt |
| **C** | 1-2 | ELLER 5+ | ELLER delvis manglende | Inkonsistenser dokumentert |
| **D** | 3+ | Mange | ELLER manglende over hele linja | Fundamental inkonsistens |

**Regel:** Verste kolonne avgjør. Hvis kritiske gap = 1 men viktige mangler = 0 → karakter C (kritisk gap dominerer).

---

## 2. Hva er "kritisk gap"?

Kritiske gap er mangler som hindrer at neste fase kan gjennomføres trygt. Konkrete eksempler:

- **Manglende obligatorisk mønster** på modul der mønsteret er påkrevd:
  - `M:tilstander` (loading/empty/error/success) mangler på UI-modul
  - `M:tilgjengelighet` (WCAG 2.2 AA) mangler på offentlig nettside
  - `M:kanttilfeller` mangler på modul med ekstern input
- **Manglende akseptansekriterier** på modul markert `MVP=Ja`
- **Brutte referanser** i M-XXX-spec — en `avhenger`-ID (M-XXX) som ikke finnes blant definerte moduler (felt-navn iht. `MODUL-SPEC-MAL.md` og `regenerate-modulregister.sh`)
- **Verbatim-validering feiler** — `.ai/VERBATIM-CHECK.md` rapporterer < 80% ordtelling: minst 80% av brukerens unike ord (fra `docs/BRUKERENS-PLAN.md`) MÅ finnes ordrett (case-insensitive, normalisert whitespace) i lagret M-XXX-spec, OG minst 80% av spec-ordene MÅ stamme fra brukerinput (begge retninger sjekkes for å fange både utelating og hallusinasjon)
- **GDPR/sikkerhets-relevante mangler** i sensitive moduler:
  - Booking, betaling, helsedata, brukerdata → manglende `M:revisjonsspor`, `M:samtykke`, `M:datalagring`
- **Manglende rollebeskrivelser** der modulen har flere brukerroller (admin/sluttbruker/anonym)

---

## 3. Hva er "viktig mangel"?

Viktige mangler reduserer kvalitet men blokkerer ikke fase-overgang automatisk. Konkrete eksempler:

- **Underfunksjon uten detaljer** — D-ID nevnt i M-spec men mangler egen utdyping
- **Prioritert mikrodetalj-coverage** — mønster nevnt i `intensity-matrix` for modulens nivå, men ikke dekket
- **WCAG 2.2 nye-9-kriterier** ikke dekket der relevant (f.eks. focus-not-obscured, dragging movements)
- **Edge cases ikke enumert eksplisitt** — `M:kanttilfeller` finnes, men kun som "håndteres" uten konkret enumerasjon
- **Manglende ytelseskrav** på modul med høy trafikk eller stor datamengde
- **Manglende feilmeldinger** spesifisert per feiltype (kun generisk "vis feil")

---

## 4. Hva er "liten mangel"?

Små mangler påvirker ikke karakter direkte, men logges i `.ai/VALIDERING.md` under "Forbedringsmuligheter":

- "Kunne vært flere eksempler på input-validering"
- "Human-language jargon på 2 steder (f.eks. 'utility' bør være 'verktøy')"
- "Inkonsistent terminologi: 'bruker' vs 'kunde' i samme modul"
- "Manglende emoji/ikon i UI-spec (kosmetisk)"

---

## 5. Eksempler på karakter-vurderinger

### Scenario A — Karakter A
**Prosjekt:** Hobby-todo-app, vibekoder-nivå
**Tilstand:** 8 moduler definert, hver med 15+ mikrodetaljer per underfunksjon. Alle obligatoriske mønstre for nivå-1 dekket. Ingen brutte referanser. Verbatim-check passerer (94%).
**Vurdering:** 0 kritiske gap, 1 viktig mangel (manglende ytelseskrav på liste-render).
**Karakter:** **A**

### Scenario B — Karakter B
**Prosjekt:** Personlig blogg, vibekoder-nivå
**Tilstand:** 12 moduler, alle obligatoriske mønstre dekket. 4 viktige mangler (3 underfunksjoner uten D-detaljer + 1 WCAG-kriterium ikke dekket).
**Vurdering:** 0 kritiske gap, 4 viktige mangler.
**Karakter:** **B** (PASS med advarsel)

### Scenario C — Karakter C (kritisk gap)
**Prosjekt:** Booking-system for klinikk, erfaren-vibekoder
**Tilstand:** 18 moduler. Modul M-007 (booking-bekreftelse) mangler `M:revisjonsspor` — kritisk for GDPR. Resten ser bra ut.
**Vurdering:** 1 kritisk gap (GDPR), 2 viktige mangler.
**Karakter:** **C** (PARTIAL — bruker må godkjenne fortsettelse eller fikse)

### Scenario D — Karakter D
**Prosjekt:** Enterprise SaaS-plattform, utvikler-nivå
**Tilstand:** 35 moduler. Flere moduler mangler `M:tilstander`, `M:tilgjengelighet`, `M:kanttilfeller`. Verbatim-check feiler (62%). Brutte referanser mellom M-012 → M-099 (finnes ikke).
**Vurdering:** 5+ kritiske gap, mange viktige mangler, fundamental inkonsistens.
**Karakter:** **D** (FAIL — gate blokkeres)

---

## 6. Konsekvens for PHASE-GATES

`agent-PHASE-GATES.md` leser karakter fra `.ai/VALIDERING.md` og håndhever:

| Karakter | Gate-resultat | Handling |
|---|---|---|
| **A** | PASS | Fase-overgang tillatt umiddelbart |
| **B** | PASS med advarsel | Fase-overgang tillatt. Vis viktige mangler til bruker som "ta med videre" |
| **C** | PARTIAL | Gate blokkeres. Bruker må enten (a) fikse kritiske gap, eller (b) eksplisitt overstyre |
| **D** | FAIL | Gate blokkeres. Overstyring krever dobbel bekreftelse + logging av risiko |

**Visning ved C/D:**
```
VALIDERING: Karakter [C/D]
Kritiske gap:
- [liste]
Viktige mangler:
- [liste]

Valg:
(1) Fiks gap nå (anbefalt)
(2) Oversty gate [Fase-N]: [oppgi årsak]
(3) Tilbake til REVIEW-modus
```

---

## 7. Overstyringsmekanisme

Bruker kan eksplisitt overstyre en blokkert gate med kommandoen:

```
Oversty gate [Fase-N]: [årsak]
```

**Krav til overstyring:**
- Årsak må være tekst (minimum 10 tegn) — ikke tomt
- Overstyring legges til i `PROJECT-STATE.json` under `gateOverrides[]`:
  ```json
  {
    "phase": 2,
    "grade": "C",
    "reason": "Booking er ikke MVP — håndteres i fase 5",
    "timestamp": "2026-05-13T14:32:00Z",
    "criticalGaps": ["M-007 mangler revisjonsspor"]
  }
  ```
- Logges i `PROGRESS-LOG.md` som:
  ```
  event: GATE_OVERRIDE
  phase: 2
  grade: C
  reason: [tekst]
  ```

**Ved karakter D:**
Krev dobbel bekreftelse:
1. "Er du sikker? Karakter D betyr fundamentale mangler."
2. "Skriv 'JA OVERSTY' for å bekrefte."

Først etter begge bekreftelser logges overstyring.

---

## 8. Implementasjonsnotat for REVIEW-modus

REVIEW-modus (se `protocol-PLANLEGGER-MODUSER.md` Steg R7) skal:

1. Telle kritiske gap, viktige mangler, små mangler hver for seg
2. Bestemme karakter etter regel i seksjon 1 (verste kolonne dominerer)
3. Skrive til `.ai/VALIDERING.md` med følgende struktur:
   ```markdown
   # VALIDERING — Fase [N]
   Karakter: [A/B/C/D]
   Dato: [ISO 8601]

   ## Kritiske gap (N)
   - [...]

   ## Viktige mangler (N)
   - [...]

   ## Forbedringsmuligheter (små mangler)
   - [...]

   ## Anbefaling
   [PASS / PASS med advarsel / PARTIAL / FAIL]
   ```
4. Returnere til fase-agent som så leverer til PHASE-GATES

---

*v3.6.0 | Karakter-skala for REVIEW-modus | Referer til protocol-PLANLEGGER-MODUSER.md og agent-PHASE-GATES.md*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
