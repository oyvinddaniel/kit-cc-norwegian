# protocol-DRIFT-DETECTOR v1.0

> Overvåker at agent-output samsvarer med original intensjon over lange oppgaver

**Kritiske regler:** Pause hvert 30. minutt. Divergens stoppes umiddelbart og vises til bruker. `lastDriftCheck` oppdateres alltid i PROJECT-STATE.json etter sjekk.

---

## HENSIKT

Tenk på det som: en GPS-navigation som varsler deg hvis du har kjørt for langt fra ruten, før du ender opp i feil by.

METR viser at alle agents har fallende suksessrate etter 35 minutter. Dobling av oppgavelengde firdobler feilraten. Protokollen starter med tid-basert pause (enklest) og kan utvides til semantisk deteksjon.

---

## INTENT-SNAPSHOT

Ved oppgavestart: lagre i PROGRESS-LOG:

```
[DRIFT-CHECK] Intent-snapshot lagret
Oppgave: [OPPGAVE-BESKRIVELSE]
Startet: [TIDSPUNKT]
```

---

## TID-BASERT PAUSE (FASE 1)

Hvert 30. minutt: PAUSE og sjekk:

```
DRIFT-SJEKK (30 min)

Original intent: [Intent-snapshot fra oppgavestart]
Nåværende arbeid: [Beskriv hva du gjør akkurat nå]

Er disse i samsvar?
- Ja → Fortsett. Logg [DRIFT-CHECK] OK i PROGRESS-LOG.
- Nei/Delvis → STOPP og vis divergens til bruker.
```

Oppdater `professionalPackage.lastDriftCheck` i PROJECT-STATE.json:
```json
{
  "professionalPackage": {
    "lastDriftCheck": "2026-04-19T14:30:00Z"
  }
}
```

---

## FEW-SHOT: DRIFT-RAPPORT VED DIVERGENS

```
DRIFT-SJEKK — 30 min

Original intent: "Implementer brukerlogin med e-post og passord"
Nåværende arbeid: "Jobber med layout og animasjoner på landingssiden"

Status: DIVERGENS OPPDAGET

Det ser ut til at vi har beveget oss fra brukerlogin til UI-arbeid.

Alternativer:
1. Gå tilbake til brukerlogin (original intent)
2. Fullføre UI-arbeidet og ta brukerlogin etterpå
3. Stopp — du bestemmer neste steg

Hva velger du?
```

---

## FEW-SHOT: DRIFT-SJEKK OK

```
[DRIFT-CHECK] OK — 2026-04-19T14:30:00Z
Nåværende: Implementerer JWT-håndtering (del av brukerlogin-oppgaven)
Samsvar med intent: Ja
Neste sjekk: ~15:00
```

---

## GUARDRAILS

### Gjør alltid
- Ta pause ved 30-minutters merket — sett et mentalt varsel ved oppgavestart
- Logg alle drift-sjekker i PROGRESS-LOG
- Vis divergens eksplisitt — ikke bare "justere kursen" uten å informere

### Ikke gjør
- Fortsett uten pause ved lange oppgaver
- Skjul divergens eller "korrigere stille" uten å informere bruker

### Stopp og spør
- Alltid ved divergens — bruker bestemmer veien videre

---

## KRITISKE REGLER (gjentas)

Pause hvert 30. minutt. Divergens stoppes umiddelbart og vises til bruker. `lastDriftCheck` oppdateres alltid i PROJECT-STATE.json etter sjekk.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
