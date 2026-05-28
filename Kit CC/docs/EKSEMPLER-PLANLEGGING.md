# Eksempler: Kit CC PLANLEGGER i praksis

> Konkrete dialog-eksempler som viser hvordan de 4 modusene (PLAN, BRAINSTORM, STATUS, REVIEW) fungerer, pluss "by the way"-flow.

---

## Eksempel 1: PLAN-modus (nytt prosjekt)

**Bruker:** "Jeg vil planlegge en todo-app for små team."

**AI (intent-deteksjon):** Detektert PLAN (konfidens 0.95). Aktiverer PLAN-modus.

**AI:** "Hvor mye tid har du til denne planleggings-økten?
- 10 min (bare hovedfunksjoner)
- 1 time (+ underfunksjoner)
- 2 timer (+ detaljer)
- Halve dagen (alle 4 nivåer)
- Flere dager (+ research)
- Ukesvis (enterprise)"

**Bruker:** "2 timer."

**AI:** "Hva er de viktigste tingene appen din skal kunne gjøre?"

**Bruker:** "Lage lister, dele med team, sette frister, og se hva andre jobber med."

**AI:** "Bra — fire hovedmoduler: M-001 Lister, M-002 Deling, M-003 Frister, M-004 Aktivitet. La oss bryte ned M-001 først. Hva skal en liste minst inneholde?"

[...dialog fortsetter gjennom nivå 1, 2, 3...]

[Etter 2 timer: AI har samlet 4 hovedfunksjoner, 12 underfunksjoner, 30 detaljer med GIVEN-WHEN-THEN. Klar for byggings-sesjon eller utdypingen til nivå 4.]

---

## Eksempel 2: BRAINSTORM-modus

**Bruker:** "Jeg lurer på om todo-appen skal ha offline-støtte."

**AI (intent-deteksjon):** Detektert BRAINSTORM (konfidens 0.88).

**AI:** "Vi er i utforsknings-modus. Ingenting lagres uten ditt samtykke. La oss tenke høyt. Hva slags brukere har dere typisk?"

**Bruker:** "Konsulenter som reiser mye. Tog, fly, kafeer med dårlig wifi."

**AI:** "Da er offline et reelt behov, ikke bare nice-to-have. Tre alternativer:
1. Full offline med sync (kompleks — CRDT eller operational transform)
2. Read-only offline (enklere — cache siste tilstand)
3. Optimistic UI uten ekte offline (billigst — feiler ved nett-tap)

Hovedutfordringen er sync-konflikter når to redigerer samme liste offline. Hvor sannsynlig er det?"

[Dialog fortsetter. Konklusjon: hovedutfordring er sync-konflikter. Bruker bestemmer seg ikke ennå.]

**AI:** "Skal jeg fange denne idéen i planen, eller la den ligge?"

**Bruker:** "La den ligge — vi tar det senere."

---

## Eksempel 3: STATUS-modus

**Bruker:** "Hvor er vi?"

**AI (intent-deteksjon):** Detektert STATUS (konfidens 0.92).

**AI:** "Status — Todo-app

Fase: 2 (Planlegg)
Klassifisering: STANDARD
Tidsmodus: 2 timer

Moduler: 5 totalt — 3 grønne, 2 hvite
Underfunksjoner: 14 (gjennomsnitt 2.8 per modul)
Mikrodetaljer: 12 (lav coverage — kun for M-001)

Sist VALIDERING: ikke kjørt ennå.

Åpne spørsmål: Ingen.
Blokkerte: Ingen.

Anbefalt neste handling: kjør PLAN-modus for å fylle mikrodetaljer for M-002 til M-005."

---

## Eksempel 4: REVIEW-modus

**Bruker:** "Har vi planlagt nok?"

**AI (intent-deteksjon):** Detektert REVIEW (konfidens 0.94).

**AI:** "Kjører REVIEW. Leser hele planen + mønster-bibliotek. Self-consistency med 3 plan-varianter for kritiske moduler. Tar ca 2 minutter."

[...AI gjør R1-R7...]

**AI:** "VALIDERING.md skrevet. Karakter: **B**

Styrker:
- Alle hovedfunksjoner har minst 2 underfunksjoner
- M:tilstander dekket for alle moduler
- Akseptansekriterier finnes for alle MVP-moduler

Viktige mangler:
- M-003 (Deling): mangler M:tilgangsport — ingen rolle-håndtering planlagt
- M-005 (Eksport): kun 6 mikrodetaljer per underfunksjon (minst 10 anbefalt)

Mindre mangler:
- M-002: mangler edge case for 'tom liste etter sletting' (M:kanttilfeller)

Anbefaling: Karakter B er passering, men fiks M:tilgangsport for M-003 før produksjon.

Vil du:
(1) Gå tilbake til PLAN-modus og fikse M-003 + M-005 nå?
(2) Akseptere karakter B og fortsette til Fase 3 (arkitektur)?
(3) Be om mer detalj på funn?"

---

## Eksempel 5: Mikrodetalj-utdyping for én modul

**Bruker:** "Utdyp M-001 Lister til nivå 4."

**AI:** "Henter mønster-bibliotek for CRUD + samarbeid. Foreslår 22 mikrodetaljer fordelt på 4 underfunksjoner:

| ID | Underfunksjon | Mikrodetalj | GIVEN-WHEN-THEN |
|----|---------------|-------------|------------------|
| 1.1.1 | Opprett liste | Tom tittel avvises | GIVEN tom tittel WHEN lagre THEN feilmelding |
| 1.1.2 | Opprett liste | Maks 120 tegn | GIVEN >120 tegn WHEN lagre THEN trunkér |
| 1.2.1 | Rediger liste | Optimistisk oppdatering | GIVEN endring WHEN nettverksfeil THEN rull tilbake |
| 1.3.1 | Slett liste | Soft delete 30 dager | GIVEN slett WHEN bekreft THEN flagg som slettet |
| ... | ... | ... | ... |

Godkjenne alle, eller gå gjennom én og én?"

**Bruker:** "Godkjenn alle."

**AI:** "Lagret. M-001 er nå 100% dekket på nivå 4."

---

## Eksempel 6: "By the way"-flow

**Bruker (midt i Fase 4 MVP):** "Forresten, vi må også ha en delefunksjon."

**AI (protocol-MODULREGISTRERING):**
"Modul: M-006 (Delefunksjon) opprettet i MODULREGISTER med status Pending. Den blir plukket opp i Fase 5. Skal jeg utdype mikrodetaljer for den nå med PLAN-modus, eller fortsetter vi MVP-arbeidet?"

**Bruker:** "Fortsett MVP."

[AI logger event=MODULE med subtype=created, fortsetter MVP-arbeid uten avbrudd.]

---

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
