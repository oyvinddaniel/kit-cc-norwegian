# protocol-ERROR-AUTOFIX.md — Automatisk feilhåndtering via Monitor

> **Type:** Protokoll (Lag 2)
> **SSOT for:** Automatisk deteksjon og fiksing av nettleser-feil fanget av Kit CC Monitor
> **Versjon:** 1.0
> **Opprettet:** 2026-02-22

---

## FORMÅL

Denne protokollen definerer hvordan Kit CC AI-agenter automatisk leser, vurderer og fikser feil
som fanges fra nettleseren via Kit CC Monitor. Feilene lagres i `.ai/MONITOR-ERRORS.json` (SSOT)
og leses av agenter etter kode-endringer i fase 4 og 5.

---

## FIL-KONTRAKT

**Fil:** `.ai/MONITOR-ERRORS.json`

```json
{
  "version": 1,
  "maxErrors": 100,
  "errors": [{
    "id": "err-1708617600000-abc12",
    "type": "error|warn|uncaught|promise|network",
    "message": "TypeError: Cannot read property 'x' of undefined",
    "data": {},
    "source": "http://localhost:3002/app/page.tsx",
    "line": 42,
    "col": 15,
    "url": "http://localhost:3002/dashboard",
    "timestamp": 1708617600000,
    "count": 1,
    "firstSeen": 1708617600000,
    "lastSeen": 1708617600000,
    "status": "new",
    "fixAttempts": 0
  }]
}
```

**Status-verdier:**
- `"new"` — Ikke behandlet ennå
- `"fixing"` — AI jobber med å fikse feilen
- `"unfixable"` — Gitt opp etter 3 forsøk

---

## RELEVANSFILTRERING

Ikke alle feil skal fikses automatisk. Bruk denne prioriteringen:

| Type | Handling | Begrunnelse |
|------|----------|-------------|
| `uncaught` | **Alltid fiks** | Krasjer appen, kritisk |
| `error` | **Fiks hvis relatert til endret fil** | Sannsynlig regresjons-feil |
| `promise` | **Fiks hvis relatert til endret fil** | Ubehandlede async-feil |
| `warn` | **Fiks kun hvis enkelt** (< 1 min estimat) | Ofte ikke-kritisk |
| `network` | **Ignorer** | Vanligvis infrastruktur/miljø |

**"Relatert til endret fil"** betyr: Feilens `source`-felt inneholder en filsti som AI nylig har endret.

---

## SIKKERHET MOT LØKKER

Automatisk feilfiksing kan skape nye feil. Disse reglene forhindrer løkker:

1. **Maks 3 forsøk per feil** — Etter 3 `fixAttempts` → sett `status: "unfixable"`
2. **Maks 2 minutter per feil** — Ikke bruk urimelig tid på én feil
3. **Revert ved nye feil** — Hvis fikse-forsøk skaper NYE feil som ikke eksisterte før:
   - Revert endringen (git checkout)
   - Inkrementer `fixAttempts`
   - Gå videre til neste feil
4. **Maks 5 feil per syklus** — Ikke fiks mer enn 5 feil i én feilsjekk-runde
5. **Aldri fiks feil i Monitor-kode** — Ignorer feil fra `overlay.js`, `kit-cc-overlay/`

---

## ARBEIDSFLYT

### Når feilsjekk kjøres

| Situasjon | Handling |
|-----------|----------|
| Etter kode-endring i fase 4/5 | Les og fiks relevante feil |
| Ved sesjonstart i fase 4/5 | Les og rapporter status |
| I fase 1-3 | **Aldri** — ingen kode å fikse |
| I fase 6-7 | Les og rapporter, men fiks kun kritiske |

### Feilsjekk-syklus (etter kode-endring)

```
1. Les .ai/MONITOR-ERRORS.json
2. Filtrer: status="new" OG fixAttempts < 3
3. Sorter etter type-prioritet: uncaught > error > promise > warn
4. For HVER relevant feil (maks 5):
   a. Sett status="fixing" i filen
   b. Analyser feilmelding og source
   c. Finn og fiks rotårsaken
   d. Sjekk om fiksen introduserer nye feil
   e. Hvis fikset → Fjern feilen fra filen
   f. Hvis ikke fikset → fixAttempts++, status="new"
   g. Hvis fixAttempts >= 3 → status="unfixable"
5. Logg resultat: {"ts":"<ISO 8601>","event":"ERROR_AUTOFIX","errors_found":[N],"fixed":[M],"schemaVersion":1}
```

### Filoperasjoner

**Lese filen:**
```
Les .ai/MONITOR-ERRORS.json → parse JSON → filtrer på status/fixAttempts
```

**Fjerne fikset feil:**
```
Les filen → filtrer ut feilen med gitt id → skriv tilbake (atomisk via .tmp)
```

**Oppdatere status:**
```
Les filen → finn feilen med id → oppdater status/fixAttempts → skriv tilbake
```

---

## INTEGRASJON MED FASE-AGENTER

### 4-MVP-agent.md
Etter kode-endringer i steg 3/4, les `protocol-ERROR-AUTOFIX.md` og kjør feilsjekk-syklus.

### 5-ITERASJONS-agent.md
Etter hvert bygg/test-steg (steg 2-4), kjør feilsjekk-syklus som et eget steg.

---

## VERIFISERING MED PROBES

Etter en feil er fikset, bruk **browser debug probes** for å verifisere at feilen faktisk er borte:

### Etter fiks av console-feil
```
POST /kit-cc/api/probes?wait=true
Body: { "type": "console.log", "params": { "level": "error", "limit": 5 } }
```
Sjekk at den opprinnelige feilmeldingen ikke lenger dukker opp i resultatet.

### Etter fiks av nettverksfeil
```
POST /kit-cc/api/probes?wait=true
Body: { "type": "network.failed", "params": { "minutes": 2 } }
```
Sjekk at det feilede kallet ikke lenger gjentas.

### Etter fiks av DOM/render-feil
```
POST /kit-cc/api/probes?wait=true
Body: { "type": "dom.query", "params": { "selector": "[feilende-element]" } }
```
Sjekk at elementet nå rendres korrekt (exists: true, visible: true).

### Probe-typer for feilverifisering

| Probe-type | Når den brukes | Timeout |
|------------|---------------|---------|
| `console.log` | Etter fiks av JS-feil (uncaught, error, promise) | 5s |
| `network.failed` | Etter fiks av nettverksfeil | 5s |
| `dom.query` | Etter fiks av render/visningsfeil | 5s |
| `js.eval` | For å teste spesifikke tilstander | 5s |

### Timeout-håndtering
- Default timeout: 5 sekunder
- Hvis probe timer ut: Nettleseren er kanskje ikke tilkoblet → rapporter til bruker
- Maks 3 verifiseringsprobes per feilsjekk-syklus (unngå overbelastning)

---

## LOGGING

Alle feilsjekk-resultater logges i PROGRESS-LOG:

```jsonl
{"ts":"<ISO 8601>","event":"ERROR_AUTOFIX","errors_found":3,"fixed":2,"unfixable":0,"schemaVersion":1}
{"ts":"<ISO 8601>","event":"ERROR_AUTOFIX","errors_found":1,"fixed":0,"unfixable":1,"schemaVersion":1}
```

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
