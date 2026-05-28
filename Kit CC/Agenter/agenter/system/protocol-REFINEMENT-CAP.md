# protocol-REFINEMENT-CAP v1.0

> Hard cap på refinement-iterasjoner for å forhindre infinite loops og error amplification

**Kritiske regler:** Maks 5 refinement-runder. Cap-trigger krever bruker-beslutning. Telleren inkrementeres ved EVERY refinement-request — ingen unntak.

---

## HENSIKT

Tenk på det som: et parkeringsur — etter 5 timer må du ta en aktiv avgjørelse om du vil fortsette.

Setter en grense på maks 5 refinement-runder per oppgave. Multi-agent-systemer har dokumentert 17× error amplification uten formell termineringskriterie. Uten en cap kan AI fange seg selv i en raffinerings-loop der hver iterasjon gjør ting verre.

---

## TELLER

Feltet `professionalPackage.refinementCounter` i PROJECT-STATE.json inkrementeres ved hver refinement-request:

```json
{
  "professionalPackage": {
    "refinementCounter": 3
  }
}
```

Inkrementer slik:
```
[S4] Refinement-runde 3/5 — [KORT_BESKRIVELSE_AV_ENDRING]
```

---

## GRENSE

Ved `refinementCounter > 5`:

ORCHESTRATOR blokkerer videre refinement og presenterer:

```
REFINEMENT-CAP nådd (5 runder)

Du har raffinert denne oppgaven 5 ganger. Videre refinement er blokkert.

Valg:
1. Godta nåværende resultat (anbefalt)
2. Komplett redesign (nullstiller teller — starter fra scratch)
3. Avbryt og gå tilbake til forrige steg
```

Vent på bruker-valg. Fortsett ikke uten svar.

---

## RESET

Telleren nullstilles ved:
- Ny oppgave (nytt oppgave-ID)
- Bruker velger "komplett redesign" (valg 2)
- Manuell reset: sett `professionalPackage.refinementCounter = 0` i PROJECT-STATE.json

---

## FEW-SHOT: TELLER-LOG I PROGRESS-LOG

```
[S4] Refinement-runde 1/5 — justert fargeskjema for bedre kontrast
[S4] Refinement-runde 2/5 — endret knapp-tekst fra "Send" til "Fullfør bestilling"
[S4] Refinement-runde 3/5 — lagt til loading-state
[S4] Refinement-runde 4/5 — justert mobilvisning
[S4] Refinement-runde 5/5 — fiks typefeil i validering
[S4] CAP NÅDD — presenterer valg til bruker
```

---

## GUARDRAILS

### Gjør alltid
- Inkrementér teller i PROJECT-STATE ved refinement
- Vis teller i status-rapporter: "Refinement 3/5"
- Logg alle refinement-runder i PROGRESS-LOG

### Ikke gjør
- Refinere uten å inkrementere teller
- Ignorere cap-triggeren
- Fortsette refinement etter cap uten bruker-beslutning

### Stopp og spør
- Alltid ved cap-trigger — vent på bruker-valg (1, 2 eller 3)

---

## KRITISKE REGLER (gjentas)

Maks 5 refinement-runder. Cap-trigger krever bruker-beslutning. Telleren inkrementeres ved EVERY refinement-request — ingen unntak.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
