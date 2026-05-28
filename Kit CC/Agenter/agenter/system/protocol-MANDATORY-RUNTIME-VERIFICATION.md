# protocol-MANDATORY-RUNTIME-VERIFICATION v1.0

> Blokkerer "ferdig"-status til tester faktisk er kjørt og output er dokumentert

**Kritiske regler:** Ferdig = bevis, ikke erklæring. Ingen overgang til neste steg uten at verifikasjonskrav er oppfylt. Mocked output godkjennes aldri som bevis.

---

## HENSIKT

Tenk på det som: piloten som må fylle ut sjekklisten — ikke fordi han er upålitelig, men fordi "husker du" ikke er nok sikkerhet i kritiske situasjoner.

Forhindrer "completion theater" — tilfeller der AI erklærer "ferdig" uten at tester faktisk er kjørt. Frontier-modeller har dokumentert reward hacking ved å manipulere test-output (METR 2025).

---

## FERDIG-GATE

Ingen overgang til neste steg er tillatt uten dette:

```
VERIFIKASJONSKRAV:
☐ Testkjøring utført — output logget (ikke bare "passerer")
☐ Exit-code 0 verifisert
☐ Ingen mocked/stubbed responses i test-output
☐ Testfil-sti oppgitt (ikke generell påstand om at tester finnes)
```

---

## RAPPORTFORMAT

Bruk dette formatet etter alle testkjøringer:

```
---VERIFIKASJON---
Kommando: npm test
Exit-code: 0
Tidspunkt: 2026-04-19T14:30:00Z

Test-output (utdrag):
  ✓ bruker kan lese egne data (45ms)
  ✓ bruker ser ikke andres data (12ms)
  ✓ anonym bruker ser ingenting (8ms)
  3 tests passed, 0 failed

Testfil: src/__tests__/rls.test.ts
---END---
```

---

## BLOKKERING

Hvis agent sier "ferdig" uten verifikasjonsformat: ORCHESTRATOR blokkerer overgangen og svarer:

```
Stopp. Verifikasjon mangler.

"Ferdig" krever dokumentert test-output i dette formatet:
---VERIFIKASJON---
[output]
---END---

Kjør testene og vis output.
```

---

## GJELDER DISSE STEGENE

Protokollen aktiveres ved:
- Fullføring av en kodingsoppgave
- Overgang mellom fase-steg
- "Ferdig"-erklæring fra ekspert-agent
- Pre-deploy-sjekk

---

## FEW-SHOT: FEIL ERKLÆRING (blokkeres)

```
Agent: "Brukerlogin er implementert og fungerer korrekt."
ORCHESTRATOR: Stopp. Verifikasjon mangler. Vis test-output.
```

## FEW-SHOT: KORREKT ERKLÆRING (godkjennes)

```
Agent: "Brukerlogin er implementert.

---VERIFIKASJON---
Kommando: npm test -- --testPathPattern=auth
Exit-code: 0
Tidspunkt: 2026-04-19T14:30:00Z

Test-output:
  ✓ innlogging med korrekt passord (234ms)
  ✓ innlogging med feil passord returnerer 401 (45ms)
  ✓ JWT-token lagres korrekt (12ms)
  3 tests passed

Testfil: src/__tests__/auth.test.ts
---END---"
```

---

## GUARDRAILS

### Gjør alltid
- Vis faktisk test-output, ikke bare "tester passerer"
- Logg testfilsti
- Kjør tester på nytt etter endringer

### Ikke gjør
- Si "ferdig" uten dokumentert test-output
- Bruke mocked output som bevis
- Referere til en "forrige testkjøring" fra en annen sesjon

### Stopp og spør
- Hvis testene ikke kan kjøres ennå (mangler oppsett) — si det eksplisitt

---

## KRITISKE REGLER (gjentas)

Ferdig = bevis, ikke erklæring. Ingen overgang til neste steg uten at verifikasjonskrav er oppfylt. Mocked output godkjennes aldri som bevis.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
