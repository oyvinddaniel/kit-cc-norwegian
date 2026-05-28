# protocol-PROGRESS-LOG.md — Handlingslogg-protokoll

> **SSOT for PROGRESS-LOG format og triggere.** Referert fra CLAUDE.md og alle prosess-agenter.
> Versjon: 2.0.0 | Opprettet: 2026-02-23 | Oppdatert: 2026-05-13 (JSONL-format)

---

## FORMÅL

`.ai/PROGRESS-LOG.jsonl` er en append-only handlingslogg som gjør Kit CC **memory-independent**. Agenter trenger ikke å huske hva som ble gjort — neste sesjon leser loggen og fortsetter nøyaktig der forrige sluttet.

**Kjerneprinsipp:** Logging er en del av arbeidsflyten, ikke noe agenten må huske å gjøre separat. Tenk på PROGRESS-LOG som auto-save i et spill — du lagrer etter hvert fullført mål, aldri etter 2 timer.

---

## FORMAT: JSONL (JSON Lines)

Alle entries bruker JSONL-format — én JSON-event per linje. Dette gir atomær append på POSIX-systemer (hvis linjen er < PIPE_BUF, typisk 4KB), og er trivielt å parse og replay.

**Format-spesifikasjon:**
```json
{"ts":"YYYY-MM-DDTHH:MM:SSZ","event":"TYPE","op":"OPNAME","path":"PATH","desc":"DESC","schemaVersion":1}
```

**Regler:**
- **Én JSON-event per linje** — ingen pretty-print, ingen embedded newlines
- **UTF-8 encoding** — alle tegn tillatt unntatt litterale newlines i strings (bruk `\n` for escape)
- **Max 4KB per linje** (typisk <500B). Større events må splittes eller refereres til ekstern fil
- **`schemaVersion` er obligatorisk** for forward-kompat — sett til `1` for nåværende skjema
- **`ts` er ISO 8601 UTC** med Z-suffix (ikke offset) — `2026-05-13T17:45:00Z`
- **Ingen emojis** i log-filen — ren maskinlesbar JSON

### Standard event-typer

| Event | Bruk |
|-------|------|
| `FILE` | Fil opprettet/endret/slettet |
| `MODULE` | Modul opprettet/oppdatert/slettet |
| `DECISION` | Brukerbeslutning eller arkitekturvalg logget |
| `ERROR` | Feil oppstått (med type fra `ERROR-CODE-REGISTRY.md`) |
| `STATE_CHANGE` | PROJECT-STATE.json oppdatert |
| `GATE` | Phase gate passert/feilet |
| `PHASE` | Fase-overgang |
| `INTENT` | Brukerintensjon detektert |
| `REVIEW` | Review utført (kvalitet, sikkerhet, etc.) |
| `SESSION_PAUSED` | Sesjon avbrutt med vilje (recovery-anker) |
| `EXPERT_TRIGGERED` | Ekspertagent aktivert |
| `REVIEW_CONSISTENCY` | Konsistens-sjekk utført |
| `REVIEW_USER_DECISION` | Bruker bekreftet/avviste review-funn |
| `START` | Modus startet (PLAN/BRAINSTORM/STATUS/REVIEW) — med `modus:` felt |
| `DONE` | Modus fullført — med `modus:` felt |
| `MODUS_TRANSITION` | Modus skiftet midt i økt — `fra:`/`til:` felter |
| `PLAN_TIDSMODUS_SATT` | Bruker valgte tidsmodus i PLAN-modus |
| `BRAINSTORM_NOTAT` | BRAINSTORM-idé fanget (ingen automatisk lagring) |
| `STATUS_VIST` | STATUS-snapshot vist til bruker |
| `MIKRODETALJER_KOMPLETT` | Mikrodetalj-coverage fylt for en underfunksjon |
| `REVIEW_KOMPLETT` | REVIEW-modus produserte VALIDERING.md med karakter |
| `GATE_OVERRIDE` | Bruker overstyrte gate-blokkering eksplisitt |

### Eksempler

