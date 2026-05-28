---
name: M:revisjonsspor
version: 1.0
applies_to:
  paths: []
  contexts: [audit log, GDPR Art. 30, samsvar, sporbarhet, sikkerhet]
last_reviewed: 2026-05-13
skip_if: ingen sensitive handlinger og ingen samsvarskrav (svært sjelden)
ekspert_trigger: [GDPR-ekspert, AI-GOVERNANCE-ekspert]
---

# Mønster: Revisjonsspor (audit log)

> Brukes når handlinger må spores — sikkerhet, samsvar (GDPR Art. 30), support og feilsøking.
>
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

- Data behandles under GDPR (Art. 30: fortegnelse over behandlinger)
- Brukerhandlinger har juridiske eller økonomiske konsekvenser
- Support må kunne rekonstruere hva som skjedde
- Sikkerhet krever forensisk sporbarhet
- AI-systemer tar autonome beslutninger

## Når brukes det IKKE

- Rene lesehandlinger uten sensitiv data
- Midlertidig prototype uten ekte brukere
- Ren UI-state

## Skip-regel

Hopp over hvis ALLE er sanne: ingen persondata, ingen handlinger med konsekvenser utenfor egen konto, ingen samsvarskrav. (Vanligvis: aldri i produksjon.)

---

## Sjekkliste — still ett spørsmål av gangen

### Gruppe 1 — Hva skal logges
- Opprettelse, endring (før/etter), sletting (myk/hard)
- Tilgangsendringer, innlogging/utlogging, mislykket innlogging
- Eksport/nedlasting, AI-genererte beslutninger

### Gruppe 2 — Hva SKAL IKKE logges
- Passord, tokens, hemmeligheter (selv hashet)
- Klartekst persondata — pseudonymiser
- Hver museklikk — kun meningsfulle handlinger

### Gruppe 3 — Per oppføring
- Hvem (bruker-ID, ikke navn)
- Hva (handling-type fra fast enum)
- Når (UTC, ISO 8601)
- Ressurs (type + ID), før/etter (redact sensitive felter)
- Fra hvor (IP, brukeragent, sesjon-ID), request-ID for korrelasjon

### Gruppe 4 — Lagring og integritet
- Append-only, egen tabell eller eksternt SIEM
- Write-only: kan ikke endres
- Signering/hash-kjeding ved sensitive miljøer
- Speiling til tamper-proof backup

### Gruppe 5 — Tilgang
- Kun admin-rolle (M:tilgangsport)
- Logg-lesing logges selv
- Eksport krever ekstra autorisasjon

### Gruppe 6 — Retention og GDPR
- Standard 90 dager til 7 år; ulik per handlingstype
- Rett-til-glemsel: pseudonymiser ID, behold struktur
- Automatisk arkivering/sletting

### Gruppe 7 — Ytelse
- Asynkron skriving (kø/stream); aldri blokker hovedflyt
- Logg-feil: handling fortsetter, alarm sendes
- Sampling for høyvolum

### Gruppe 8 — Eksport og varsler
- Format: CSV, JSON, signert PDF
- Filter: dato, bruker, ressurs, type
- Generering av Art. 30-fortegnelse
- Varsel ved mistenkelig adferd og endring av kritisk data

### Gruppe 9 — Visning i UI
- "Siste aktivitet" på detaljside
- Filtrerbar logg-side for admin
- Skille automatiske og manuelle; menneskelig lesbar beskrivelse

---

## Tilstander

- **Loading** — paginert henting
- **Empty** — ingen aktivitet (forklar hva som vil vises)
- **Filtrert tom** — CTA: nullstill filter
- **Error** — fallback: "kontakt support"

---

## Tilgjengelighet (WCAG 2.2)

- 1.3.1 Info and Relationships — tabellstruktur, ikke divs
- 2.4.6 Headings and Labels — beskrivende kolonneoverskrifter
- 1.4.3 Contrast (Minimum) — statusindikatorer
- 4.1.3 Status Messages — filterresultat kunngjøres
- 1.3.2 Meaningful Sequence — kronologisk eksplisitt

---

## Kanttilfeller

- Slettet bruker referert i gammel logg
- Batch-handling på 10 000 objekter (grupper i én entry)
- Distribuerte systemer med klokke-skew (monoton sekvens)
- Logg-skriving feiler (kø + alarm, ikke kast til bruker)
- GDPR-sletting hvis ID brukes som fremmednøkkel
- Tidssone-forvirring (lagre UTC, vis lokal eksplisitt)
- Retention-grense nås under aktiv revisjon

---

## Anti-mønster

- Logge passord/tokens/PII i klartekst
- Stille logging — feil skal alarmere
- Endringsbar logg
- Synkron blokkering av hovedflyt
- Generiske event-navn ("update") uten struktur

---

## Eksempler

**SaaS med GDPR:** CRUD på persondata logges. Pseudonymisering ved rett-til-glemsel. 12 mnd retention. Signert eksport for revisor.

**Helse-app:** Alle journal-visninger logges. 10 års retention, signert hash-kjede. SIEM + sanntidsvarsler. Pasient kan be om innsynslogg.

---

## Relaterte mønstre

- M:tilgangsport — definerer hva som krever logging
- M:feilhandtering — logging av feil
- M:tilgangsport — innloggings-events

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
