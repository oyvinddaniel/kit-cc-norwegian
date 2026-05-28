# extension-REPLICATE-IMAGES

> **Type:** Extension (utvider 4-MVP-agent)
> **Trigger:** Kalles når imageStrategy.type inneholder "replicate" (string eller array)
> **Formål:** Genererer AI-bilder via Replicate API og plasserer dem i prosjektet

---

## NÅR DENNE EXTENSION KALLES

4-MVP-agent kaller denne extension ETTER at designsystemet er satt opp (MVP-00) og FØR MVP-leveransen. Bilder skal være på plass i prosjektet når bruker ser appen for første gang.

Si tydelig hvilket punkt du er på i oppsettet FØR du fortsetter. Hvert steg her er basert på det vi har sett gå galt når det hoppes over.

---

## FORUTSETNINGER

1. `imageStrategy.type` inneholder `"replicate"` i PROJECT-STATE.json (string eller array)
2. `imageStrategy.replicateModel` inneholder valgt modell-ID
3. Designsystem er satt opp (farger, typografi, tokens tilgjengelig)
4. Bruker har Replicate API-nøkkel tilgjengelig

---

## MODELLER

| # | Modell | ID | Best for | Pris/bilde |
|---|--------|----|----------|------------|
| 1 | **Flux Pro** | `black-forest-labs/flux-pro` | Fotorealisme, nettsider, hero-bilder | ~$0.03-0.05 |
| 2 | **Nano Banana Pro** | `google/nano-banana-pro` | Allsidig, presisjon, bilderedigering | ~$0.02-0.04 |
| 3 | **Ideogram v3 Turbo** | `ideogram-ai/ideogram-v3-turbo` | Tekst i bilder, typografi, kreativt | ~$0.03 |
| 4 | **Recraft v3** | `recraft-ai/recraft-v3` | Illustrasjoner, ikoner, SVG, design-assets | ~$0.04 |
| 5 | **Flux Schnell** | `black-forest-labs/flux-schnell` | Prototyping, raskest, billigst | ~$0.01 |

---

## FLYT

### Steg 1: API-nøkkel

```
1. Les .env i prosjektroten — sjekk om REPLICATE_API_TOKEN finnes
   ├─ JA → Bruk nøkkelen i alle etterfølgende API-kall
   └─ NEI ↓
2. Sjekk shell-miljøet: printenv REPLICATE_API_TOKEN
   ├─ JA → Bruk den
   └─ NEI ↓
3. Sjekk Monitor API (les overlay.port fra PROJECT-STATE.json, default 4444):
   curl -s http://localhost:[overlay.port]/kit-cc/api/env/REPLICATE_API_TOKEN
   ├─ Svarer med exists=true → Nøkkelen finnes, bruk Monitor for operasjoner
   └─ Svarer ikke / exists=false ↓
4. KUN hvis alle over feiler → Spør bruker:
   "For å generere bilder trenger jeg din Replicate API-nøkkel.
    1. Gå til replicate.com → Settings → API tokens
    2. Kopier nøkkelen og lim den inn her:"
   → Lagre nøkkelen:
     HVIS Monitor kjører:
       curl -X POST http://localhost:[overlay.port]/kit-cc/api/env \
         -H "Content-Type: application/json" \
         -d '{"key":"REPLICATE_API_TOKEN","value":"[nøkkelen]"}'
     ELLERS (Monitor nede):
       Skriv direkte til .env: echo 'REPLICATE_API_TOKEN=[nøkkelen]' >> .env
       Legg til .env i .gitignore hvis den ikke allerede er der
   → Bruk nøkkelen i alle etterfølgende API-kall i denne sesjonen
```

### Steg 2: Identifiser bildebehov

```
1. Les prosjektets sidestruktur/komponenter (fra docs/ eller src/)
2. Identifiser seksjoner som trenger bilder:
   - Hero/banner-seksjoner
   - Produktbilder (hvis e-handel)
   - Bakgrunnsbilder
   - Illustrasjoner
   - Teambilder (plassholderbilder)
   - Ikon-bilder (kun hvis modellen støtter det)
3. For HVER seksjon, bestem:
   - Størrelse (bredde x høyde i piksler)
   - Aspektforhold (16:9, 1:1, 4:3, etc.)
   - Motiv/beskrivelse
   - Stil (foto, illustrasjon, abstrakt)
```

