/**
 * Integrasjonskatalog for Kit CC Monitor
 *
 * 13 kategorier med anbefalte providere, basert på 4-MVP-agent.md Tier-struktur.
 * Brukes av data-panels.js for å vise full katalogvisning i Innsikt-panelet.
 *
 * Hver kategori har:
 *   - why: Forklarer HVORFOR denne kategorien er viktig (for vibecodere)
 *   - providers[].pros/cons/pricing/bestFor: Detaljinfo per tilbyder
 *
 * Sist oppdatert: 2026-02-21 (komplett research-gjennomgang)
 */

export const INTEGRATION_CATALOG = [
  {
    id: 'auth',
    name: 'Autentisering',
    description: 'Innlogging og brukeridentitet',
    why: 'Lar brukerne lage konto og logge inn i appen din. Uten dette kan du ikke skille mellom brukere, lagre deres data separat, eller beskytte private sider.',
    recommended: 'supabase-auth',
    providers: [
      {
        id: 'supabase-auth', name: 'Supabase Auth',
        desc: 'Innlogging som følger med Supabase-pakken — e-post, Google, magic links og mer.',
        pros: ['Gratis for opptil 50 000 brukere', 'Følger med database og fillagring i samme tjeneste', 'Open source — du eier dataene dine'],
        cons: ['Ingen ferdig innloggingsside — du bygger selv', 'Bundet til Supabase som plattform'],
        pricing: 'Gratis: 50K brukere. Pro: $25/mnd.',
        bestFor: 'Deg som allerede bruker Supabase til database — da får du innlogging på kjøpet.',
        credentials: [
          { env: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', type: 'text',
            helpUrl: 'https://supabase.com/dashboard/project/_/settings/api',
            helpText: 'Gå til Supabase Dashboard → Settings → API → Project URL' },
          { env: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Key', type: 'text',
            helpText: 'Samme sted — kopier anon/public-nøkkelen' }
        ]
      },
      {
        id: 'clerk', name: 'Clerk',
        desc: 'Ferdigbygde innloggingssider du bare dropper inn i appen — oppe og kjører på minutter.',
        pros: ['Vakre, ferdige innloggingssider du slipper å bygge selv', 'Støtter passkeys og biometri ut av boksen', 'Raskeste vei til fungerende innlogging (1–3 dager)'],
        cons: ['Vanskelig å bytte bort fra senere — dyp integrasjon', 'Begrenset for komplekse bedriftsoppsett'],
        pricing: 'Gratis: 10K brukere. Pro: fra $25/mnd.',
        bestFor: 'Deg som vil ha innlogging som bare fungerer, uten å bruke tid på design og kode.'
      },
      {
        id: 'better-auth', name: 'Better Auth',
        desc: 'Nytt open source auth-bibliotek som erstatter NextAuth — TypeScript-first med plugins for alt.',
        pros: ['Helt gratis og open source — ingen brukerbegrensning', 'TypeScript-first med automatisk typegenerering', 'Plugin-system: 2FA, passkeys, organisasjoner, admin-panel'],
        cons: ['Nytt prosjekt (2024) — mindre modent enn alternativer', 'Du hoster selv — krever database og serveroppsett'],
        pricing: 'Gratis (open source). Du betaler kun hosting.',
        bestFor: 'Utviklere som vil ha NextAuth-erstatning med moderne TypeScript og full kontroll.'
      },
      {
        id: 'kinde', name: 'Kinde',
        desc: 'Auth-plattform med innebygd funksjonsflagg, roller og organisasjoner — alt i én tjeneste.',
        pros: ['Generøst gratistier: 10 500 brukere gratis', 'Innebygd feature flags og rollestyring uten ekstra verktøy', 'Ferdig UI-komponenter for innlogging og registrering'],
        cons: ['Mindre kjent enn Clerk/Auth0 — mindre fellesskap', 'Avanserte funksjoner krever Enterprise-plan'],
        pricing: 'Gratis: 10 500 brukere. Pro: $25/mnd.',
        bestFor: 'Startups som vil ha auth + feature flags + roller i én tjeneste uten å koble sammen flere verktøy.'
      }
    ]
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Lagring av data',
    why: 'Databasen er der all informasjonen i appen lagres — brukerprofiler, innlegg, bestillinger, innstillinger. Uten database kan ikke appen huske noe.',
    recommended: 'supabase-db',
    providers: [
      {
        id: 'supabase-db', name: 'Supabase (PostgreSQL)',
        desc: 'Full database med API, innlogging og fillagring inkludert — alt i én tjeneste.',
        pros: ['Alt-i-ett: database + auth + lagring + sanntid', 'Ekte PostgreSQL — industristandard du kan ta med deg', 'Generøst gratistier (500 MB)'],
        cons: ['Gratisprosjekter pauser etter 7 dager uten bruk', 'Krever litt SQL-kunnskap for avanserte ting'],
        pricing: 'Gratis: 500 MB. Pro: $25/mnd (8 GB).',
        bestFor: 'De fleste nye prosjekter — du får database, innlogging og lagring i én pakke.'
      },
      {
        id: 'neon', name: 'Neon',
        desc: 'Serverless PostgreSQL med branching — lag kopier av databasen for testing uten å påvirke produksjon.',
        pros: ['Database-branching: test endringer trygt som med Git', 'Generøst gratistier: 512 MB, 190 brukertimer/mnd', 'Skalerer til null — ingen kostnad når appen ikke brukes'],
        cons: ['Kaldstart på ~0,5–1 sek etter inaktivitet', 'Relativt nytt selskap — mindre modent enn Supabase'],
        pricing: 'Gratis: 512 MB, 190 timer/mnd. Launch: $19/mnd.',
        bestFor: 'Utviklere som vil ha PostgreSQL med branching og null vedlikehold — perfekt for preview-deployments.'
      },
      {
        id: 'turso', name: 'Turso',
        desc: 'Distribuert SQLite-database som kjører nær brukerne — ekstremt lave responstider globalt.',
        pros: ['SQLite overalt — kjent teknologi, null oppsett', 'Multi-region: data repliseres nær brukerne automatisk', 'Generøst gratistier: 9 GB lagring, 500 databaser'],
        cons: ['SQLite har begrensninger vs PostgreSQL (færre typer, enklere spørringer)', 'Ikke egnet for tunge skrive-intensive apper'],
        pricing: 'Gratis: 9 GB, 500 DB-er. Scaler: $29/mnd.',
        bestFor: 'Edge-apper og mobile-first prosjekter der responstid er viktigere enn avanserte SQL-funksjoner.'
      },
      {
        id: 'mongodb', name: 'MongoDB Atlas',
        desc: 'Fleksibel database der data lagres som dokumenter — slipper å definere tabeller på forhånd.',
        pros: ['Ingen fast skjema — rask å komme i gang og iterere', 'Gratis tier som aldri pauser (512 MB)', 'Innebygd fulltekstsøk og multi-sky-støtte'],
        cons: ['Vanskelig med komplekse relasjoner mellom data', 'Kan bli dyrt med dedikerte klynger'],
        pricing: 'Gratis: 512 MB (alltid på). Flex: $8–30/mnd.',
        bestFor: 'Apper med fleksibel datastruktur, som CMS-er, blogger eller prototyper.'
      }
    ]
  },
  {
    id: 'hosting',
    name: 'Hosting/Deploy',
    description: 'Publisering av appen',
    why: 'Hvor skal appen din lagres? Hosting gjør appen din tilgjengelig på internett. Uten det ligger koden bare på datamaskinen din. En hostingtjeneste publiserer appen automatisk når du gjør endringer.',
    recommended: 'vercel',
    providers: [
      {
        id: 'vercel', name: 'Vercel',
        desc: 'Optimal for Next.js — automatisk deploy fra Git, forhåndsvisning per endring, global hastighet.',
        pros: ['Best-i-klassen for Next.js (de lager rammeverket)', 'Git push = live oppdatering med forhåndsvisning per branch', 'Globalt edge-nettverk med automatiske optimaliseringer'],
        cons: ['Risiko for innlåsing — særlig med Next.js-spesifikke funksjoner', 'Kostnader kan stige uforutsigbart på Pro-plan'],
        pricing: 'Gratis: personlig bruk, 100 GB båndbredde. Pro: $20/bruker/mnd.',
        bestFor: 'Next.js- og React-prosjekter der du vil ha raskest mulig utvikleropplevelse.'
      },
      {
        id: 'cloudflare-pages', name: 'Cloudflare Pages + Workers',
        desc: 'Gratis hosting med ubegrenset båndbredde, Workers for backend og R2 for lagring — alt i én plattform.',
        pros: ['Ubegrenset båndbredde på gratisplanen — ingen overraskelser', 'Workers kjører kode i 300+ byer globalt med <50ms responstid', 'Integrert med R2 (lagring), D1 (database), KV (nøkkel-verdi)'],
        cons: ['Workers har CPU-grenser (10ms gratis, 30sek betalt) — ikke for tunge beregninger', 'Mindre modent økosystem enn Vercel for Next.js-spesifikke funksjoner'],
        pricing: 'Gratis: ubegrenset, 100K Worker-kall/dag. Pro: $5/mnd.',
        bestFor: 'Budsjettbevisste prosjekter som vil ha ubegrenset båndbredde og edge-computing uten kostnadsjokk.'
      },
      {
        id: 'netlify', name: 'Netlify',
        desc: 'Allsidig hosting som fungerer med alle rammeverk — med innebygd skjemahåndtering og identitet.',
        pros: ['Generøst gratistier: 100 GB båndbredde, 300 byggeminutter', 'Fungerer med alle rammeverk — ikke bundet til Next.js', 'Innebygd skjemahåndtering og identitet'],
        cons: ['Svakere for komplekse server-side-renderte apper', 'Ny kredittbasert prismodell kan forvirre'],
        pricing: 'Gratis: 100 GB båndbredde. Pro: $19/bruker/mnd.',
        bestFor: 'Statiske nettsider, Jamstack-prosjekter og team som vil unngå rammeverklåsing.'
      },
      {
        id: 'railway', name: 'Railway',
        desc: 'Full-stack hosting for alt — app, database og bakgrunnsjobber i én tjeneste.',
        pros: ['Enkleste vei til backend + database i produksjon', 'Bruksbasert pris — betal kun for det du bruker', '74% billigere enn lignende tjenester for små prosjekter'],
        cons: ['Ingen innebygd CDN eller edge-funksjoner', 'Mindre fellesskap enn Vercel/Netlify'],
        pricing: 'Hobby: $5/mnd (inkl. $5 bruk). Pro: $20/mnd.',
        bestFor: 'Apper med backend, API-er og databaser som trenger full-stack hosting.'
      }
    ]
  },
  {
    id: 'storage',
    name: 'Fillagring',
    description: 'Opplasting og lagring av filer og bilder',
    why: 'Hvor skal brukerne lagre filene de laster opp? Når brukerne skal laste opp profilbilder, dokumenter eller andre filer, trengs et sted å lagre dem. Fillagring håndterer opplasting, lagring og levering av filer.',
    recommended: 'supabase-storage',
    providers: [
      {
        id: 'supabase-storage', name: 'Supabase Storage',
        desc: 'Fillagring som følger med Supabase — enkelt å koble til brukere og tilgangsregler.',
        pros: ['Inkludert i Supabase-pakken — én tjeneste for alt', 'Generøst gratistier (1 GB lagring)', 'S3-kompatibelt — du kan flytte bort senere'],
        cons: ['Begrenset bildebehandling sammenlignet med Cloudinary', 'Ikke ideell om du bare trenger fillagring alene'],
        pricing: 'Gratis: 1 GB. Pro: $25/mnd (100 GB).',
        bestFor: 'Deg som allerede bruker Supabase — da er fillagring bare å skru på.'
      },
      {
        id: 'cloudflare-r2', name: 'Cloudflare R2',
        desc: 'S3-kompatibel lagring uten egress-kostnader — du betaler aldri for båndbredde.',
        pros: ['Null egress-kostnader — spar 50–80% vs AWS S3', 'Fullt S3-kompatibelt — bytt fra S3 uten kodeendringer', 'Generøst gratistier: 10 GB lagring, 10M lesninger/mnd'],
        cons: ['Ingen innebygd bildebehandling — kun rå lagring', 'Administrasjon via Cloudflare-dashbordet er grunnleggende'],
        pricing: 'Gratis: 10 GB, 10M lesninger. Betalt: $0.015/GB/mnd.',
        bestFor: 'Alle som vil ha S3-kompatibel lagring uten å bekymre seg for båndbreddekostnader.'
      },
      {
        id: 'cloudinary', name: 'Cloudinary',
        desc: 'Bildeekspert — beskjærer, komprimerer og leverer bilder automatisk i beste format.',
        pros: ['Automatisk bildetilpasning, beskjæring og formatkonvertering via URL', 'AI-drevet smart beskjæring og bakgrunnsfjerning', 'Globalt CDN for rask levering'],
        cons: ['Forvirrende prismodell med «credits»', 'Stort hopp i pris fra gratis til betalt ($89/mnd)'],
        pricing: 'Gratis: ~25 GB. Plus: $89/mnd.',
        bestFor: 'Nettbutikker og bildetunge apper der bildekvalitet og lastehastighet er viktig.'
      },
      {
        id: 'uploadthing', name: 'UploadThing',
        desc: 'Raskeste vei til filopplasting i Next.js — ferdige komponenter og null konfigurasjon.',
        pros: ['Ferdig på minutter — ferdige React-komponenter', 'Ingen bandbreddekostnader', 'Type-sikker og bygd for Next.js/TypeScript'],
        cons: ['Relativt nytt selskap — mindre testet i stor skala', 'Ingen bildebehandling — kun opplasting og lagring'],
        pricing: 'Gratis: 2 GB. Starter: $10/mnd (100 GB).',
        bestFor: 'Next.js-utviklere som vil ha filopplasting uten å tenke på konfigurasjon.'
      }
    ]
  },
  {
    id: 'images',
    name: 'Bilder/Stock',
    description: 'Stockbilder og AI-bildegenerering',
    why: 'Nesten alle apper trenger bilder — til innhold, produkter, brukerprofiler eller dekorasjon. Stockfoto-API-er gir tilgang til millioner av profesjonelle bilder, mens AI kan generere unike bilder fra tekstbeskrivelser.',
    recommended: 'unsplash',
    providers: [
      {
        id: 'unsplash', name: 'Unsplash',
        desc: 'Gratis API med millioner av kuraterte, høykvalitets stockbilder fra et globalt fotograffellesskap.',
        pros: ['Helt gratis — ingen betalingsplan nødvendig', '5 000 API-kall per time i produksjonsmodus', 'Enkel REST API med offisielle SDK-er for JavaScript, PHP m.fl.'],
        cons: ['Demo-modus er begrenset til 50 kall/time inntil godkjenning', 'Alle bilder MÅ trigge Unsplashs download-endpoint ved bruk (krav i retningslinjene)'],
        pricing: 'Gratis. Demo: 50 req/time. Produksjon: 5 000 req/time.',
        bestFor: 'Apper og nettsider som trenger et stort bibliotek av kuraterte, designerfokuserte bilder uten kostnad.',
        credentials: [
          { env: 'UNSPLASH_ACCESS_KEY', label: 'Access Key', type: 'secret',
            helpUrl: 'https://unsplash.com/oauth/applications',
            helpText: 'Gå til Unsplash Developers → New Application → Access Key' }
        ]
      },
      {
        id: 'flux-pro', name: 'Flux Pro (Black Forest Labs)',
        desc: 'Markedets beste bildegenerering fra Black Forest Labs — Flux Pro, Dev og Schnell via Replicate.',
        pros: ['Flux Pro: beste bildekvalitet, tekst i bilder og prompt-forståelse i bransjen', 'Raskeste inferens: Schnell på <1 sek, Pro på ~2 sek — raskere enn BFL direkte', 'Alle Flux-varianter: Pro, Dev, Schnell, Ultra (4MP), Kontext (redigering), FLUX.2'],
        cons: ['Kun bildegenerering — ikke en generell ML-plattform', 'Flux Pro/Ultra er API-only — kan ikke kjøres lokalt'],
        pricing: 'Schnell: $0.003/bilde. Pro: $0.05/bilde. Ultra (4MP): $0.06/bilde.',
        bestFor: 'Apper som trenger den beste AI-bildegeneratoren — Flux Pro er industriledende på kvalitet og prompt-forståelse.',
        credentials: [
          { env: 'REPLICATE_API_TOKEN', label: 'Replicate API-nøkkel', type: 'secret',
            helpUrl: 'https://replicate.com/account/api-tokens',
            helpText: 'Flux Pro kjøres via Replicate. Gå til Replicate → Settings → API tokens' }
        ]
      },
      {
        id: 'imagen-3', name: 'Imagen 3 (Google)',
        desc: 'Googles Imagen 3 — bildegenerering med samtalebasert redigering, 4K-oppløsning og tekst i bilder.',
        pros: ['Samtalebasert redigering: «fjern bakgrunnen», «endre farge» — AI forstår kontekst', 'Opptil 14 referansebilder for konsistent stil og karakterer', '50 gratis bilder/dag via Google AI Studio — beste gratistier'],
        cons: ['Dyrere enn Flux Pro: $0.13–0.24/bilde avhengig av oppløsning', 'Nyere og mindre testet enn Flux for ren bildegenerering'],
        pricing: 'Gratis: 50 bilder/dag (AI Studio). Betalt: $0.13/bilde (1K). $0.24/bilde (4K).',
        bestFor: 'Apper som trenger AI-bilderedigering via samtale, konsistente karakterer eller gratis bildegenerering.'
      },
      {
        id: 'replicate', name: 'Replicate',
        desc: 'Verdens største markedsplass for AI-modeller — Flux Pro, SDXL, oppskalering, bakgrunnsfjerning, video og lyd via én API.',
        pros: ['600+ modeller i én API: Flux Pro, SDXL, Real-ESRGAN (oppskalering), RMBG (bakgrunnsfjerning), Whisper (tale)', 'Fine-tune egne modeller uten GPU-kunnskap — last opp bilder, få tilpasset modell', '50 gratis genereringer/mnd og betal-per-sekund uten minimum'],
        cons: ['Dyrere enn fal.ai for Flux (~2x pris)', 'Kaldstart gir 5–10 sek forsinkelse på sjeldent brukte modeller'],
        pricing: 'Betal per sekund. Flux Schnell: ~$0.003. Flux Pro: ~$0.055. 50 gratis/mnd.',
        bestFor: 'Apper som trenger MER enn bare bildegenerering — oppskalering, bakgrunnsfjerning, video, lyd og fine-tuning fra én plattform.',
        credentials: [
          { env: 'REPLICATE_API_TOKEN', label: 'API-nøkkel', type: 'secret',
            helpUrl: 'https://replicate.com/account/api-tokens',
            helpText: 'Gå til Replicate → Settings → API tokens' }
        ]
      },
      {
        id: 'nano-banana-pro', name: 'Nano Banana Pro (Google)',
        desc: 'Googles lette bildegenerering — rask, rimelig og god kvalitet for de fleste behov.',
        pros: ['Svært rask inferens via Replicate', 'Lavere kostnad enn Flux Pro', 'God balanse mellom kvalitet og hastighet'],
        cons: ['Nyere modell — mindre testet enn Flux Pro', 'Mindre kontroll over stil og detaljer'],
        pricing: '~$0.01–0.02/bilde via Replicate.',
        bestFor: 'Prosjekter som trenger raske, rimelige AI-bilder med god kvalitet.'
      },
      {
        id: 'ideogram-v3', name: 'Ideogram v3',
        desc: 'Ideograms nyeste modell — sterk på tekst i bilder, logoer og typografisk design.',
        pros: ['Bransjens beste tekst-i-bilde-kvalitet', 'Rask turbo-modus for hurtige resultater', 'God på logoer, plakater og grafisk design'],
        cons: ['Dyrere enn Flux Schnell for enkel bildegenerering', 'Færre stil-kontroller enn Flux Pro'],
        pricing: '~$0.04/bilde via Replicate.',
        bestFor: 'Apper som trenger bilder med tekst, logoer eller typografisk innhold.'
      },
      {
        id: 'recraft-v3', name: 'Recraft v3',
        desc: 'Recraft sin tredjegenerasjons modell — designfokusert med støtte for vektorgrafikk og illustrasjoner.',
        pros: ['Unikt sterk på illustrasjoner og ikoner', 'Kan generere vektorgrafikkstil', 'God på merkevare-konsistent design'],
        cons: ['Mindre kjent enn Flux og DALL-E', 'Smalere bruksområde — best for design/illustrasjon'],
        pricing: '~$0.04/bilde via Replicate.',
        bestFor: 'Design-tunge prosjekter som trenger illustrasjoner, ikoner og merkevare-grafikk.'
      },
      {
        id: 'pexels', name: 'Pexels',
        desc: 'Gratis API med tilgang til bilder og video under fri lisens — umiddelbar API-nøkkel uten godkjenning.',
        pros: ['Gratis og umiddelbar API-nøkkel uten godkjenningsprosess', 'Inkluderer både bilder og videoer i samme API', 'Ubegrenset tilgang mulig ved kvalifisert bruk (søknad)'],
        cons: ['Standard kvote er lav: 200 req/time og 20 000 req/måned', 'Mindre kuratert bibliotek enn Unsplash'],
        pricing: 'Gratis. Standard: 200 req/time, 20K req/mnd.',
        bestFor: 'Prosjekter som trenger rask tilgang til bilder og video kombinert, uten registreringsprosess.',
        credentials: [
          { env: 'PEXELS_API_KEY', label: 'API-nøkkel', type: 'secret',
            helpUrl: 'https://www.pexels.com/api/new/',
            helpText: 'Gå til Pexels → API → New Key' }
        ]
      }
    ]
  },
  {
    id: 'payments',
    name: 'Betaling',
    description: 'Mottak av betalinger og abonnementer',
    why: 'Skal appen din tjene penger — via salg, abonnementer eller donasjoner — trenger du en betalingsløsning. Den håndterer korttransaksjoner, fakturaer og sikkerhet for deg.',
    recommended: 'stripe',
    providers: [
      {
        id: 'stripe', name: 'Stripe',
        desc: 'Verdens mest brukte betalingsplattform — håndterer kort, abonnementer, fakturaer og mye mer.',
        pros: ['Støtter 135+ valutaer og 100+ betalingsmetoder', 'Komplett verktøykasse: abonnementer, fakturaer, svindelvern', 'Enorm dokumentasjon og utviklerfellesskap'],
        cons: ['Du må selv håndtere moms/MVA (eller bruke Stripe Tax som tillegg)', 'Komplekst å sette opp fulle abonnementsflyter'],
        pricing: '2,9% + $0.30 per transaksjon. Ingen månedspris.',
        bestFor: 'De fleste apper som tar betaling — industristandarden.',
        credentials: [
          { env: 'STRIPE_SECRET_KEY', label: 'Secret Key', type: 'secret',
            helpUrl: 'https://dashboard.stripe.com/apikeys',
            helpText: 'Gå til Stripe Dashboard → Developers → API keys' },
          { env: 'STRIPE_PUBLISHABLE_KEY', label: 'Publishable Key', type: 'text',
            helpUrl: 'https://dashboard.stripe.com/apikeys',
            helpText: 'Den publiserbare nøkkelen (pk_) er trygg å bruke i frontend-kode' }
        ]
      },
      {
        id: 'paddle', name: 'Paddle',
        desc: 'Merchant of Record — Paddle er selgeren, håndterer all moms, skatt og compliance globalt for deg.',
        pros: ['Null momsbekymringer — Paddle håndterer moms i 200+ land', 'Checkout, abonnementer og fakturering inkludert', 'Nylig kjøpte de ProfitWell — gratis churm-analyser inkludert'],
        cons: ['Høyere gebyr: 5% + $0.50 per transaksjon', 'Mindre kontroll — Paddle eier kundeforholdet juridisk'],
        pricing: '5% + $0.50 per transaksjon (alt inkludert).',
        bestFor: 'SaaS-selskaper som selger globalt og vil slippe moms-hodepine — bedre alternativ enn Lemon Squeezy.'
      },
      {
        id: 'vipps', name: 'Vipps MobilePay',
        desc: 'Nordens mobilbetaling — nesten alle nordmenn har det allerede på telefonen.',
        pros: ['Ekstremt høy tillit og utbredelse i Norden', 'Lavere friksjonsopplevelse for nordiske brukere'],
        cons: ['Kun relevant i Norden — ikke global', 'Krever norsk/nordisk bedrift'],
        pricing: '1,75–2,99% + 1 NOK per transaksjon.',
        bestFor: 'Apper rettet mot norske/nordiske brukere — bør brukes sammen med Stripe, ikke istedenfor.'
      },
      {
        id: 'polar', name: 'Polar.sh',
        desc: 'Betalingsplattform for utviklere og open source — selg tilgang, sponsorater og digitale produkter.',
        pros: ['Designet for utviklere: GitHub-integrasjon, lisensering, API-tilgang', 'Lavt gebyr: 4% + transaksjonskostnad', 'Innebygd: checkout, abonnementer, lisenser, webhooks'],
        cons: ['Nytt og niche — kun relevant for utvikler-/open source-produkter', 'Mindre modent enn Stripe for generell e-handel'],
        pricing: '4% + betalingsleverandørs gebyr.',
        bestFor: 'Open source-utviklere og indie-hackere som selger digitale produkter, lisenser eller API-tilgang.'
      }
    ]
  },
  {
    id: 'email',
    name: 'E-post',
    description: 'Sending av e-post og varsler',
    why: 'Apper sender e-post hele tiden — velkomstmeldinger, glemt-passord-lenker, ordrebekreftelser, varsler. En e-posttjeneste sørger for at meldingene faktisk kommer frem til innboksen.',
    recommended: 'resend',
    providers: [
      {
        id: 'resend', name: 'Resend',
        desc: 'Moderne e-posttjeneste med vakre React-baserte maler og enkel API.',
        pros: ['Beste utvikleropplevelse — moderne API og React-maler', 'Generøst gratistier: 3 000 e-poster/mnd', 'Både transaksjon og markedsføring fra én plattform'],
        cons: ['Yngre plattform — mindre erfaring enn Postmark', 'Færre avanserte enterprise-funksjoner'],
        pricing: 'Gratis: 3 000/mnd. Pro: $20/mnd (50K).',
        bestFor: 'Nye prosjekter som vil ha moderne e-post med minimal kode.',
        credentials: [
          { env: 'RESEND_API_KEY', label: 'API-nøkkel', type: 'secret',
            helpUrl: 'https://resend.com/api-keys',
            helpText: 'Gå til Resend Dashboard → API Keys → Create API Key' }
        ]
      },
      {
        id: 'loops', name: 'Loops',
        desc: 'E-postplattform bygd for SaaS — automatiserte onboarding-sekvenser, produkt-e-poster og kampanjer.',
        pros: ['Designet spesifikt for SaaS: onboarding, produktoppdateringer, churn-forebygging', 'Visuell workflow-bygger for automatiserte sekvenser', 'Innebygd brukersegmentering basert på produktbruk'],
        cons: ['Kun relevant for SaaS — overkill for enkle transaksjonse-poster', 'Dyrere enn Resend for ren transaksjonse-post'],
        pricing: 'Gratis: 1 000 kontakter. Starter: $49/mnd (5K kontakter).',
        bestFor: 'SaaS-produkter som trenger automatiserte onboarding-flyter og produktdrevne e-postkampanjer.'
      },
      {
        id: 'postmark', name: 'Postmark',
        desc: 'Spesialist på transaksjonse-post — leverer meldinger på under ett sekund.',
        pros: ['Beste leveringsrate i bransjen — e-postene havner i innboksen', 'Ren og enkel prismodell uten skjulte kostnader', 'Separate strømmer for transaksjon vs. markedsføring'],
        cons: ['Markedsførings-e-post er grunnleggende', 'Dyrere per e-post ved lavt volum enn alternativer'],
        pricing: 'Gratis: 100/mnd. Basic: $15/mnd (10K).',
        bestFor: 'Apper der e-post MÅ komme frem — passordtilbakestilling, ordrebekreftelser, sikkerhetsvarsler.'
      },
      {
        id: 'sendgrid', name: 'SendGrid',
        desc: 'Etablert e-postplattform for store volum — brukt av millioner av apper.',
        pros: ['Bevist i stor skala med høy leveringsrate', 'Komplett: API, SMTP, markedskampanjer, maler'],
        cons: ['Datert utvikleropplevelse — API-et føles gammelt', 'Gratistier fjernet — ingen gratis-plan lenger'],
        pricing: 'Essentials: $19.95/mnd (50K e-poster).',
        bestFor: 'Team som trenger en kampanjetestet plattform for store e-postvolum og allerede bruker Twilio.'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analyse',
    description: 'Sporing av bruk og besøkende',
    why: 'Analyser viser deg hva brukerne faktisk gjør i appen — hvilke sider de besøker, hvor de faller av, og om endringene dine fungerer. Uten dette flyr du blindt.',
    recommended: 'plausible',
    providers: [
      {
        id: 'plausible', name: 'Plausible',
        desc: 'Personvernvennlig analyse — ingen cookies, ingen samtykke-banner, hostet i EU.',
        pros: ['Ingen cookies eller samtykke-banner nødvendig — GDPR uten hodepine', 'Superlett script (under 1 KB) — null ytelsestreffer', 'Rent, enkelt dashboard alle kan forstå'],
        cons: ['Ingen session replay eller brukernivå-sporing', 'Ingen gratis tier — starter på €9/mnd'],
        pricing: 'Growth: fra €9/mnd. Business: fra €19/mnd.',
        bestFor: 'Alle som vil ha enkel, lovlig analyse uten advokater og cookie-bannere.'
      },
      {
        id: 'umami', name: 'Umami',
        desc: 'Gratis, open source analyse du kan hoste selv — Plausible-alternativ uten månedskostnad.',
        pros: ['Helt gratis ved selvhosting — ingen brukerbegrensning', 'Personvernvennlig: ingen cookies, GDPR-kompatibelt', 'Enkelt og rent dashboard — lett å forstå'],
        cons: ['Selvhosting krever en server (Vercel/Railway fungerer)', 'Færre funksjoner enn Plausible/PostHog — kun grunnleggende analyse'],
        pricing: 'Selvhostet: gratis. Umami Cloud: fra $9/mnd.',
        bestFor: 'Budsjettbevisste utviklere som vil ha Plausible-kvalitet til null kostnad via selvhosting.'
      },
      {
        id: 'posthog', name: 'PostHog',
        desc: 'Alt-i-ett: analyse, session replay, A/B-testing og feature flags i samme verktøy.',
        pros: ['Enormt gratistier: 1M hendelser, 5K session replays/mnd', 'Erstatter flere verktøy — analyse + replay + eksperimenter', 'Ubegrenset antall brukere på alle planer'],
        cons: ['Bratt læringskurve — mye mer komplekst enn Plausible', 'Datainnsamling stopper når gratisgrensen nås'],
        pricing: 'Gratis: 1M hendelser/mnd. Betalt: bruksbasert.',
        bestFor: 'Produktteam som vil forstå brukeratferd i dybden og eksperimentere med funksjoner.'
      },
      {
        id: 'vercel-analytics', name: 'Vercel Analytics',
        desc: 'Innebygd analyse for Vercel-hostede apper — skru på og ferdig.',
        pros: ['Null oppsett for Vercel-apper — bare skru det på', 'Personvernvennlig — ingen cookie-banner nødvendig', 'Nylig 80% prisreduksjon'],
        cons: ['Fungerer bare på Vercel-hostede apper', 'Begrenset dybde — ingen funnels eller session replay'],
        pricing: 'Gratis: 50K hendelser/mnd. Pro: inkludert i $20/mnd.',
        bestFor: 'Deg som allerede hoster på Vercel og vil ha enkel trafikkoversikt.'
      }
    ]
  },
  {
    id: 'ai',
    name: 'AI/ML',
    description: 'AI-funksjoner i appen',
    why: 'Gjør appen smartere — chatboter, tekstgenerering, bildelaging, anbefalinger. AI-integrasjoner lar deg bruke kraftige modeller uten å bygge dem selv.',
    recommended: 'openai',
    providers: [
      {
        id: 'openai', name: 'OpenAI',
        desc: 'GPT-modellene — mest brukt for chat, tekst, kode, bilder og tale i én API.',
        pros: ['Bredeste modellutvalg: tekst, bilder, lyd, kode — alt fra én leverandør', 'Størst utviklerfellesskap og flest tredjepartsverktøy', 'Batch-API gir 50% rabatt, caching sparer 50–90%'],
        cons: ['Lukket kildekode — full leverandørlåsing', 'Kan bli dyrt med mye trafikk'],
        pricing: 'GPT-4o mini: $0.15/$0.60 per 1M tokens. GPT-4o: $2.50/$10.',
        bestFor: 'De fleste AI-prosjekter — spesielt om du trenger både tekst, bilder og lyd.'
      },
      {
        id: 'anthropic', name: 'Anthropic (Claude)',
        desc: 'Claude-modellene — ledende på kodeforståelse, lange dokumenter og grundig resonnering.',
        pros: ['Beste kodekvalitet i bransjen', 'Enormt kontekstvindu (200K+ tokens) — kan lese hele kodebaser', 'Prompt-caching sparer opptil 90% på store forespørsler'],
        cons: ['Smalere tilbud — kun tekst/kode, ingen bildegenerering eller tale', 'Ratebegrensninger kan hemme tunge agentkjøringer'],
        pricing: 'Haiku: $0.80/$4. Sonnet: $3/$15. Opus: $15/$75 per 1M tokens.',
        bestFor: 'Kode-tunge apper, AI-agenter og alt som krever analyse av store dokumenter.'
      },
      {
        id: 'google-gemini', name: 'Google Gemini',
        desc: 'Googles AI med enormt kontekstvindu (1M tokens) og multimodal forståelse av tekst, bilde, lyd og video.',
        pros: ['1 million tokens kontekst — kan behandle hele bøker og lange videoer', 'Nativt multimodal: tekst, bilder, lyd og video i samme modell', 'Gemini 2.5 Flash: svært rask og rimelig for de fleste oppgaver'],
        cons: ['API-et er nyere og mindre modent enn OpenAIs', 'Noe svakere på kompleks kode-generering enn Claude'],
        pricing: 'Gemini Flash: $0.15/$0.60. Gemini Pro: $1.25/$5 per 1M tokens.',
        bestFor: 'Apper som trenger analyse av video/lyd/bilder, eller som jobber med svært lange dokumenter.'
      },
      {
        id: 'groq', name: 'Groq',
        desc: 'Lynrask AI-inferens — kjører open source-modeller (Llama, Mixtral) 10–20x raskere enn GPU-skyer.',
        pros: ['Ekstremt rask: 500–800 tokens/sekund med Llama 3', 'Svært lave priser: Llama 3 70B koster ~$0.59/M tokens', 'Enkel API kompatibel med OpenAI-formatet'],
        cons: ['Kun open source-modeller — ingen GPT eller Claude', 'Ratebegrensninger på gratisplan (30 forespørsler/min)'],
        pricing: 'Gratis: 30 req/min. Betalt: fra $0.05/M tokens (Llama 3 8B).',
        bestFor: 'Apper der responstid er kritisk — chatboter, autokomplettering, sanntids-AI.'
      }
    ]
  },
  {
    id: 'cms',
    name: 'CMS/Innhold',
    description: 'Innholdshåndtering',
    why: 'Et CMS lar deg og teamet ditt redigere innhold — tekster, bilder, blogginnlegg — uten å måtte endre kode. Perfekt for nettsider med mye innhold som oppdateres ofte.',
    recommended: 'sanity',
    providers: [
      {
        id: 'sanity', name: 'Sanity',
        desc: 'Fleksibelt CMS der du bygger redigeringsverktøyet akkurat slik du vil ha det.',
        pros: ['Ekstremt tilpassbart — redigeringsverktøyet er React-kode du styrer', 'Sanntids samarbeid som Google Docs', 'Rimelig per-bruker-pris ($15/bruker/mnd)'],
        cons: ['Krever kodekunnskap for oppsett og tilpasning', 'Mer manuell konfigurasjon enn konkurrenter'],
        pricing: 'Gratis: 3 brukere. Growth: $15/bruker/mnd.',
        bestFor: 'Utviklere som vil ha full kontroll over innholdsmodellen og redigeringsverktøyet.'
      },
      {
        id: 'payload', name: 'Payload CMS',
        desc: 'Open source, kode-first CMS som kjører inne i Next.js-appen din — null ekstra infrastruktur.',
        pros: ['Kjører i Next.js-appen — ingen separat CMS-server', 'TypeScript-first med autogenererte typer', 'Gratis og open source — nylig kjøpt av Vercel'],
        cons: ['Krever Next.js — fungerer ikke med andre rammeverk', 'Nytt i markedet — mindre modent økosystem enn Sanity/Contentful'],
        pricing: 'Open source: gratis. Payload Cloud: fra $35/mnd.',
        bestFor: 'Next.js-utviklere som vil ha CMS integrert direkte i appen uten eksterne tjenester.'
      },
      {
        id: 'contentful', name: 'Contentful',
        desc: 'Enterprise-CMS med polert redigeringsverktøy, roller og innhold på flere språk.',
        pros: ['Robust rollestyring, arbeidsflyter og flerspråklig innhold', 'Modent økosystem med mange ferdige integrasjoner', 'Sterk REST- og GraphQL-API'],
        cons: ['Dyrt: Basic starter på $300/mnd', 'Bratt læringskurve for innholdsmodellering'],
        pricing: 'Gratis: begrenset. Basic: $300/mnd. Premium: fra ~$60K/år.',
        bestFor: 'Større bedrifter med innholdsteam som trenger roller, arbeidsflyter og flerspråklighet.'
      },
      {
        id: 'strapi', name: 'Strapi',
        desc: 'Gratis CMS du kjører selv — bygg innholdstyper visuelt og få API automatisk.',
        pros: ['Open source og gratis å selvhoste — null leverandørlåsing', 'Visuell innholdstype-bygger genererer API-er automatisk', 'Billigste skyalternativ: fra $15/bruker/mnd'],
        cons: ['Selvhosting krever server-kunnskap', 'Mindre modent plugin-økosystem enn konkurrentene'],
        pricing: 'Selvhostet: gratis. Sky: fra $29/mnd.',
        bestFor: 'Budsjettbevisste team som vil eie sitt eget CMS og har kapasitet til å hoste det.'
      }
    ]
  },
  {
    id: 'monitoring',
    name: 'Feilovervåking',
    description: 'Feilsporing og ytelsesovervåking',
    why: 'Når noe krasjer i appen, vil du vite det FØR brukerne klager. Feilovervåking fanger opp feil automatisk og viser deg nøyaktig hva som gikk galt — med full sporingsinfo.',
    recommended: 'sentry',
    providers: [
      {
        id: 'sentry', name: 'Sentry',
        desc: 'Industristandarden for feilsporing — ser feil i sanntid med full teknisk kontekst.',
        pros: ['Oppe på 5 minutter — SDK-er for alle språk og rammeverk', 'Full stack trace, brødsmulesti og brukerinfo ved hver feil', 'Spike-beskyttelse hindrer uventede regninger'],
        cons: ['Kan oversvømme dashbordet med støy uten riktig filtrering', 'Hendelsesbasert pris kan stige for høytrafikk-apper'],
        pricing: 'Gratis: 5K feil, 10K ytelseshendelser/mnd. Team: $29/mnd.',
        bestFor: 'Alle apper i produksjon — bransjestandarden for å vite når noe går galt.',
        credentials: [
          { env: 'SENTRY_DSN', label: 'DSN', type: 'text',
            helpUrl: 'https://sentry.io/settings/projects/',
            helpText: 'Gå til Sentry → Settings → Projects → [Prosjekt] → Client Keys (DSN)' }
        ]
      },
      {
        id: 'betterstack', name: 'Better Stack',
        desc: 'Oppetidsovervåking + logg-management i én tjeneste — vet når appen er nede før brukerne gjør det.',
        pros: ['Oppetidssjekk hvert 30. sekund fra 6 regioner — gratis', 'Vakre statusider du kan dele med brukerne', 'Kombinerer uptime, logger og incident management'],
        cons: ['Feilsporing er grunnleggende vs Sentry — ikke fullt stack trace', 'Logger-tier kan bli dyrt ved høyt volum'],
        pricing: 'Gratis: 10 monitorer, 30-sek intervall. Starter: $29/mnd.',
        bestFor: 'Team som trenger oppetidsovervåking og statusside i tillegg til (ikke istedenfor) Sentry.'
      },
      {
        id: 'logrocket', name: 'LogRocket',
        desc: 'Se nøyaktig hva brukeren opplevde — session replay som avspilling av feilsituasjonen.',
        pros: ['Se brukerens skjerm når feilen skjedde — dreper «kan ikke gjenskape»-problemer', 'AI oppdager automatisk frustrerte brukere (raseklikk, døde klikk)', 'Lett SDK med minimal ytelsespåvirkning'],
        cons: ['Pris basert på sporte brukere — kan bli dyrt', 'Primært frontend — trenger Sentry i tillegg for full dekning'],
        pricing: 'Gratis: 1 000 sesjoner/mnd. Team: fra $69/mnd.',
        bestFor: 'Produktteam som vil forstå brukeropplevelsen bak feilene — best sammen med Sentry.'
      }
    ]
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Videohosting og streaming',
    why: 'Skal appen din vise video — kurs, produktdemoer, brukergenerert innhold — trenger du en videoinfrastruktur. Den håndterer transkoding, adaptiv kvalitet og global levering slik at videoen spiller jevnt overalt.',
    recommended: 'mux',
    providers: [
      {
        id: 'mux', name: 'Mux',
        desc: 'Utviklerfokusert video-API med AI-optimalisert transkoding, streaming og dype analyser.',
        pros: ['Best-in-class utvikleropplevelse med ren REST API og gode SDK-er', 'AI-drevet per-title encoding optimaliserer kvalitet automatisk per video', 'Innebygd Mux Data gir dype seerkvalitets-analyser (QoE)'],
        cons: ['Dyrere enn Cloudflare/Bunny ved stort volum', 'Gratisnivå begrenset til 10 videoer (kun VOD, ingen live gratis)'],
        pricing: 'Gratis: 100K leveringsmin/mnd (maks 10 videoer). Launch: $20/mnd.',
        bestFor: 'Læringsplattformer, videodelingstjenester og apper der videokvalitet og analyser er kritisk.'
      },
      {
        id: 'cloudflare-stream', name: 'Cloudflare Stream',
        desc: 'Alt-i-ett videoplattform med opplasting, transkoding og streaming — uten separat båndbreddekostnad.',
        pros: ['Ingen separat egress-kostnad — båndbredde inkludert i leveringspris', 'Støtter HLS og DASH med automatisk multi-quality transkoding', 'Naturlig integrasjon med andre Cloudflare-tjenester (Workers, R2, WAF)'],
        cons: ['Svakere analyser enn Mux — ingen innebygd QoE-data', 'Ingen gratisnivå — koster fra første minutt'],
        pricing: 'Lagring: $5/1000 min. Levering: $1/1000 min.',
        bestFor: 'Team som allerede bruker Cloudflare og ønsker et enkelt, rimelig video-lag.'
      },
      {
        id: 'bunny-stream', name: 'Bunny Stream',
        desc: 'Svært kostnadseffektiv video-CDN med global distribusjon, gratis transkoding og pay-as-you-go.',
        pros: ['Klart billigst — typisk 5–10x rimeligere enn Mux/Cloudflare', 'Gratis og ubegrenset transkoding til alle oppløsninger (360p–4K)', '14-dagers gratis prøveperiode og rask kundesupport'],
        cons: ['Live streaming-støtte er begrenset — primært bygget for VOD', 'Grunnleggende analyser uten QoE-data eller per-seer-statistikk'],
        pricing: 'Lagring: $0.01/GB. Båndbredde EU/NA: $0.01/GB. Min. $1/mnd.',
        bestFor: 'Kostnadssensitive prosjekter med høyt videovolum der lav CDN-pris er viktigst.'
      }
    ]
  },
  {
    id: 'maps',
    name: 'Kart/Geolokasjon',
    description: 'Kart, geocoding og stedstjenester',
    why: 'Viser appen din plasseringer, adresser eller ruter? Karttjenester gir deg interaktive kart, adresseoppslag og avstandsberegning — essensielt for leveringsapper, butikkfinnere, reiseapper og alt med stedsinformasjon.',
    recommended: 'mapbox',
    providers: [
      {
        id: 'mapbox', name: 'Mapbox',
        desc: 'Svært tilpasningsbar kartplattform med full designkontroll, 3D-terreng og offline-kart.',
        pros: ['Bransjens beste tilpasning via Mapbox Studio — farger, fonter, 3D, alt kan endres', 'Rike SDK-er for JS, iOS, Android med solid dokumentasjon', 'Avanserte funksjoner: offline-kart, heatmaps, 3D-terreng, AR-støtte'],
        cons: ['Geocoding med lagringsrett koster $5/1000 (vs $0.75 uten lagring)', 'Brattere læringskurve enn Google Maps, spesielt Mapbox Studio'],
        pricing: 'Gratis: 50K map loads + 100K geocoding/mnd. Deretter ~$0.50–1.00/1000.',
        bestFor: 'Prosjekter som trenger visuelt unike kart og full designkontroll — datavisualisering, reise- og navigasjonsapper.'
      },
      {
        id: 'radar', name: 'Radar',
        desc: 'Moderne geolokasjon-API med geocoding, geofencing og ruteplanlegging — designet for utviklere.',
        pros: ['Svært generøst gratistier: 100K API-kall/mnd gratis', 'Geofencing, IP-geolokasjon og reisedeteksjon inkludert', 'Enkel API med god dokumentasjon — raskere oppsett enn Google Maps'],
        cons: ['Ingen egne kartfliser — må kombineres med Mapbox/Google for kartvisning', 'Mindre kjent — mindre fellesskap og færre tutorials'],
        pricing: 'Gratis: 100K kall/mnd. Growth: fra $100/mnd.',
        bestFor: 'Apper som trenger geofencing, stedsdeteksjon eller geocoding uten å betale Google Maps-priser.'
      },
      {
        id: 'google-maps', name: 'Google Maps Platform',
        desc: 'Verdens mest komplette kartplattform med best geocoding-nøyaktighet og størst steddatabase.',
        pros: ['Beste geocoding-nøyaktighet globalt — 200+ land med rooftop-presisjon', 'Størst POI-database og mest kjente brukerflate', 'Place Autocomplete + Geocoding gir svært god adressesøk-UX'],
        cons: ['Strengeste lisensvilkår — data kan ikke lagres utenfor Google-kontekst', 'Dyrere enn alternativer — $200/mnd-kreditten fjernet i 2025'],
        pricing: 'Fra $7/1000 kartvisninger. Geocoding: $5/1000.',
        bestFor: 'Produksjonsapper der geocoding-nøyaktighet er kritisk — leveringstjenester, eiendom, enterprise.'
      },
      {
        id: 'leaflet-osm', name: 'Leaflet + OpenStreetMap',
        desc: 'Gratis open source-kart — Leaflet viser kartet, OpenStreetMap leverer dataene, null API-nøkkel.',
        pros: ['Fullstendig gratis — ingen API-nøkkel, ingen fakturer, ingen bruksgrenser for kartvisning', 'Kart på 5–10 linjer JavaScript — null avhengigheter i kjernen', 'Ingen leverandørlåsing — bytt datakilde uten å endre koden'],
        cons: ['Nominatim-geocoding begrenset til ~1 req/sek (offentlig server) — for prod trengs egen instans', 'Datakvalitet ujevn globalt — god i norske byer, men svakere internasjonalt'],
        pricing: 'Gratis (MIT-lisens). Geocoding via tredjepart: ~$0.50–2.00/1000.',
        bestFor: 'Interne verktøy, prototyper og budsjettbevisste apper der kostnad er viktigere enn geocoding-nøyaktighet.'
      }
    ]
  }
]