```jsonl
{"ts":"2026-05-13T17:45:00Z","event":"INTENT","detected":"PLAN","confidence":0.92,"trigger":"jeg vil planlegge","modus_aktivert":true,"schemaVersion":1}
{"ts":"2026-05-13T17:46:00Z","event":"MODULE","op":"created","id":"M-007","name":"Eksport","status":"Pending","schemaVersion":1}
{"ts":"2026-05-13T17:47:00Z","event":"DECISION","id":"B015","title":"Bruk PostgreSQL","reason":"Bedre JSON-støtte enn MySQL","schemaVersion":1}
{"ts":"2026-05-13T17:48:00Z","event":"FILE","op":"created","path":"src/pages/login.tsx","desc":"Login-komponent","schemaVersion":1}
```

---

## ATOMÆR APPEND VIA progress-log-append.sh

For å garantere atomær append (og validere JSON før skriving), bruk hjelpescriptet:

```bash
bash Kit\ CC/Agenter/scripts/progress-log-append.sh \
  ".ai/PROGRESS-LOG.jsonl" \
  '{"ts":"2026-05-13T17:45:00Z","event":"INTENT","detected":"PLAN","schemaVersion":1}'
```

Scriptet:
1. Validerer at argumentet er gyldig JSON (via `jq` eller `python3`)
2. Advarer hvis linjen er > 4KB (atomicitet ikke garantert)
3. Sørger for at log-filen finnes
4. Appender med én write-syscall (atomært på POSIX < PIPE_BUF)

**Aldri** skriv direkte til `.ai/PROGRESS-LOG.jsonl` med multi-line tekst eller manuelle redigeringer — det bryter append-only-garantien og kan korrumpere JSONL-parsing.

---

## EKSPLISITTE TRIGGERE

Append én JSON-event til `.ai/PROGRESS-LOG.jsonl` **ETTER HVER av disse hendelsene:**

| # | Trigger | Event-skjelett |
|---|---------|----------------|
| 1 | FØR oppstart av ny oppgave | `{"ts":"...","event":"INTENT","task":"[oppgave-ID]","session":"[sessionId]","desc":"...","schemaVersion":1}` |
| 2 | Etter HVER ny/endret fil | `{"ts":"...","event":"FILE","op":"created\|modified","path":"...","desc":"...","schemaVersion":1}` |
| 3 | Etter HVER git commit | `{"ts":"...","event":"FILE","op":"commit","msg":"...","schemaVersion":1}` |
| 4 | Etter HVER fullført oppgave | `{"ts":"...","event":"STATE_CHANGE","task":"[oppgave-ID]","output":"...","schemaVersion":1}` |
| 5 | Etter HVER brukerbeslutning | `{"ts":"...","event":"DECISION","what":"...","reason":"...","schemaVersion":1}` |
| 6 | Ved feil | `{"ts":"...","event":"ERROR","type":"[state\|planning\|execution\|...]","desc":"...","fix":"...","schemaVersion":1}` (`type` fra `ERROR-CODE-REGISTRY.md` v2.0) |
| 7 | Ved kontekstbudsjett | `{"ts":"...","event":"STATE_CHANGE","subtype":"CONTEXT_BUDGET","files":N,"messages":N,"schemaVersion":1}` |
| 8 | Ved gjenoppretting | `{"ts":"...","event":"STATE_CHANGE","subtype":"RECOVERY","action":"...","reason":"...","schemaVersion":1}` |
| 9 | Ved modusbytte | `{"ts":"...","event":"STATE_CHANGE","subtype":"MODE_CHANGE","from":"...","to":"...","schemaVersion":1}` |
| 10 | Ved automatisk feilretting | `{"ts":"...","event":"ERROR","subtype":"AUTOFIX","errors_found":N,"fixed":N,"schemaVersion":1}` |
| 11 | Ved sesjonspause | `{"ts":"...","event":"SESSION_PAUSED","last_complete_level":N,"last_module":"M-XXX","reason":"...","schemaVersion":1}` |
| 12 | Ved ekspertaktivering | `{"ts":"...","event":"EXPERT_TRIGGERED","expert":"...","reason":"...","schemaVersion":1}` |

