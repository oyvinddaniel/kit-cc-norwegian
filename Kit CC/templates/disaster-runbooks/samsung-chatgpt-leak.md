# Runbook: Sensitiv data sendt til AI-tjeneste

## Basert på
Samsung-incident, mars 2023 — Samsung-ingeniører sendte konfidensiell kildekode og møtereferater til ChatGPT for hjelp med debugging. Dataene ble en del av OpenAIs treningsdata.

## Symptomer
- Konfidensiell kode, forretningsdata eller personopplysninger er sendt til tredjeparts AI-tjeneste
- Brukere eller ansatte rapporterer at sensitiv data ble lim inn i chatbot
- Sikkerhetsgjennomgang avdekker at AI-kall inneholder rå brukerdata

## Detekterings-steg
1. Sjekk logg over AI-API-kall for sensitiv data i payload
2. Gjennomgå kode som kaller Anthropic/OpenAI API — hva sendes i `content`?
3. Sjekk om PII-sanitering (V2) er implementert i beforeSend-hooks
4. Intervju team-medlemmer om eventuelle manuelle copy-paste til AI-chat

## Akutt-respons (første 15 minutter)
1. Varsle DPO (Data Protection Officer) og juridisk avdeling umiddelbart
2. Dokumenter nøyaktig hvilken data som ble sendt og til hvilken tjeneste
3. Kontakt AI-tjenesteleverandøren for å undersøke om data kan slettes
4. Vurder GDPR-varsling til Datatilsynet innen 72 timer (Art. 33)
5. Post til #ops-critical med status (internt — ikke offentlig)

## GDPR-vurdering
- Ble personopplysninger sendt? → 72-timers varslingsfrist til Datatilsynet
- Ble helsedata, bankdata eller barns data sendt? → Straks-varsling
- Kontakt Datatilsynet: https://www.datatilsynet.no/

## Langsiktig forebygging
- V2 (PII-SANITERING): Implementer beforeSend-hooks FØR første deploy
- S11 (PROMPT-INJECTION-DEFENSE): Ekstern data isoleres fra sensitiv kontekst
- S6 (MEMORY-HARDENING): Ekstern data krever godkjenning FØR den oppdaterer agent-kontekst
- Ansatte-opplæring: "Aldri lim inn konfidensiell data i offentlige AI-verktøy"

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
