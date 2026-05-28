# protocol-COMPREHENSION-GATE v1.0

> Verifiserer at kritiske endringer er forstått av bruker FØR de godkjennes

**Kritiske regler:** Kun 3 spørsmål — aldri mer. Kun for prod-deploy, RLS-endring og secret-håndtering. "Vet ikke" stopper mergen, det straffer ikke.

---

## HENSIKT

Tenk på det som: eksamen du tar før du får sertifikatet — ikke straff, men bevis på at du er klar.

96% av utviklere stoler ikke blindt på AI-kode, men 48% verifiserer den faktisk. "Comprehension debt" er en reell risiko: du godkjenner noe du ikke forstår, og problemene oppdages bare av sluttbrukere. Porten gjelder kun de mest kritiske merge-typene for å unngå unødvendig friksjon.

---

## AKTIVERES VED

- **Prod-deploy** (direkte til produksjon, ikke staging)
- **RLS-endring** (ny policy, endret policy, deaktivert RLS)
- **Secret-håndtering** (rotasjon, ny nøkkel, tilgangsjustering)

Aktiveres IKKE ved vanlige feature-PRs, bugfixer, UI-endringer.

---

## 3 COMPREHENSION-SPØRSMÅL

Genereres automatisk av REVIEWER-agent basert på koden:

```
COMPREHENSION-GATE

Endringen du godkjenner: [KORT_BESKRIVELSE]

For å fortsette, svar på disse 3 spørsmålene:

1. Hva er den konkrete effekten av denne endringen for sluttbrukerne?
2. Hva skjer hvis denne endringen inneholder en feil?
3. Hva er rollback-prosedyren hvis noe går galt?
```

Alternativ: "Pair-reader: [NAVN] godkjenner" (navngitt person tar ansvar)

---

## FEW-SHOT: RLS-ENDRING

```
COMPREHENSION-GATE — RLS-endring

Endringen: Ny RLS-policy på orders-tabellen som begrenser brukere til egne ordre

Svar på disse 3 spørsmålene:

1. Hva er den konkrete effekten av denne endringen for sluttbrukerne?
   → Brukere kan bare se egne ordre, ikke alle ordre i systemet

2. Hva skjer hvis denne endringen inneholder en feil?
   → Brukere kan potensielt se andres ordre (for liberal policy)
      eller ikke se egne ordre (for restriktiv policy)

3. Hva er rollback-prosedyren hvis noe går galt?
   → Kjør supabase db reset eller reverter migrasjonsfilen i Git og push ny migrasjon

[Bruker svarer på spørsmålene]

Svarene er registrert. Du kan nå merge.
```

---

## FEW-SHOT: "VET IKKE"-SVAR

```
Bruker: "Vet ikke hva rollback-prosedyren er"

Forventet respons:
Merge er blokkert. Vi må avklare rollback-prosedyren FØR vi merger.

Her er de vanligste alternativene:
1. Vercel: Klikk "Instant Rollback" i Vercel-dashbordet
2. Git: Reverter commit og push til main (triggerer ny deploy)
3. Database: Lag en revert-migrasjon og kjør den

Hvilken tilnærming passer for dette prosjektet?
```

---

## GUARDRAILS

### Gjør alltid
- Still spørsmål på menneskelig norsk (ikke teknisk sjargong)
- Aksepter "vet ikke" som svar — og hjelp bruker finne svaret
- Logg svar i PROGRESS-LOG

### Ikke gjør
- Aktiver gate ved vanlige PRs — det er friksjon uten verdi
- Generer mer enn 3 spørsmål per gate

### Stopp og spør
- Alltid — dette er en stopp-og-spør-protokoll

---

## KRITISKE REGLER (gjentas)

Kun 3 spørsmål — aldri mer. Kun for prod-deploy, RLS-endring og secret-håndtering. "Vet ikke" stopper mergen, det straffer ikke.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
