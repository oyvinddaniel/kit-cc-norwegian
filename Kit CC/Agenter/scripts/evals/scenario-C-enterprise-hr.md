# Scenario C — Enterprise HR-portal

## Brukerprofil
- Erfaren utvikler
- Bygger internt enterprise-system
- HR-data (sensitiv), 500+ ansatte
- Tid: flere dager planlegging

## Brukerens initial-melding

"Vi trenger et internt HR-system for 500 ansatte. Det skal håndtere personalia, lønn, fravær, prestasjons-vurderinger, og sertifiseringer. Skal integreres med vår eksisterende ERP. Audit-krav: alle endringer skal logges. GDPR-krav: data må kunne slettes etter ansatt slutter."

## Klassifisering forventet
ENTERPRISE (24-28)

## Tidsmodus forventet
"Flere dager" eller "Ukesvis"

## KPI-mål

| KPI | Mål |
|---|---|
| Hovedfunksjoner | 10-20 |
| Underfunksjoner | 50-100 |
| Detaljer | 150-300 |
| Mikrodetaljer | 1000-2000 totalt |
| Obligatoriske mønstre dekket | 100% |
| GDPR-coverage | Full (alle data-handlinger har M:revisjonsspor) |
| M:tilgangsport-coverage | Full (rolle-basert tilgang per ressurs) |
| VALIDERING-karakter | A (kritisk system, høyere standard) |
| Self-consistency-runs (REVIEW) | 3 plan-varianter per kritisk node |
| Time-to-plan-completion | 2-5 dager |

## Spesielle sjekker

- **Audit-trail for ALLE endringer** (M:revisjonsspor på alt)
- **M:tilgangsport** med RBAC + ressursbeskyttelse (HR vs leder vs ansatt vs admin)
- **GDPR-sletting med kaskade-effekter** (M:kanttilfeller — hva med refererte data?)
- **M:feilhandtering** for ERP-integrasjon (downtime, partial sync, retry)
- **M:tilstander** for store data-tabeller (paginering, virtualization)
- **M:tilgjengelighet** WCAG 2.2 AAA hvis offentlig sektor
- **M:internasjonalisering** hvis multinasjonalt selskap

## Hvordan kjøre

Realistisk: dette tar flere sesjoner. Mål delvise resultater per økt:
- Sesjon 1: hovedfunksjoner + underfunksjoner (~2 timer)
- Sesjon 2: detaljer + arkitektur-spørsmål (~3 timer)
- Sesjon 3: mikrodetaljer for første 5 moduler (~4 timer)
- Sesjon 4-N: fortsette mikrodetaljer + REVIEW

Kjør REVIEW etter hver sesjon. Karakter må forbedres over tid.

## Suksess-signaler

- Plan dekker compliance, audit, GDPR, RBAC, integrasjoner
- Hver kritisk modul har 30+ mikrodetaljer
- REVIEW karakter A etter komplett planlegging
- ITERASJONS-agent (Fase 5) finner ingen "ufullstendige moduler"
- Self-consistency genererer 3 varianter for kritiske moduler

## Feil-signaler

- GDPR-kompleksitet underspesifisert
- M:revisjonsspor mangler i kritiske moduler
- Edge cases for samtidighet ikke håndtert
- Plan er <500 mikrodetaljer (langt under mål)
- Auto-trigger REVIEW på PHASE-GATES fungerer ikke

## Spesifikke mikrodetaljer å verifisere

For "Slett ansatt-data" (GDPR sletting):
- Cascade: lønn-historikk, fravær, vurderinger — slett eller anonymisér?
- 30-dagers angre-vindu (lovkrav)
- Logg slettingen (paradoks: vi sletter data men logger handlingen)
- Hvem kan utløse: ansatt selv (recht på sletting), HR-admin
- Verifisering: 2FA før eksekvering
- M:revisjonsspor + M:tilgangsport + M:angre + M:kanttilfeller

For "ERP-integrasjon-fail":
- Hva hvis ERP returnerer 503 midt i lønn-import? (M:feilhandtering)
- Partial sync håndtering (idempotency)
- Retry-strategi med backoff
- Manuelt override hvis automatisk feiler

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
