# protocol-PII-SANITERING v1.0

> Definerer universal scrubbing-liste og implementering av PII-rensing i Sentry og PostHog

**Kritiske regler:** PII-sanitering implementeres FØR første produksjonsdeploy. Ingen event sendes til tredjeparts analytikk- eller feilsporingstjenester uten at beforeSend-hook er på plass.

---

## HENSIKT

Sikrer at personverndata (PII) aldri lekker til feilsporings- eller analytikktjenester. Viktig for GDPR-etterlevelse og tillitsbygging hos betalende kunder.

Tenk på det som: en postsorteringsmaskin som fjerner konfidensielle brev FØR de havner i et felles lager.

---

## UNIVERSAL SCRUBBING-LISTE

Disse feltnavnene scrubbes alltid, uansett prosjekt:

```typescript
const UNIVERSAL_PII_FIELDS = [
  'email', 'e_mail', 'emailAddress',
  'phone', 'phoneNumber', 'mobile',
  'ssn', 'personalNumber', 'fodselsnummer',
  'token', 'access_token', 'refresh_token',
  'api_key', 'apiKey', 'secret', 'password',
  'credit_card', 'card_number', 'cvv',
  'ip_address', 'ip', 'ipAddress',
  'name', 'fullName', 'firstName', 'lastName',
  'address', 'street', 'zipCode', 'postalCode',
];
```

---

## PROSJEKTSPESIFIKK UTVIDELSE

For transkripsjonsapper og chatboter, legg til:

```typescript
const TRANSCRIPTION_PII_FIELDS = [
  'voice_transcript', 'transcript', 'transcription',
  'chat_input', 'message_content', 'message_body',
  'user_message', 'conversation', 'dialogue',
];
```

Legg til i `PII_FIELDS` basert på prosjekttype.

---

## FEW-SHOT: SENTRY BEFORESEND

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

const PII_FIELDS = [
  'email', 'phone', 'name', 'ssn', 'api_key', 'token',
  'password', 'credit_card', 'address',
];

export function scrubPII(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(scrubPII);
  
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
      k,
      PII_FIELDS.some(f => k.toLowerCase().includes(f.toLowerCase()))
        ? '[REDACTED]'
        : scrubPII(v)
    ])
  );
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  beforeSend: (event) => ({
    ...event,
    extra: event.extra ? scrubPII(event.extra) : undefined,
    // Behold kun bruker-ID, aldri navn/email
    user: event.user ? { id: event.user.id } : undefined,
    // Scrub request body
    request: event.request ? {
      ...event.request,
      data: event.request.data ? scrubPII(event.request.data) : undefined,
    } : undefined,
  }),
});
```

---

## POSTHOG BEFORECAPTURE

```typescript
// PostHog klientkonfigurasjon
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  before_send: (event) => {
    if (!event.properties) return event;
    
    // Scrub properties
    event.properties = scrubPII(event.properties) as Record<string, unknown>;
    
    return event;
  }
});
```

---

## GDPR-BEGRUNNELSE

| Kravet | Implementering |
|--------|----------------|
| Art. 5(1)(c) Dataminimering | Kun bruker-ID sendes til analytics, ikke persondata |
| Art. 32 Sikkerhet | PII scrubbes FØR den forlater brukerens nettleser |
| Art. 25 Privacy by Design | beforeSend er en teknisk kontroll, ikke prosess |
| Art. 33 Bruddvarsling | Sentry-data inneholder ikke PII som utløser 72t-varsel |

---

## GUARDRAILS

### Gjør alltid
- Implementer beforeSend i Sentry og PostHog FØR første deploy
- Test at scrubbing fungerer med `console.log(scrubPII({ email: 'test@test.com' }))`
- Utvid UNIVERSAL_PII_FIELDS med domene-spesifikke felt

### Ikke gjør
- Send hele request-body til Sentry uten scrubbing
- Lagre bruker-email i analytics-events

### Stopp og spør
- Hvis prosjektet håndterer helsedata, bankinformasjon eller barns data — meld fra, strengere regler gjelder

---

## KRITISKE REGLER (gjentas)

PII-sanitering implementeres FØR første produksjonsdeploy. Ingen event sendes til tredjeparts analytikk- eller feilsporingstjenester uten at beforeSend-hook er på plass.

---

## PHASE-GATES INTEGRASJON

PII-sanitering er et **blokkerende krav** i fase 6 (KVALITETSSIKRINGS) og fase 7 (PUBLISERINGS).

**Sjekkliste for PHASE-GATES (fase 6/7):**
- [ ] `beforeSend`-hook er implementert i alle analytikk- og feilsporingstjenester
- [ ] Ingen bruker-IDer, e-postadresser eller navn logges i klartekst til tredjepart
- [ ] PII-GDPR-ekspert er kalt og leveransen er godkjent
- [ ] GDPR-ekspert og PII-SANITERING-protokoll er fulgt

Referanse: `agent-PHASE-GATES.md` — legg til disse punktene i Fase 6/7-valideringen.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
