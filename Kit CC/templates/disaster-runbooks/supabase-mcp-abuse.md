# Runbook: MCP-server kompromittert

## Basert på
Supabase MCP-incident, mars 2025 — Ondsinnet MCP-server injiserte instruksjoner i AI-agent og eskalerte til databaseoperasjoner og data-lekkasje.

## Symptomer
- Uventede databaseoperasjoner (INSERT, UPDATE, DELETE) uten bruker-initiering
- MCP-audit-logg viser kall til ukjente verktøy
- Sentry fanger uventede data-mutations
- S7 (MCP-GATEWAY-GUARD) varsler om schema-endring siden snapshot

## Detekterings-steg
1. Sjekk `.claude/mcp-audit.log` for mistenkelige kall
2. Sjekk `.claude/mcp-snapshot.json` mot nåværende MCP-schema for endringer
3. Sjekk database-logg for operasjoner uten kjent årsak
4. Sjekk hvilke MCP-servere som er konfigurert i `.mcp.json`

## Akutt-respons (første 15 minutter)
1. Deaktiver alle MCP-servere umiddelbart (fjern fra `.mcp.json` eller stopp prosessen)
2. Rull tilbake alle uautoriserte databaseendringer via Supabase PITR
3. Bytt alle API-nøkler som MCP-serveren hadde tilgang til
4. Post til #ops-critical med status

## Etterforskning
1. Gå gjennom MCP-audit-loggen for å rekonstruere hendelsesforløpet
2. Identifiser hvilken MCP-server som var kompromittert
3. Sjekk om MCP-serveren er en tredjeparts-tjeneste — kontakt leverandøren
4. Dokumenter alle endringer for post-mortem

## Langsiktig forebygging
- S7 (MCP-GATEWAY-GUARD): Schema-snapshot verifiseres ved hvert kall
- S11 (PROMPT-INJECTION-DEFENSE): Ekstern data merkes som informasjon, ikke instruksjon
- Kvartalsvis verktøy-audit: Fjern ubrukte MCP-servere

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
