# Mønster-katalog — Kit CC v3.6.0

> Sjekklister for å fange detaljer og mikrodetaljer i planlegging.
> Les denne filen **før** du foreslår en funksjon. Finn relevante mønstre, bruk som utgangspunkt, tilpass alltid.
>
> Mønstre er ikke maler. De er sjekklister over hva du må ta stilling til.

---

## Slik bruker du mønstrene

1. **Identifiser**: Hvilke mønstre passer? Ofte flere samtidig (f.eks. "slett element i liste på mobil" = M:slett + M:liste + M:mobil-beroring + M:tilbakemelding + M:angre + M:tilgjengelighet).
2. **Gjennomgå sjekkliste**: For hvert relevant mønster, still spørsmålene punkt for punkt.
3. **Dokumentér**:
   - **Detaljer** (nivå 3) → D-IDer i `OPPGAVER.md` under underfunksjonen
   - **Mikrodetaljer** (nivå 4) → tabell i M-XXX-*.md seksjon 3.5, gruppert per mønster
4. **Eksperter aktiveres automatisk** via `protocol-DYNAMISK-AGENT-VALG.md` mønster-til-ekspert-mapping.

---

## Komplett liste (22 mønstre)

### Obligatoriske (sjekkes alltid)

| Mønster | Hva fanger det |
|---|---|
| ⭐ **M:tilstander** | Loading / empty / error / success / disabled / skeleton — NN/g #1 oversett UX-flate |
| ⭐ **M:tilgjengelighet** | WCAG 2.2 AA + de 9 nye 2.2-kriteriene (focus, drag, target, redundant, auth) |
| ⭐ **M:kanttilfeller** | Metamønster: null / tomt / maks / samtidig / permission / network — LLM-svakhet |

### Mobil-obligatoriske (når mobil-app)

| Mønster | Hva fanger det |
|---|---|
| **M:mobil-beroring** | Touch-target ≥24×24px (WCAG 2.5.8 minimum) / 44×44px (Apple HIG best-practice), gester, tastatur, haptikk |
| **M:offline** | Network-detection, queue-sync, sync-conflict |

### Datahandlinger (CRUD)

| Mønster | Hva fanger det |
|---|---|
| **M:slett** | Sletting med bekreftelse, kaskade, undo, audit, GDPR |
| **M:skjema** | Felt-input, validering, submit, redigering, mobil-utfordringer |
| **M:angre** | Reverser destruktive handlinger, tidsvindu, kaskade-effekter |
| **M:undo-first** | Foretrekk undo-toast over confirm-dialog (Gmail/Linear-mønster) |

### Vis/utforsk data

| Mønster | Hva fanger det |
|---|---|
| **M:liste** | Visning, sortering, paginering, virtualisering, handlinger per rad |
| **M:filter-sortering** | Filter-UI, lagring av valg, ytelse på store datasett |
| **M:flervalg** | Bulk-operasjoner, batch-bekreftelse, partiell-feil |
| **M:detaljvisning** | Drill-down i enkelt element, navigering, redigering |
| **M:inline-redigering** | Rediger direkte i liste uten side/modal |

### Interaksjons-overflater

| Mønster | Hva fanger det |
|---|---|
| **M:modal** | Popups med fokus-håndtering, tilgjengelighet, dismissing |
| **M:tilbakemelding** | Toasts, banners, lyd, timing |
| **M:laste-tom-feil** | Loading-visning, tom-tilstand, feil-meldinger med recovery |
| **M:feilhandtering** | Network/server/permission-feil, retry, fallback UX |

### Sikkerhet og samsvar

| Mønster | Hva fanger det |
|---|---|
| **M:tilgangsport** | Rolle-basert tilgang (RBAC), hva som vises, redirect ved 403 |
| **M:revisjonsspor** | Audit-log, GDPR Art. 30, hvem-hva-når, immutabilitet |

### Internasjonalisering og første-bruk

| Mønster | Hva fanger det |
|---|---|
| **M:internasjonalisering** | RTL, tekst-ekspansjon, datoformater, pluralisering, locale-detection |
| **M:onboarding** | Første-bruk, tom-domene, første-verdi-leveranse, skip-mulighet |

---

## Mønster-til-ekspert-trigger (forkortet)

Full tabell i `Kit CC/Agenter/agenter/system/protocol-DYNAMISK-AGENT-VALG.md`. Hovedmønstre:

- M:slett / M:angre / M:undo-first → **SIKKERHETS-agent** (datatap-risiko)
- M:tilgangsport → **OWASP-ekspert** + **RLS-TESTER-ekspert**
- M:revisjonsspor → **GDPR-ekspert** + **AI-GOVERNANCE-ekspert**
- M:tilstander / M:laste-tom-feil / M:kanttilfeller → **TEST-GENERATOR-ekspert**
- M:tilgjengelighet / M:mobil-beroring / M:internasjonalisering → **TILGJENGELIGHETS-ekspert** + **CROSS-BROWSER-ekspert**
- M:liste / M:filter-sortering / M:offline → **YTELSE-ekspert**
- M:modal / M:detaljvisning / M:inline-redigering / M:tilbakemelding / M:onboarding → **UIUX-ekspert**

---

## Mønster-versjons-historikk

- **v1.0 (2026-05-13)**: 22 mønstre etablert som del av Kit CC v3.6.0
  - 15 originale fra Kit CC Planner Skill v4.0
  - 7 nye fra forskning: M:tilstander, M:feilhandtering, M:undo-first, M:onboarding, M:internasjonalisering, M:offline, M:kanttilfeller

## Vedlikehold

- Hver mønster har egen versjon i frontmatter (`version: 1.0`)
- Endring av mønster → versjon-bump + oppdater `last_reviewed`
- Validering: kjør `bash Kit CC/Agenter/scripts/test-monstre-struktur.sh`
- Når nytt mønster legges til: oppdater denne katalogen + protocol-DYNAMISK-AGENT-VALG.md

---

## Kilder

- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- NN/g Empty States: https://www.nngroup.com/articles/empty-state-interface-design/
- Carbon Design System Patterns: https://carbondesignsystem.com/patterns/about-patterns/
- Material 3: https://m3.material.io/
- Atlassian Design Patterns: https://atlassian.design/patterns
- Checklist Manifesto (Atul Gawande)
- arXiv 2406.07021 — LLM Test Case Generation (grunnlag for M:kanttilfeller)

---

**v1.0** — 2026-05-13 — Initial katalog for 22 mønstre

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
