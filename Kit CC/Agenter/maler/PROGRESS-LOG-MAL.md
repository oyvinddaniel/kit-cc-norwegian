# Progress Log Template

> **Formål:** Minutt-for-minutt handlingslogg for crash recovery og kontekstgjenoppretting.
> **Vedlikeholdes av:** Alle agenter (append-only etter HVER handling)
> **Leses av:** ORCHESTRATOR (ved krasj-deteksjon, primærkilde for recovery)
> **Crash-resilient:** Ja — append-only struktur, ingen overskriving

**Filplassering:** `.ai/PROGRESS-LOG.jsonl`

> **v3.3 — Forholdet mellom PROGRESS-LOG og SESSION-HANDOFF:**
> - `PROGRESS-LOG.jsonl` = Minutt-for-minutt handlingslogg (append-only, etter HVER handling)
> - `SESSION-HANDOFF.md` = Fase-overføring og milepælsoversikt (oppdateres ved milepæler/sesjonsslutt)
> - Ved krasj: Les PROGRESS-LOG først (mer detaljert og oppdatert)

---

## Når skal jeg legge til en linje?

**ALLTID append til PROGRESS-LOG.jsonl etter:**

1. **Oppgave startet** → Logging av arbeid
2. **Ny fil opprettet eller vesentlig endret** → Dokumentert for recovery
3. **Git commit** → Ny versjon lagret
4. **Oppgave fullført** → Milepæl oppnådd
5. **Brukerbeslutning** → Dokumentert for sammenheng
6. **Feil oppdaget og håndtert** → Viktig for recovery
7. **Kontekstbudsjett nådd** → Synkronisering med SESSION-HANDOFF.md
8. **Recovery utført** → Gjenopprettet fra krasj eller korrupt state
9. **Modus endret** → Endring av byggemodus

---

## JSONL-format (v3.6.0)

Hver linje bruker JSONL-format: én JSON-event per linje. Eldre versjoner (v2.0) brukte logfmt (`ts=HH:MM event=X ...`) — dette er erstattet av JSONL fra v3.6.0. Nøkler er lowercase, verdier i `"`. Én hendelse per linje. Ingen emojis. `schemaVersion` er obligatorisk (sett til `1`). `ts` er ISO 8601 UTC med Z-suffix.

### Alle hendelsestyper:

```jsonl
{"ts":"<ISO 8601>","event":"START","task":"[oppgave-ID]","session":"[sessionId]","desc":"[beskrivelse]","schemaVersion":1}
{"ts":"<ISO 8601>","event":"FILE","op":"created|modified","path":"[filsti]","desc":"[kort beskrivelse]","schemaVersion":1}
{"ts":"<ISO 8601>","event":"FILE","op":"commit","msg":"[commit-melding]","schemaVersion":1}
{"ts":"<ISO 8601>","event":"DONE","task":"[oppgave-ID]","session":"[sessionId]","output":"[leveranse/fil]","schemaVersion":1}
{"ts":"<ISO 8601>","event":"DECISION","session":"[sessionId]","what":"[hva ble bestemt]","reason":"[begrunnelse]","schemaVersion":1}
{"ts":"<ISO 8601>","event":"ERROR","type":"[state|planning|execution|context|communication|dependency|timeout|validation]","desc":"[beskrivelse]","fix":"[løsning]","schemaVersion":1}
{"ts":"<ISO 8601>","event":"ERROR_AUTOFIX","errors_found":[antall],"fixed":[antall],"schemaVersion":1}
{"ts":"<ISO 8601>","event":"CONTEXT_BUDGET","session":"[sessionId]","files":[antall],"messages":[antall],"schemaVersion":1}
{"ts":"<ISO 8601>","event":"RECOVERY","action":"[handling]","reason":"[årsak]","schemaVersion":1}
{"ts":"<ISO 8601>","event":"MODE_CHANGE","from":"[fra]","to":"[til]","schemaVersion":1}
```

