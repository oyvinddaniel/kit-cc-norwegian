---
name: M:mobil-beroring
version: 1.0
applies_to:
  paths: []
  contexts: [mobil, touch, gestures, responsive, tablet, pwa, native-app]
last_reviewed: 2026-05-13
skip_if: kun hvis appen utelukkende kjører på desktop med mus/tastatur (sjelden)
ekspert_trigger: [CROSS-BROWSER-ekspert, TILGJENGELIGHETS-ekspert]
---

# Mønster: Mobil-berøring

> Brukes når mobil-bruk er aktuelt. Gjelder alltid hvis appen skal fungere på telefon eller nettbrett, eller skal være responsive ned til touch-bredder.
>
> Komplementerer M:tilgjengelighet — touch har egne krav utover skjermleser/tastatur. NB: WCAG 2.2 2.5.8 (Target Size 24×24 CSS-px) er nytt og obligatorisk.

---

## Når brukes dette mønsteret
- Når appen vises på smarttelefon eller nettbrett
- Når responsive design krever touch-vennlighet
- Når PWA eller native wrapper (Capacitor, React Native) bygges
- Når gester (sveip, pinch, long-press) introduseres

## Når brukes det IKKE
- Rent admin-verktøy, kun desktop med mus → M:tilgjengelighet alene holder
- Server-side scripts uten UI → ingen mønster

## Skip-regel
Kun hvis klassifiseringen eksplisitt utelater mobil OG ingen responsive nedskalering planlegges.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Størrelse på trykk-mål (NY VEKT: WCAG 2.2 2.5.8)
- Alle trykk-mål ≥ 24×24 CSS-piksler (WCAG 2.2 AA minimum)?
- Anbefalt for komfort: ≥ 44×44 px (iOS HIG) / ≥ 48×48 px (Material)?
- Avstand mellom naboer ≥ 24 px hvis selve målet er mindre?
- Små ikoner har usynlig utvidet trykkområde (padding, ::before-overlay)?
- Standardvalg: 44×44 px med 8 px gap

### Gruppe 2 — Gester
- Sveip venstre/høyre — hva gjør det? (slett, bla, arkiv)
- Sveip opp/ned — oppdater, lukk, scroll
- Pinch-to-zoom — støttet der relevant (bilder, kart)
- Long-press — kontekstmeny

### Gruppe 3 — Alternativer til gester (WCAG 2.2 2.5.7)
- Alle gester har synlig alternativ (knapp, meny)?
- Sveip-for-slett: også slett-knapp via tap/meny?
- Drag-sortering: også flytt-via-meny eller piltaster?
- Pinch-zoom: også +/- knapper?

### Gruppe 4 — Tastatur på mobil
- Riktig `inputmode`/`type` per felt (tel, email, url, numeric, decimal, search)?
- Søkefelt med `enterkeyhint="search"`?
- Autokomplett påskrudd der nyttig, avskrudd for sensitive felt?
- `autocapitalize` og `autocorrect` justert per kontekst?

### Gruppe 5 — Tastatur og safe-area
- Send-knapp synlig over tastatur (visualViewport API eller safe-area)?
- Rullbar område når tastatur åpent, fokus flyttes opp automatisk?
- Notch/dynamic island/avrundede hjørner via `env(safe-area-inset-*)`?
- Status-bar/hjemme-indikator overskygger ikke knapper?

### Gruppe 6 — Orientering
- Fungerer både portrait og landscape, reflower på 320 px?

### Gruppe 7 — Ytelse på touch
- Animasjoner glidende (60 fps, 120 på ProMotion)?
- Tap-respons < 100ms (ingen 300ms-forsinkelse)?
- Bilder lazy-loaded, ikoner som SVG/font, scroll-listeners passive?

### Gruppe 8 — Nettverk, haptikk og plattform
- Fungerer offline? Svak forbindelse — varsler? Synk ved gjenoppkobling?
- Vibrasjon ved viktige handlinger (suksess/feil/slett), kan skrus av?
- iOS Dynamic Type / Android font-skala respekteres?
- VoiceOver (iOS) / TalkBack (Android) testet?
- PWA: install-prompt, splash, ikoner i alle størrelser?

---

## Tilstander
- **Idle** — touch-target synlig, tilstrekkelig hit-area
- **Pressed** — visuell feedback < 100ms (highlight, scale 0.97)
- **Long-pressing** — progress-indikator hvis > 500ms
- **Dragging** — element følger finger, drop-zoner highlighted
- **Loading** — skeleton/spinner, ikke blokker hele UI
- **Offline** — banner øverst, handlinger queues lokalt

---

## Tilgjengelighet (WCAG 2.2)
- **2.5.8 Target Size Minimum (AA) — NY i 2.2:** Touch-mål ≥ 24×24 CSS-px. 44×44 anbefales.
- **2.5.7 Dragging Movements (AA) — NY i 2.2:** Drag-handlinger har single-pointer-alternativ.
- 2.5.1 Pointer Gestures (A) — komplekse gester (multi-touch, path) har enkelt alternativ
- 2.5.2 Pointer Cancellation (A) — handling på up-event, ikke down
- 2.5.4 Motion Actuation (A) — shake/tilt har knapp-alternativ
- 1.3.4 Orientation (AA) — fungerer portrait+landscape, ikke lås uten grunn
- 1.4.10 Reflow (AA) — 320 CSS-px uten 2D-scroll
- 1.4.12 Text Spacing (AA) — tåler økt linje-/bokstav-mellomrom

Marker `[VERIFISER WCAG]` hvis touch-mål kontekstuelt må være mindre (kart-pins, tekst-cursor).

---

## Kanttilfeller
- Veldig stor system-font (200% tekst) — layout må tåle
- Bruker roterer midt i handling — state bevares
- Tastatur-språk skiftes midt i input
- Notifikasjon over appen — state ved retur
- Pull-to-refresh utløses utilsiktet av scroll-til-topp
- iOS Safari rubber-band skjuler fixed-elementer
- Android back-gesture konflikter med sveip-for-slett
- Multi-touch utilsiktet (to fingre på samme knapp)

---

## Anti-mønster
- ❌ Trykk-mål < 24×24 px (bryter 2.5.8)
- ❌ Sveip-for-slett uten knapp-alternativ (bryter 2.5.7)
- ❌ Hover-state som eneste affordance (finnes ikke på touch)
- ❌ `:hover`-tooltip med kritisk info
- ❌ Disabled paste i passord-felt (bryter 3.3.8)
- ❌ Fixed footer som dekker input når tastatur åpnes
- ❌ Egne scroll-implementasjoner som ikke matcher native momentum

---

## Eksempler

**1: Liste med sveip-handlinger** — sveip venstre avslører "Slett"/"Arkiver". Hver rad har også kebab-meny med samme handlinger (2.5.7). Knapp-områder 44×44 px min.

**2: Skjema på mobil** — `type="email"` + `inputmode="email"` + `autocomplete="email"`. Send-knapp festet til bunn via visualViewport. Feil inline, fokus til første feil.

**3: Bilde-galleri** — pinch-zoom + dobbeltrykk-zoom. +/- knapper synlige (alternativ — 2.5.7). Sveip mellom bilder + piler.

---

## Relaterte mønstre
- M:tilgjengelighet — base for WCAG-krav
- M:skjema — input-typer og validering på mobil
- M:slett — sveip-for-slett-mønstre

## Versjon
**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
