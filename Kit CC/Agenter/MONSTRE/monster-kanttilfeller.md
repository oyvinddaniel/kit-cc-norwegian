---
name: M:kanttilfeller
version: 1.0
applies_to:
  paths: []
  contexts: [alle underfunksjoner i nivå 4-planlegging]
last_reviewed: 2026-05-13
skip_if: aldri — alle underfunksjoner krever kanttilfelle-vurdering
ekspert_trigger: [TEST-GENERATOR-ekspert, SIKKERHETS-agent, HALLUSINASJON-DETEKTOR-ekspert]
metatype: METAMØNSTER
---

# Mønster: Kanttilfeller (METAMØNSTER)

> **OBLIGATORISK metamønster — sjekkes alltid.** Brukes ALLTID sammen med andre mønstre. Dette er ikke et UX-flate-mønster — det er en sjekkliste over kanttilfeller som MÅ vurderes for HVER underfunksjon i nivå 4-planlegging.
>
> **Kilde:** LLM-er er empirisk svake på edge cases uten eksplisitt prompting (arXiv 2406.07021). Derfor enumererer vi eksplisitt — happy-path-planlegging er den vanligste feilen.

---

## Når brukes dette mønsteret

**Alltid.** Obligatorisk for alle underfunksjoner i nivå 4-planlegging. Kjøres i tillegg til andre relevante mønstre (M:skjema, M:liste, M:slett, osv.).

## Når brukes det IKKE

Ingen unntak. Selv "enkle" funksjoner har kanttilfeller — undervurdering av kompleksitet er anti-mønsteret dette skal motvirke.

## Skip-regel

**Aldri.** Hvis du føler trang til å hoppe over: det er nettopp da kanttilfellene biter hardest.

---

## Sjekkliste — gå gjennom hver gruppe, dokumenter beslutning per punkt

For hver gruppe: noter (a) gjelder dette? (b) hva er forventet oppførsel? (c) hvordan testes det?

### Gruppe 1 — Null / Tom / Undefined
- Hva hvis input er `null`?
- Hva hvis input er `undefined` (annerledes enn null i JS)?
- Hva hvis input er tom string `""`?
- Hva hvis input er tom liste `[]`?
- Hva hvis input er tom objekt `{}`?
- Hva hvis required field ikke er fylt?

### Gruppe 2 — Grenser
- Hva hvis tall er `0`?
- Hva hvis tall er negativt (når kun positivt er forventet)?
- Hva hvis tall er ekstremt stort (overflow)?
- Hva hvis string er ekstremt lang (DoS-potensial)?
- Hva hvis liste har 0 elementer? 1 element? 1 million?
- Hva hvis dato er i fortid (når fremtid forventes)?
- Hva hvis dato-range er invalid (slutt før start)?

### Gruppe 3 — Samtidighet / Race
- Hva hvis to brukere skriver til samme record samtidig?
- Hva hvis bruker dobbeltklikker submit-knapp?
- Hva hvis brukerens session utløper midt i operasjon?
- Hva hvis bruker har modulen åpen i to faner?
- Hva hvis offline-handling syncs etter online-handling?
- TOCTOU (Time-Of-Check-To-Time-Of-Use)?

### Gruppe 4 — Tilgang / Permission
- Hva hvis bruker mister tilgang midt i sesjon?
- Hva hvis admin trekker rolle?
- Hva hvis API returnerer 403 etter at frontend trodde tilgang var OK?
- Hva hvis bruker prøver handling på data de ikke eier?

### Gruppe 5 — Network / Server
- Hva hvis network fails midt i request?
- Hva hvis server timeout?
- Hva hvis server returnerer 500?
- Hva hvis server returnerer noe forventet, men i feil format?
- Hva hvis CDN-fail?

### Gruppe 6 — Data-state
- Hva hvis data i cache er stale?
- Hva hvis data er slettet av annen prosess?
- Hva hvis backup er ufullstendig?
- Hva hvis migrering ikke har kjørt enda?

### Gruppe 7 — Karakterer / Unicode
- Emoji, RTL-tegn, zero-width space, null-byte (`\0`)?
- SQL-injection-tegn (sanitiser!)?
- XSS-tegn (escape!)?

### Gruppe 8 — Tid / Tidssoner
- DST-overganger (klokke hopper 2→3 om våren)?
- Negativ duration (sluttid før starttid)?
- Tidssone-edge (handling i én zone, lagret i annen)?
- Skuddår (29. februar)?
- Klokkeendringer 23 vs 25 timer?

### Gruppe 9 — Performance
- Hva hvis bruker har 10K elementer i listen?
- Hva hvis filtrering må gjøres på enormt datasett?
- Hva hvis komponent rendres 60 ganger per sekund pga reactive state?

---

## Tilstander

Hver edge case mappes til: **Loading** (pågår) | **Empty** (null/tom + CTA) | **Error** (klartekst + recovery) | **Conflict** (race håndtert) | **Denied** (permission-feil forklart).

## Tilgjengelighet (WCAG 2.2)

- **3.3.1 Error Identification** — edge-case-feil må identifiseres tydelig
- **3.3.3 Error Suggestion** — gi rettingsforslag der mulig
- **4.1.3 Status Messages** — ARIA live-regions for asynkrone feil

## Kanttilfeller (meta)

Hva hvis flere edge cases inntreffer samtidig (f.eks. network fail + session timeout)? → prioriter blokkerende > recoverable.

---

## Anti-mønster

- ❌ **"Happy path only"-planlegging** — den vanligste feilen, og kjernebegrunnelsen for dette metamønsteret (arXiv 2406.07021).
- ❌ Generell "try/catch alle errors" uten å enumerere hva som faktisk kan feile.
- ❌ "Vi fikser det hvis det skjer" — uplanlagte edge cases blir produksjonsbugger.
- ❌ Hoppe over Gruppe 1-5 fordi "det er åpenbart" — det er nettopp der LLM-er glipper.

## Eksempler

**Lagre profil-skjema:** G1 tom navn → valider før submit | G3 dobbel-submit → disable etter klikk | G5 network fail → behold form-data lokalt + retry | G7 emoji → tillat, men begrens bytes.

**Slett rad fra liste:** G3 to brukere sletter samme rad → "allerede slettet av X" | G4 tilgang trukket → 403 med admin-link | G6 rad slettet i cache → refresh + informer.

## Relaterte mønstre & prioritering

Kjøres i tillegg til alle andre mønstre, aldri i stedet. Overlapper M:tilbakemelding (feilvisning) og M:tilgangsport (Gruppe 4). **Ved tidspress:** prioriter Gruppe 1-5 — de dekker ~80% av produksjonsbugger.

## Versjon

**v1.0** — 2026-05-13 | Metamønster for Kit CC v3.6.0 | Kilde: arXiv 2406.07021

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
