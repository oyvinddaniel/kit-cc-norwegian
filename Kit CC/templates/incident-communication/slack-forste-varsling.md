# Slack — Første varsling

**Kanal:** #[proj]-errors + #ops-critical
**Tidsfrist:** Innen 15 minutter etter deteksjon

---

```
🔴 INCIDENT — {{TIDSPUNKT}}

Hva skjer: {{KORT_BESKRIVELSE}}
Påvirket: {{HVA_ER_NEDE}}
Bruker-impact: {{HVOR_MANGE_PÅVIRKET}}
Status: Under etterforskning

Neste oppdatering: Om 30 minutter eller ved statusendring.
Ansvarlig: {{NAVN}}
Runbook: {{LINK_TIL_RUNBOOK}}
```

---

## Veiledning

- Send FØR du vet årsaken — "under etterforskning" er bedre enn ingen varsling
- {{TIDSPUNKT}} = tidspunkt for hendelsen (ikke når du sender meldingen)
- {{HVOR_MANGE_PÅVIRKET}} kan være "alle brukere", "~150 brukere/t", "ukjent"

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
