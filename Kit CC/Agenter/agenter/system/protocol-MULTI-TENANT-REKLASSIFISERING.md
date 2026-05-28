# protocol-MULTI-TENANT-REKLASSIFISERING v1.0

> Automatisk intensitetsoppgradering når multi-tenant-signaler oppdages

**Kritiske regler:** Multi-tenant-deteksjon sjekkes ved ALLE faseoverganger. Oppgradering krever alltid bruker-bekreftelse. Degradering av intensitet er aldri tillatt.

---

## HENSIKT

Tenk på det som: en brannalarm som aktiveres automatisk — du trenger ikke vite at du trenger den, den slår seg på når signalene er der.

Oppdager multi-tenant-signaler under prosjektets levetid og oppgraderer intensitetsnivået automatisk. Forhindrer at prosjekter som starter som "intern app" (FORENKLET) men vokser til kundevendte SaaS mangler kritisk sikkerhet.

---

## SIGNAL-DETEKTORER

Sjekk disse signalene ved hver faseovergang:

### Strukturelle signaler (kode)
- `tenant_id`-kolonne finnes i databasen
- WHERE-filtre bruker `auth.uid()` eller `organization_id`
- RLS-policyer refererer til `auth.users`
- Organizations/Tenants-tabell eksisterer

### Intensjonssignaler (brukersamtale)
- "vi selger til bedrifter", "per kunde", "isolerte data", "multi-tenant"
- "betalende kunder", "enterprise", "SaaS"
- "hvert firma skal ha sin egen plass"

### Arkitektursignaler
- Stripe Customers-tabell med flere organisasjoner
- Rolle-hierarki (owner, admin, member per tenant)
- Subdomain-routing per tenant (firma.app.no)

---

## OPPGRADERING

Hvis 2+ signaler oppdages:

1. Si tydelig: "Jeg ser multi-tenant-mønstre i prosjektet. Intensitetsnivå bør oppgraderes fra [NÅVÆRENDE] til [ANBEFALT]."
2. Vis hvilke signaler som ble funnet
3. Anbefal nytt intensitetsnivå:
   - FORENKLET → STANDARD (2-3 signaler)
   - STANDARD → GRUNDIG (3+ signaler + faktiske kundedata)
4. Vent på bruker-bekreftelse
5. Kjør AUTO-CLASSIFIER på nytt med ny intensitet
6. Aktiver profesjonell pakke (K1, K2, K3, V2 er spesielt kritiske for multi-tenant)

---

## FEW-SHOT: OPPGRADERINGS-RAPPORT

```
[N1] Multi-tenant-deteksjon
Faseovergang: Fase 2 → Fase 3

Signaler oppdaget (3/3):
1. tenant_id-kolonne funnet i organizations-tabellen (strukturell)
2. "vi selger til bedrifter" nevnt i Fase 2 (intensjon)
3. Organizations-tabell eksisterer (arkitektur)

Anbefaling: Oppgrader fra FORENKLET til STANDARD

Spesielt viktige komponenter for dette prosjektet:
- K1 (RLS-TESTER): Verifiser at brukere ikke ser andre tenanter sine data
- V2 (PII-SANITERING): Bedriftsdata er sensitiv
- K3 (SCHEMA-MIGRASJON): Migrasjon til multi-tenant krever expand-contract

Vil du oppgradere? (ja/nei)
```

---

## AUTOMATISK OPPGRADERING

For åpenbare multi-tenant-apper (3+ signaler + tenant_id-kolonne bekreftet):

Logg: `[N1] Multi-tenant oppdaget — anbefaler intensitetsoppgradering til [NIVÅ]`

Selv ved automatisk oppdagelse kreves bruker-bekreftelse FØR oppgradering gjennomføres.

---

## GUARDRAILS

### Gjør alltid
- Sjekk signaler ved HVER faseovergang
- Logg detekterte signaler i PROGRESS-LOG
- Vis konkrete signaler (ikke bare "multi-tenant oppdaget")

### Ikke gjør
- Degrader intensitet — kun oppgradering er tillatt
- Hopp over bruker-bekreftelse ved oppgradering

### Stopp og spør
- Alltid ved foreslått oppgradering — bruker må bekrefte

---

## KRITISKE REGLER (gjentas)

Multi-tenant-deteksjon sjekkes ved ALLE faseoverganger. Oppgradering krever alltid bruker-bekreftelse. Degradering av intensitet er aldri tillatt.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
