# PHASE-SUMMARY.md - Mal

> **Formål:** Oppsummering av en fullført fase med alle leveranser og beslutninger
> **Genereres av:** DOKUMENTERER-agent
> **Når:** Ved fullføring av hver fase
>
> **TOC-konvensjon:** Bruk alltid `Del A`, `Del B`, `Del C`... for hovedseksjoner, og `A.1`, `A.2`, `B.1`... for underseksjoner. Nummerer ALDRI underavsnitt med reset (1, 2, 3 under hver Del). Avslutt alltid med `Vedlegg`-seksjon.
>
> **Navigasjon:** Ved lange dokumenter (500+ linjer): legg til `[↑ Tilbake til innholdsfortegnelse](#innholdsfortegnelse)` etter hver hovedseksjon.

---

## Fase [N]: [FASE-NAVN]

**Status:** Fullført
**Intensitetsnivå:** [MINIMAL/FORENKLET/STANDARD/GRUNDIG/ENTERPRISE]
**Fullført dato:** [ISO-timestamp]
**Varighet:** [X timer/dager]

---

## Oversikt

[Kort beskrivelse av hva som ble oppnådd i denne fasen]

---

## Leveranser

### MÅ-leveranser (Påkrevd)
- [ID]: [Leveranse-navn] — [Kort beskrivelse og plassering]
- [Liste alle påkrevde leveranser]

### BØR-leveranser (Anbefalt, utført)
- [ID]: [Leveranse-navn] — [Kort beskrivelse og plassering]
- [Liste alle anbefalte leveranser som ble utført]

### KAN-leveranser (Valgfri, utført)
- [ID]: [Leveranse-navn] — [Kort beskrivelse og plassering]
- [Liste alle valgfrie leveranser som ble utført]

---

## BØR/KAN-oppgaver

### Utførte BØR-oppgaver (utover MÅ)
- [ID]: [Oppgavenavn] — [Kort beskrivelse av hva som ble levert]
- [Liste alle BØR-oppgaver som ble utført]

### Skippede BØR-oppgaver
- [ID]: [Oppgavenavn] — **Begrunnelse:** [Konkret årsak til hvorfor den ble skipet]
- [Liste alle BØR-oppgaver som ble skipet med begrunnelse]

### Valgte KAN-oppgaver
- [ID]: [Oppgavenavn] — [Kort beskrivelse]
- [Liste KAN-oppgaver brukeren valgte å inkludere]

**Total BØR-dekning:** X av Y utført eller skipet med begrunnelse (Z%)

---

## Gate-validering

### Lag 1: Binær MÅ-sjekk
- [ ] Alle MÅ-krav oppfylt: JA/NEI
- Hvis NEI → FAIL (stopp, ikke gå videre)

### Lag 2: Vektet kvalitetsscore
- Kvalitetsscore: ___/100
- Terskel: 70/100
- Bestått: JA/NEI

---

## Viktige beslutninger

- [Beslutning 1] — [Begrunnelse]
- [Beslutning 2] — [Begrunnelse]
- [Liste alle viktige tekniske eller arkitektoniske beslutninger]

---

## Utfordringer og løsninger

### Utfordring 1: [Beskrivelse]
**Løsning:** [Hvordan det ble løst]

### Utfordring 2: [Beskrivelse]
**Løsning:** [Hvordan det ble løst]

---

## Risiko og teknisk gjeld

### Identifiserte risikoer
- [Risiko 1] — **Mitigering:** [Hva som ble gjort]
- [Risiko 2] — **Mitigering:** [Hva som ble gjort]

### Teknisk gjeld
- [Gjeld 1] — **Prioritet:** [Lav/Medium/Høy] — **Plan:** [Når/hvordan håndteres]
- [Gjeld 2] — **Prioritet:** [Lav/Medium/Høy] — **Plan:** [Når/hvordan håndteres]

---

## Neste fase

**Fase [N+1]:** [FASE-NAVN]

### Hva neste fase trenger
- [Leveranse/info 1]
- [Leveranse/info 2]
- [Liste alt neste fase er avhengig av]

### Skippede oppgaver som kan påvirke neste fase
- [ID]: [Oppgave] — **Konsekvens:** [Hva neste fase må være oppmerksom på]

### Anbefalinger
- [Anbefaling 1]
- [Anbefaling 2]

---

## Ressurser brukt

**Estimert tid:** [X timer]
**Faktisk tid:** [Y timer]
**Avvik:** [+/- Z timer] ([+/- W%])

---

## Vedlegg

- [Link til dokument 1]
- [Link til dokument 2]
- [Alle relevante dokumenter og artefakter]

---

**Generert av:** DOKUMENTERER-agent
**Dato:** [ISO-timestamp]
**Versjon:** 1.0.0

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