### Steg 3: Generer prompts

```
For HVERT bilde:
1. Les designsystemets fargepalett (primary, secondary, accent)
2. Les prosjektets navn og beskrivelse
3. Generer en prompt som inkluderer:
   - Motivbeskrivelse (hva bildet skal vise)
   - Stil (photorealistic, illustration, minimal, etc.)
   - Fargeharmoni (bruk prosjektets farger som referanse)
   - Belysning og stemning
   - Tekniske detaljer (oppløsning, aspektforhold)

Eksempel-prompt for en hero-seksjon:
"Professional hero image for a modern web application.
 Clean, minimalist photography style. Soft gradient lighting
 with warm tones complementing a blue-purple color scheme.
 Subject: [relevant motiv]. 16:9 aspect ratio, high resolution."
```

### Steg 4: Kjør Replicate API

```bash
# API-kall (Node.js/fetch)
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: imageStrategy.replicateModel,
    input: {
      prompt: generatedPrompt,
      width: imageWidth,
      height: imageHeight,
      num_outputs: 1
    }
  })
})

# Poll for resultat (Replicate er asynkron)
# GET https://api.replicate.com/v1/predictions/{id}
# Sjekk status: "starting" → "processing" → "succeeded"
# Hent output-URL fra response.output[0]
```

**Alternativ (enklere):** Bruk `npx replicate run` CLI:
```bash
REPLICATE_API_TOKEN=[token] npx replicate run [model-id] \
  --input prompt="[prompt]" \
  --input width=[width] \
  --input height=[height]
```

### Steg 5: Last ned og plasser bilder

```
1. For HVERT generert bilde:
   - Last ned fra Replicate output-URL
   - Lagre i prosjektets image-mappe: src/assets/images/ eller public/images/
   - Navngi beskrivende: hero-background.webp, product-placeholder-1.webp, etc.
   - Konverter til WebP hvis mulig (bedre komprimering)
2. Oppdater prosjektkoden med riktige bildereferanser
3. Verifiser at bildene lastes inn (ingen 404)
```

### Steg 6: Oppdater tilstand

```
Sett imageStrategy.imagesGenerated = true i PROJECT-STATE.json
Logg til PROGRESS-LOG:
  {"ts":"<ISO 8601>","event":"DONE","task":"image-generation","output":"[antall] bilder generert via Replicate ([modell])","schemaVersion":1}
```

---

## FEILHÅNDTERING

| Feil | Handling |
|------|----------|
| Ugyldig API-nøkkel (401) | Be bruker om å sjekke nøkkelen og prøv på nytt |
| Modell ikke funnet (404) | Vis tilgjengelige modeller, la bruker velge på nytt |
| Rate limit (429) | Vent 30 sekunder, prøv på nytt (maks 3 forsøk) |
| Bilde-generering feilet | Logg feil, prøv med forenklet prompt. Hvis 3 feil: tilby Lorem Picsum som fallback |
| Timeout (>120 sek) | Avbryt, prøv med Flux Schnell (raskest modell) som fallback |

---

## FALLBACK-STRATEGI

Hvis Replicate ikke fungerer (nettverksfeil, nøkkelproblem, etc.):
1. Informer bruker om problemet
2. Tilby: "Vil du (A) prøve på nytt, (B) bruke plassholderbilder midlertidig, eller (C) skippe bilder?"
3. Hvis B: Bruk Lorem Picsum (`https://picsum.photos/[bredde]/[høyde]`) som midlertidige plassholderbilder
4. Uansett valg: Sett `imageStrategy.imagesGenerated` til `true` bare hvis ekte bilder er plassert

---

## VIKTIG

- Bilder genereres i **Fase 4 (MVP)**, IKKE i Fase 5
- PHASE-GATES blokkerer MVP hvis `imageStrategy.type` inneholder `"replicate"` eller `"own-images"` og `imageStrategy.imagesGenerated === false`
- Bruker kan alltid bytte til "egne bilder" eller "ingen bilder" ved å re-klassifisere
- API-nøkler lagres i .env (via Monitor API, single writer pattern) — ALDRI direkte i kildekode
- .env legges automatisk i .gitignore av Monitor

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
