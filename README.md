# Kit CC

> Norsk multi-agent-rammeverk for å bygge produksjonsklar programvare med Claude Code.

**Kit CC** gjør Claude Code disiplinert nok til å ta et prosjekt hele veien fra idé til ferdig, publisert app — uten at du mister kontroll eller kvalitet underveis. Du beskriver hva du vil bygge i vanlig språk, og et team av spesialiserte AI-agenter planlegger, bygger, tester og sikrer koden gjennom 7 strukturerte faser.

**Filosofi:** Alle kan AI-kode. Få vet når AI gjør feil. *Ferdig = bevis, ikke ord.*

Versjon: 3.6.0

---

## Kom i gang

**Forutsetning:** [Claude Code](https://docs.claude.com/claude-code) må være installert.

Kjør installeren — den henter Kit CC og legger alt på plass (også skjulte filer), så du slipper å flytte filer manuelt:

**Ny app** (installeren oppretter mappa for deg):
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/oyvinddaniel/kit-cc-norwegian/main/install.sh) min-nye-app
```

**App du har fra før** (stå i prosjektmappa di — Kit CC legges inn ved siden av koden din):
```bash
cd min-eksisterende-app
bash <(curl -fsSL https://raw.githubusercontent.com/oyvinddaniel/kit-cc-norwegian/main/install.sh)
```

Deretter:
1. Åpne **Claude Code i mappa** (kommandoen `claude`).
2. Velg modus når Kit CC spør:
   - **Bygge** — bygg en ny app, fortsett en påbegynt app, eller la Kit CC overta og videreutvikle en app du har fra før (eksisterende kode oppdages automatisk).
   - **Spørre** — få svar uten å endre noe (read-only).

**Tips — to chatter samtidig:** Kjør «Bygge» i én Claude Code-chat og «Spørre» i en annen. Da kan du spørre om fremdrift eller hvordan Kit CC fungerer mens byggingen pågår. Kit CC anbefaler å bygge i ÉN chat per app — flere byggende agenter i samme filer kan tråkke hverandre på tærne og skape konflikter.

Du trenger ikke huske kommandoer — snakk i vanlig språk.

---

## Slik fungerer det

1. **Beskriv idéen din** — i vanlig språk.
2. **Kit CC planlegger** — bryter idéen ned i funksjoner, krav og sikkerhet, tilpasset hvor stort prosjektet er.
3. **AI-teamet bygger** — gjennom de 7 fasene.
4. **Du følger med** — i Kit CC Monitor (lokalt dashboard).

### De 7 fasene

Idé → Planlegg → Arkitektur → MVP → Bygg → Test → Publiser

Hver fase har en kvalitetsport. Sikkerhet (Row Level Security, hemmeligheter, hallusinerte pakker, trusselmodellering) håndteres i hver fase — ikke som en ettertanke. Prosessen tilpasser seg: et hobbyprosjekt går raskt gjennom, et kritisk system får grundig behandling.

---

## Kit CC Monitor

Et lokalt dashboard som viser fremdrift, byggeliste, funksjoner, integrasjoner og feil — i sanntid. Kit CC starter og installerer det automatisk ved behov. Vil du starte det manuelt:

```bash
npm install --prefix kit-cc-overlay
node kit-cc-overlay/server.js
```

Klikk lyspære-ikonet øverst i Monitor for en «Slik fungerer det»-oversikt.

---

## Hva er inni

- **57 AI-agenter** — 6 system, 7 basis, 7 prosess (fasene) og 37 eksperter (sikkerhet, design, data, test, drift …)
- **33 protokoller** — krasj-gjenoppretting, kontekstbudsjett, feil-autofiks, sikkerhet …
- **22 mønstre** — sjekklister som fanger mikrodetaljer (tilstander, kanttilfeller, tilgjengelighet …)
- **5 intensitetsnivåer** — fra enkelt hobbyprosjekt til stort, kritisk system
- **Norsk-først** — hele rammeverket og samtalen er på norsk

Topp-3 sikkerhets-eksperter: **HALLUSINASJON-DETEKTOR** (fanger AI som lyver), **RLS-TESTER** (verifiserer Row Level Security) og **HEMMELIGHETSSJEKK** (hindrer at nøkler og passord lekker).

---

## Mappestruktur

```
CLAUDE.md            ← boot-fila (start her)
Kit CC/
├── Agenter/         ← alle agentene, mønstre, maler, klassifisering, scripts
├── docs/            ← brukerveiledning (HURTIGSTART m.fl.)
├── hooks-library/   ← Claude Code-hooks (sikkerhet)
└── templates/       ← disaster-runbooks, hendelses-maler, pgTAP-tester
kit-cc-overlay/      ← Kit CC Monitor (dashboard)
.ai/                 ← prosjekt-state (opprettes automatisk når du bygger)
```

---

## Mer dokumentasjon

- **Hurtigstart:** `Kit CC/docs/HURTIGSTART.md`
- **Dyp planlegging:** `Kit CC/docs/PLANLEGGING-DYP.md`
- **Full filkatalog:** `Kit CC/Agenter/agenter/system/doc-FILKATALOG.md`

---

## Krav

- Claude Code
- Node.js 18+ (for Kit CC Monitor)

---

© Øyvind Daniel Paulsen / Aino AI Lab.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
