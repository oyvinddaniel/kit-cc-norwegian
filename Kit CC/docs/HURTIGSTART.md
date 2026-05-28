# Hurtigstart — Kit CC

> Brukerveiledning for å komme i gang med Kit CC.

---

## Hva er Kit CC?

Kit CC er et komplett multi-agent system for å bygge programvare fra idé til ferdig produkt. Systemet består av 57 agenter (6 system + 7 basis + 7 prosess + 37 ekspert) fordelt på 4 nivåer som samarbeider for å hjelpe deg.

---

## Slik kommer du i gang

**Forutsetning:** [Claude Code](https://docs.claude.com/claude-code) må være installert.

1. **Plasser mappa** der prosjektet ditt skal bo (f.eks. `~/prosjekter/min-app/`). Hele Kit CC-mappa er prosjektets rotmappe.
2. **Åpne Claude Code i rotmappa** — den som inneholder `CLAUDE.md`. Den fila starter hele systemet automatisk.
3. **Velg modus** når Claude spør (se under). Det er alt — ingen oppsett kreves på forhånd.

**Kit CC Monitor (lokalt dashboard):** Starter automatisk ved behov og installerer seg selv første gang. Du trenger ikke gjøre noe. Vil du bruke AI-funksjonene inne i Monitor, legger du inn API-nøkkelen din i Monitorens eget oppsett-panel (ikke i en fil) — alt annet fungerer uten nøkkel.

---

## Ved oppstart velger du modus

| Modus | Beskrivelse |
|-------|-------------|
| **Bygge** | Start eller fortsett å bygge prosjektet (full skrivetilgang) |
| **Spørre** | Få svar uten å endre noe (read-only, VEILEDER-agent) |

---

## Bygge — første gang

1. Si "Start nytt prosjekt"
2. Svar på noen enkle spørsmål om prosjektet (progressiv avsløring)
3. Systemet klassifiseres automatisk
4. Fase 1 starter

## Bygge — fortsette eksisterende

1. Si "Fortsett"
2. Systemet leser hvor du var
3. Viser status og foreslår neste steg

## Spørre

1. Velg "Spørre" ved oppstart
2. VEILEDER-agent starter i read-only modus
3. Spør om Kit CC, prosjektet ditt, koding eller teknologi
4. Agenten søker på nett automatisk ved behov

---

## Nyttige kommandoer

| Kommando | Beskrivelse |
|----------|-------------|
| "Vis status" | Full prosjektoversikt med fremdrift |
| "Neste steg" | Delegerer til aktiv fase-agents neste oppgave |
| "Bytt til [agent]" | Kall spesifikk agent |
| "Re-klassifiser" | Kjør klassifisering på nytt |
| "Vis alle checkpoints" | Se lagringspunkter |
| "Gå tilbake til [dato]" | Rollback til tidligere tilstand |
| "Bytt til utvikler" | Endre kommunikasjonsnivå (også: "erfaren-vibecoder", "ny-vibecoder") |
| "Bytt byggemodus" | Bytt mellom ai-bestemmer / samarbeid / detaljstyrt |
| "Oversty gate [Fase-N]: [årsak]" | Manuelt overstyre fase-gate |

---

## Naturlig-språk-planlegging (v3.6.0+)

Du trenger ikke huske kommandoer. Si i naturlig språk:

| Du sier | Kit CC gjør |
|---|---|
| "Jeg vil planlegge en ny app" | Starter PLAN-modus, hyperdetaljert 4-nivå |
| "La oss brainstorme på dette" | BRAINSTORM-modus, ingen lagring uten samtykke |
| "Hvor er vi?" | STATUS-modus, kort oversikt |
| "Har vi planlagt nok?" | REVIEW-modus, kvalitetssjekk A-D |
| "Vi må også ha sletting" | Eksisterende protocol-MODULREGISTRERING fanger opp |

Detaljer: `Kit CC/Agenter/agenter/system/protocol-INTENT-DETEKSJON.md`

Slash-kommandoer (`/kitcc-plan` osv.) finnes fortsatt for de som vil bruke dem direkte.
Begge skriver til samme SSOT-filer.

---

## De 7 fasene

| Fase | Navn | Hva skjer |
|------|------|-----------|
| 1 | Idé og visjon | Hva skal du bygge? |
| 2 | Planlegg | Funksjoner, krav og sikkerhet |
| 3 | Arkitektur og sikkerhet | Hvordan bygges det trygt? |
| 4 | MVP | Sett opp prosjektet - Første fungerende versjon |
| 5 | Bygg funksjonene | Feature-loop: Bygg → Test → Poler → Godkjenn → Neste |
| 6 | Test og kvalitetssjekk | Fungerer alt? |
| 7 | Publiser og vedlikehold | Ut i verden |

Prosessen tilpasser seg ditt prosjekt. Et hobby-prosjekt går raskt gjennom, mens et enterprise-system får grundigere behandling.

---

## Prosjekttyper

| Prosjekttype | Score | Typisk |
|------|-------|--------|
| Enkelt hobbyprosjekt | 7-10 | Hobby, læring, prototyper |
| Lite, oversiktlig prosjekt | 11-14 | Interne verktøy |
| Vanlig app-prosjekt | 15-18 | Kundevendte apper |
| Viktig prosjekt med sensitive data | 19-23 | Viktige systemer |
| Stort, kritisk system | 24-28 | Kritisk infrastruktur |

---

## Kompatibilitet med andre AI-verktøy

Kit CC er bygd for **Claude Code**, der `CLAUDE.md` er boot-fila som starter hele systemet.

Andre AI-kodeverktøy (Cursor, Windsurf m.fl.) kan peke mot `CLAUDE.md` som instruksjonsfil, men boot-sekvensen er testet og optimalisert for Claude Code.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
