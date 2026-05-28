# protocol-MCP-GATEWAY-GUARD v1.0

> Sentralisert overvåking av MCP-server-interaksjoner med schema-snapshot-verifisering

**Kritiske regler:** Schema-snapshot tas ved oppstart. Endringer siden forrige snapshot krever bruker-bekreftelse. Aldri hardkod server-navn — les fra .mcp.json.

---

## HENSIKT

Tenk på det som: en resepsjonist som sjekker ID-en til alle leverandører — ikke fordi de er mistenkelige, men fordi du vet hvem som kom inn.

MCPTox-benchmark: 72,8% attack success via tool poisoning på frontier-modeller. Supabase MCP-incident mars 2025 viste eskalering fra tool poisoning til data-lekkasje. Protokollen er generisk og leser konfigurerte MCP-servere fra prosjektets `.mcp.json`.

---

## OPPSTART

1. Les `.mcp.json` for listen over konfigurerte MCP-servere
2. For hver server: hent tool-definisjoner og beregn schema-hash
3. Lagre snapshot i `.claude/mcp-snapshot.json`:

```json
{
  "timestamp": "2026-04-19T08:00:00Z",
  "servers": {
    "supabase": {
      "toolCount": 12,
      "schemaHash": "sha256:abc123...",
      "tools": ["query", "insert", "update", "delete"]
    }
  }
}
```

---

## VED HVERT TOOL-KALL

Sjekk:
1. Tool-navn finnes i snapshot → ✓ fortsett normalt
2. Tool-navn er nytt siden snapshot → ⚠️ varsle bruker
3. Tool-schema endret → ⚠️ rug-pull-advarsel

```
MCP-GATEWAY-ADVARSEL

Server: supabase
Endring: Nytt verktøy oppdaget siden sesjonstart
Verktøy: "execute_raw_sql" (var ikke i snapshot)

Mulig årsak: Server er oppdatert (normalt) eller kompromittert (sjeldent).

Vil du tillate bruk av dette verktøyet? (ja/nei)
```

---

## RATE-LIMITING

Maks 10 tool-kall per minutt per MCP-server. Logg alle kall i `.claude/mcp-audit.log`:

```
[2026-04-19T14:30:00Z] MCP-CALL server=supabase tool=query status=OK
[2026-04-19T14:30:05Z] MCP-CALL server=supabase tool=insert status=OK
[2026-04-19T14:30:10Z] MCP-CALL server=supabase tool=execute_raw_sql status=BLOCKED (schema-endring)
```

---

## FEW-SHOT: SCHEMA-SNAPSHOT-VERIFISERING

```
MCP-GATEWAY — Sesjonstart

Leser .mcp.json... 2 servere funnet:
- supabase: 12 verktøy (hash: abc123)
- notion: 8 verktøy (hash: def456)

Snapshot lagret i .claude/mcp-snapshot.json
Rate-limiting: maks 10 kall/minutt per server

[MCP-GATEWAY] Klar. Alle kall overvåkes.
```

---

## GUARDRAILS

### Gjør alltid
- Ta schema-snapshot ved sesjonstart
- Varsle ved uventede schema-endringer
- Logg alle kall i mcp-audit.log

### Ikke gjør
- Hardkode server-navn — les fra .mcp.json
- Ignorer schema-endringer — selv ved "normale" oppdateringer
- La rate-limit overstyres uten bruker-godkjenning

### Stopp og spør
- Alltid ved schema-endring — bruker bestemmer om det er trygt

---

## KRITISKE REGLER (gjentas)

Schema-snapshot tas ved oppstart. Endringer siden forrige snapshot krever bruker-bekreftelse. Aldri hardkod server-navn — les fra .mcp.json.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