**Merk:**
- `session`-felt inkluderes KUN i `INTENT`-events (for sesjon-korrelering)
- **IKKE oppdater for:** Lesing av filer, spørsmål til bruker, intern koordinering

---

## ARBEIDSSYKLUS MED INNEBYGD LOGGING

```
For HVER oppgave:
  1. Append PROGRESS-LOG (via progress-log-append.sh):
     {"ts":"...","event":"INTENT","task":"[id]","session":"[sessionId]","desc":"...","schemaVersion":1}
  2. Utfør oppgaven (kode, filer, etc.)
  3. Git commit med beskrivende melding
  4. Append PROGRESS-LOG:
     {"ts":"...","event":"FILE","op":"commit","msg":"...","schemaVersion":1}
     {"ts":"...","event":"STATE_CHANGE","task":"[id]","output":"...","schemaVersion":1}
  5. Etter 3 fullførte oppgaver → oppdater PROJECT-STATE.json
  6. Neste oppgave
```

---

## FORHOLD MELLOM LOGGFILER

| Fil | Frekvens | Kostnad | Formål |
|-----|----------|---------|--------|
| `PROGRESS-LOG.jsonl` | Etter HVER handling | Lav (1 atomisk append) | Minutt-for-minutt historikk |
| `PROJECT-STATE.json` | Etter 3 oppgaver / sesjonsslutt | Høy (les+skriv JSON med optimistic lock) | Strukturert tilstand |
| `SESSION-HANDOFF.md` | Ved milepæler / sesjonsslutt | Medium | Fase-overføring |

**Prioritetsrekkefølge ved uenighet:** PROGRESS-LOG > SESSION-HANDOFF > PROJECT-STATE

---

## MIGRERING FRA .md TIL .jsonl

Eldre prosjekter har `.ai/PROGRESS-LOG.md` i logfmt-format. Migrer slik:

```bash
python3 "Kit CC/Agenter/scripts/convert-progress-log-to-jsonl.py" \
  ".ai/PROGRESS-LOG.md" \
  ".ai/PROGRESS-LOG.jsonl"

# Verifiser
wc -l ".ai/PROGRESS-LOG.jsonl"
cat ".ai/PROGRESS-LOG.jsonl" | while read line; do echo "$line" | jq . >/dev/null; done && echo "OK: gyldig JSONL"
```

**Etter migrering:**
- Behold `.ai/PROGRESS-LOG.md` som backup inntil JSONL er verifisert (anbefalt: arkiver til `.ai/_archive/`)
- Alle nye agenter skriver KUN til `.ai/PROGRESS-LOG.jsonl`
- Linjer som ikke kunne parses lagres som `{"event":"RAW","raw":"...","schemaVersion":1}` — gjennomgå manuelt om noe må gjenoppdages

**Hvorfor migrere:** Logfmt med tekstuell tidsstempling (`ts=HH:MM`) mister datokontekst og er ikke trivielt å parse maskinelt. JSONL har stabilt skjema, atomær append, og lar oss replay state ved crash recovery.

---

## EMOJI-REGEL

- Emojis brukes KUN i brukervendt output (f.eks. "Vis status"-kommandoer, velkomstsvar, pausemeldinger)
- PROGRESS-LOG.jsonl bruker ALLTID ren JSON uten emojis
- Samme gjelder PROJECT-STATE.json og SESSION-HANDOFF.md — disse er maskinlesbare data-filer

---

## KONTEKSTBUDSJETT-INTEGRASJON

PROGRESS-LOG er primærkilde for kontekstbudsjett-deteksjon:
- Ved boot sjekkes siste 10 linjer for `"event":"STATE_CHANGE","subtype":"CONTEXT_BUDGET"`
- Hvis funnet → kontekstbudsjett-pause (ikke krasj)
- Fullstendig kontekstbudsjett-protokoll: se `protocol-KONTEKSTBUDSJETT.md`

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