> **Merk:** `event":"START"` skal alltid ha `"session":"[sessionId]"` — dette gjør krasj-deteksjon i CLAUDE.md steg 2 mulig.

### JSONL-regler:
- Nøkler er lowercase
- Strengverdier omsluttes av `"`
- Én JSON-event per linje — ingen pretty-print, ingen embedded newlines
- `schemaVersion` er obligatorisk (sett til `1`)
- Ingen emojis — ren maskinlesbar JSON

---

## Eksempel: En realistisk arbeidsøkt

```jsonl
{"ts":"2026-02-09T10:00:00Z","event":"RECOVERY","action":"session recovered from crash","reason":"session.status was active","schemaVersion":1}
{"ts":"2026-02-09T10:02:00Z","event":"FILE","op":"modified","path":".ai/PROJECT-STATE.json","desc":"Lest prosjektstatus","schemaVersion":1}
{"ts":"2026-02-09T10:05:00Z","event":"START","task":"MVP-01","session":"[SESSION-ID]","desc":"BYGGER — Implementere login-side","schemaVersion":1}
{"ts":"2026-02-09T10:15:00Z","event":"FILE","op":"created","path":"src/pages/login.jsx","desc":"Basis-struktur","schemaVersion":1}
{"ts":"2026-02-09T10:30:00Z","event":"FILE","op":"modified","path":"src/pages/login.jsx","desc":"Lagt til form + validering","schemaVersion":1}
{"ts":"2026-02-09T10:45:00Z","event":"FILE","op":"commit","msg":"WIP: Login-side med form validering","schemaVersion":1}
{"ts":"2026-02-09T11:00:00Z","event":"DONE","task":"MVP-01","session":"[SESSION-ID]","output":"login-side komplett med auth integration","schemaVersion":1}
{"ts":"2026-02-09T11:02:00Z","event":"DECISION","session":"[SESSION-ID]","what":"Utsetter dark mode til Fase 6","reason":"Bruker prioriterer funksjonalitet","schemaVersion":1}
{"ts":"2026-02-09T11:05:00Z","event":"START","task":"MVP-02","session":"[SESSION-ID]","desc":"Testing av login-flow","schemaVersion":1}
{"ts":"2026-02-09T11:20:00Z","event":"ERROR","desc":"Login feiler på Firefox","fix":"Fikset CORS-headers","schemaVersion":1}
{"ts":"2026-02-09T11:25:00Z","event":"FILE","op":"commit","msg":"Fix: CORS-headers for login endpoint","schemaVersion":1}
{"ts":"2026-02-09T11:30:00Z","event":"DONE","task":"MVP-02","session":"[SESSION-ID]","output":"Login-side godkjent for demo","schemaVersion":1}
{"ts":"2026-02-09T11:32:00Z","event":"CONTEXT_BUDGET","session":"[SESSION-ID]","files":9,"messages":22,"schemaVersion":1}
{"ts":"2026-02-10T14:00:00Z","event":"START","task":"MVP-03","session":"[SESSION-ID]","desc":"Implementere JWT-token refresh","schemaVersion":1}
```

> **Merk:** Sesjonsseparatorer (`## SESSION: ...`) hørte til logfmt-`.md`-formatet. JSONL er en ren strøm av events — sesjon spores via `"session":"[sessionId]"`-feltet på hver event.

---

## Rotasjonspolicy

**Fil blir for stor når:** > 500 linjer

**Handling:**
1. Behold **siste 200 linjer** i `.ai/PROGRESS-LOG.jsonl`
2. Arkiver resten til `.ai/archive/PROGRESS-LOG-[YYYYMMDD-HHMMSS].jsonl`

---

## Sesjon-sporing

JSONL har ingen separatorlinjer. En ny sesjon spores ved at hver event får `"session":"[sessionId]"`-feltet.

**SESSION-ID:** Generer kort UUID eller bruk session timestamp.

---

## Crash Recovery — Hvordan brukes loggen

**Ved krasj-deteksjon (session.status = "active"):**

