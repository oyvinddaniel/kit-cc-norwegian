# protocol-PROFESJONELL-PAKKE v1.0

> Aktiveringsprotokoll for Kit CC profesjonell pakke — leses av ORCHESTRATOR ved oppstart på STANDARD+

**Kritiske regler:** Pakken aktiveres bare for STANDARD+. SESSION-HANDOFF oppdateres automatisk ved sesjonavslutning med pakke-status. Eksperter kaller aldri hverandre direkte — kun via ORCHESTRATOR.

---

## FORMÅL

Profesjonell pakke aktiverer 30 spesialiserte komponenter for kundevendte apper med sensitiv data. Den aktiveres automatisk når `classification.intensityLevel` er `standard`, `grundig` eller `enterprise`.

Tenk på det som: strømbryteren som slår på alle sikkerhets- og overvåkingssystemene i en kommersiell bygning — hobbyprosjekter trenger dem ikke, men når du har betalende kunder gjør du det.

---

## AKTIVERING

Leses av ORCHESTRATOR i boot-sekvensen. Gjelder fra intensitetsnivå STANDARD og opp.

Si tydelig ved aktivering: "Profesjonell pakke v3 er aktiv. [N] komponenter konfigurert for dette prosjektet."

Sjekk ved oppstart:
1. Les `classification.intensityLevel` fra PROJECT-STATE.json
2. Hvis `standard`, `grundig` eller `enterprise`: aktiver pakken
3. Oppdater `professionalPackage.enabled = true` og `activatedAt` i PROJECT-STATE.json
4. Logg i PROGRESS-LOG: `[PAKKE] Profesjonell pakke v3 aktivert — [N] komponenter aktive`

---

## AKTIVERINGSMATRISE

| ID | Komponent | STANDARD | GRUNDIG | ENTERPRISE |
|----|-----------|----------|---------|------------|
| B1 | protocol-PROFESJONELL-PAKKE (denne) | AKTIV | AKTIV | AKTIV |
| K1 | RLS-TESTER-ekspert | MÅ (multi-tenant) | MÅ | MÅ |
| K2 | FEATURE-FLAGS-ekspert | MÅ | MÅ | MÅ |
| K3 | SCHEMA-MIGRASJON-ekspert | MÅ | MÅ | MÅ |
| K4 | hooks-library | MÅ | MÅ | MÅ |
| K5 | protocol-CLAUDE-CODE-HOOKS | MÅ | MÅ | MÅ |
| V1 | protocol-AI-COST-ALERTS | MÅ | MÅ | MÅ |
| V2 | protocol-PII-SANITERING | MÅ | MÅ | MÅ |
| V3 | protocol-SLACK-ALERT-STRUKTUR | BØR | MÅ | MÅ |
| V4 | templates/incident-communication | MÅ | MÅ | MÅ |
| V5 | extension-STATUS-PAGE-SETUP | MÅ | MÅ | MÅ |
| V6 | extension-GITHUB-BRANCH-PROTECTION | MÅ | MÅ | MÅ |
| P1 | extension-GIT-FLOW-VIBECODER | BØR | BØR | BØR |
| P2 | extension-STAGING-8-STEG | BØR | MÅ | MÅ |
| P3 | protocol-KEY-MANAGEMENT | MÅ | MÅ | MÅ |
| N1 | protocol-MULTI-TENANT-REKLASSIFISERING | AKTIV | AKTIV | AKTIV |
| N2 | BROWNFIELD-MULTI-TENANT-AUDITOR (sub-agent A24 i `agent-BROWNFIELD-SCANNER.md`) | MÅ | MÅ | MÅ |
| N3 | Monitor-utvidelse | MÅ | MÅ | MÅ |
| S1 | HALLUSINASJON-DETEKTOR-ekspert | MÅ | MÅ | MÅ |
| S2 | protocol-MANDATORY-RUNTIME-VERIFICATION | MÅ | MÅ | MÅ |
| S3 | protocol-KONTEKSTBUDSJETT (utv.) | MÅ | MÅ | MÅ |
| S4 | protocol-REFINEMENT-CAP | MÅ | MÅ | MÅ |
| S5 | protocol-DRIFT-DETECTOR | BØR | MÅ | MÅ |
| S6 | protocol-MEMORY-HARDENING | MÅ | MÅ | MÅ |
| S7 | protocol-MCP-GATEWAY-GUARD | MÅ | MÅ | MÅ |
| S8 | protocol-COMPREHENSION-GATE | BØR | MÅ | MÅ |
| S9 | YTELSE-ekspert (utv.) | BØR | MÅ | MÅ |
| S10 | CODE-QUALITY-GATE-ekspert (utv.) | MÅ | MÅ | MÅ |
| S11 | protocol-PROMPT-INJECTION-DEFENSE | MÅ | MÅ | MÅ |
| S12 | templates/disaster-runbooks | BØR | MÅ | MÅ |

---

## FEW-SHOT: AKTIVERINGSLOGG

```
[PAKKE] Profesjonell pakke v3 aktivert — 2026-04-19T08:00:00Z
Intensitet: standard
Komponenter aktive (22 MÅ):
  K2, K3, K4, K5, V1, V2, V4, V5, V6, P3, N1, N2, N3, S1, S2, S3, S4, S6, S7, S10, S11
Komponenter BØR (7 — aktiveres med mindre skip):
  K1 (multi-tenant-check), V3, P1, P2, S5, S8, S9, S12
```

---

## GJENTA VED FASEOVERGANGER

Sjekk ved hver faseovergang at pakken fortsatt er aktiv. Hvis prosjektet har fått en reklassifisering (N1) som øker intensiteten, aktiver eventuelle nye pakke-komponenter og oppdater `professionalPackage.components` i PROJECT-STATE.json.

---

## GUARDRAILS

### Gjør alltid
- Sjekk intensitetsnivå FØR du leser pakke-komponentene
- Logg pakke-aktivering i PROGRESS-LOG
- Oppdater PROJECT-STATE.json atomisk

### Ikke gjør
- Aktiver pakken for MINIMAL eller FORENKLET prosjekter
- La eksperter kalle hverandre direkte (kun via ORCHESTRATOR)
- Fjern en MÅ-komponent uten eksplisitt bruker-godkjenning

### Stopp og spør
- Hvis bruker eksplisitt ber om å deaktivere en MÅ-komponent

---

## KRITISKE REGLER (gjentas)

Pakken aktiveres bare for STANDARD+. SESSION-HANDOFF oppdateres automatisk ved sesjonavslutning med pakke-status. Eksperter kaller aldri hverandre direkte — kun via ORCHESTRATOR.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
