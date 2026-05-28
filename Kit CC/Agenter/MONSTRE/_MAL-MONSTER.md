---
name: M:eksempel
version: 1.0
applies_to:
  paths: []
  contexts: []
last_reviewed: 2026-05-13
skip_if: aldri (alle mønstre bør anvendes der relevant)
ekspert_trigger: []
---

# Mønster: [Navn]

> Kort beskrivelse av når mønsteret brukes og hva det dekker. 1-2 setninger.
>
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

Konkrete triggere (uttømmende liste):
- Når komponenten gjør X
- Når brukerflyten inkluderer Y
- Når data Z behandles

## Når brukes det IKKE

Eksklusjoner — situasjoner hvor mønsteret er feil verktøy:
- Situasjon A → bruk M:annet i stedet
- Situasjon B → ingen mønster nødvendig

## Skip-regel

Mønsteret kan hoppes over hvis ALLE disse er sanne:
- Betingelse 1
- Betingelse 2

(Ofte: "aldri" — særlig for obligatoriske mønstre)

---

## Sjekkliste — still bruker ett spørsmål av gangen

Organiser spørsmål i logiske grupper. Hver gruppe = en aspekt av mønsteret.

### Gruppe 1 — [aspekt]
- Spørsmål 1?
- Spørsmål 2 (med kontekst om hvorfor det matter)?
- Standardvalg hvis bruker ikke har preferanse: [X]

### Gruppe 2 — [aspekt]
- Spørsmål 3?
- Spørsmål 4?

### Gruppe N — [aspekt]
- Spørsmål osv.

---

## Tilstander (states)

Alle interaktive flater skal definere oppførsel for hver tilstand som er relevant:
- **Loading** — [hva vises]
- **Empty** — [hva vises + neste-handling-CTA]
- **Error** — [recovery-action]
- **Success** — [bekreftelse + neste-steg]
- **Disabled** — [visuell indikasjon + tooltip]

(Ikke alle mønstre trenger alle tilstander — list kun relevante.)

---

## Tilgjengelighet (WCAG 2.2)

Påkrevde sjekkpunkter (konsulter https://www.w3.org/WAI/WCAG22/quickref/ for hvert):
- [Kriterie X.Y.Z (offisiell tittel)] — hvorfor det gjelder her
- [Kriterie A.B.C (offisiell tittel)] — hvorfor

**Markert med `[VERIFISER WCAG]`** hvis du er usikker — fanges opp av reviewer.

---

## Kanttilfeller

Eksplisitt enumerering — LLM-er er svake her uten prompting:
- Null / undefined input
- Tom string / liste / objekt
- Maks-grense (lengde, antall, dato)
- Samtidig handling (race condition)
- Permission-denied / 403
- Network-failure / timeout
- Stale data (cache)
- Mønster-spesifikke edge cases

---

## Anti-mønster

Hva man IKKE skal gjøre:
- ❌ Pattern A — hvorfor det er feil
- ❌ Pattern B — hvorfor

---

## Eksempler

2-3 konkrete bruksområder:

**Eksempel 1: [Scenario]**
- Kort beskrivelse + 3-5 punkts oppførsel

**Eksempel 2: [Scenario]**
- Kort beskrivelse + 3-5 punkts oppførsel

---

## Relaterte mønstre

- [M:annet1] — når de brukes sammen
- [M:annet2] — alternativ tilnærming

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