1. **Les siste 10 linjer** i PROGRESS-LOG.jsonl (PRIMAERKILDE)
2. **Finn siste `event":"DONE"` eller `event":"START"`** — dette er siste kjente tilstand
3. **Les SESSION-HANDOFF.md** for kontekst og milepaler (backup)
4. **Ved uenighet:** PROGRESS-LOG er autoritativ (mer oppdatert)
5. **Estimer datatap:** Basert på tid siden siste `event":"DONE"` eller commit (`event":"FILE","op":"commit"`)

### Eksempel recovery-sekvens:

```
Les PROGRESS-LOG siste 10 linjer:
{"ts":"2026-02-11T14:32:00Z","event":"START","task":"MVP-05","desc":"BYGGER — Teste checkout-flow","schemaVersion":1}
{"ts":"2026-02-11T14:35:00Z","event":"FILE","op":"created","path":"src/components/Checkout.jsx","schemaVersion":1}
{"ts":"2026-02-11T14:50:00Z","event":"ERROR","desc":"Payment API timeout","fix":"Retry-logikk lagt til","schemaVersion":1}
{"ts":"2026-02-11T14:52:00Z","event":"FILE","op":"modified","path":"src/components/Checkout.jsx","schemaVersion":1}
{"ts":"2026-02-11T15:00:00Z","event":"START","task":"MVP-06","desc":"Full checkout testing","schemaVersion":1}
[SESSION STOPPED HERE]

-> KONKLUSJON: Checkout komponenten var under testing, men ikke committet
-> ANBEFALING: Test manuelt, deretter commit hvis OK
-> DATATAP: Minimal — max 15 minutter arbeid
```

---

## Regler for append

1. **Én JSON-event per linje** — ikke kombiner flere triggere på en linje
2. **Alltid ISO 8601 UTC med Z-suffix** — f.eks. `2026-02-09T10:00:00Z`
3. **Kort beskrivelse** — maks 1 setning per linje
4. **Filstier må være relative** — f.eks. `src/pages/login.jsx`, ikke fullstendige stier
5. **Ingen sletting eller overskriving** — append-only alltid
6. **Ingen emojis** — PROGRESS-LOG er maskinlesbar JSON

---

## Integrasjon med andre filer

| Fil | Forhold |
|-----|---------|
| `.ai/SESSION-HANDOFF.md` | Oppdateres mindre hyppig (per milepæl); PROGRESS-LOG er mer granulær |
| `.ai/PROJECT-STATE.json` | Strukturert tilstand; PROGRESS-LOG er mer detaljert timeline |
| `docs/FASE-X/` | Dokumentasjon for avgjørelser; PROGRESS-LOG logger når de ble gjort |

> **Merk:** Loggfilen heter `.ai/PROGRESS-LOG.jsonl` (JSONL fra v3.6.0).

---

## Tips for lesing av loggen

**Finn siste handling av type X:**
```bash
grep '"event":"DONE"' .ai/PROGRESS-LOG.jsonl | tail -5
```

**Finn alle feil i dag:**
```bash
grep '"event":"ERROR"' .ai/PROGRESS-LOG.jsonl
```

**Tell commits denne sesjonen:**
```bash
grep '"op":"commit"' .ai/PROGRESS-LOG.jsonl | wc -l
```

---

## Template ferdig

Denne malen er klar for bruk. For hver ny session:
1. Sett `"session":"[ID]"` på hver event (ingen separatorlinje i JSONL)
2. Append nye linjer i JSONL-format via progress-log-append.sh etter hver handling
3. Ved crash: Les siste 10 linjer først

---

> **Versjonshistorikk:** v1.0 brukte emoji-basert format (`⏳ STARTET`, `✅ FULLFORT`, etc.). Dette ble erstattet av logfmt i v2.0, deretter JSONL i v3.6.0. Eldre logger som bruker gammelt format skal migreres til JSONL via convert-progress-log-to-jsonl.py, ikke beholdes.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
