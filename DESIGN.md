# Oblikovni sistem — Lime Booking kalkulator prihranka

Edini vir resnice so žetoni v `tailwind.config.ts` in CSS spremenljivke v
`src/app/globals.css`. Komponente ne pišejo surovih vrednosti: razredi prihajajo
iz primitivov v `src/lib/ui.ts` (`buttonClass`, `chipClass`, `inputClass`,
`cardClass`, `badgeClass`). Dokument opisuje stanje po sprintih T1–T3; vsak
razdelek ima straž-test, ki prepreči tiho regresijo.

## Barve

| Žeton | Hex | Uporaba |
|---|---|---|
| `brand-sage` | `#74B587` | identiteta, fokus ring v obeh temah |
| `brand-cta` / `sage-500` | `#548F68` | polnilo primarnega gumba |
| `brand-ctaHover` | `#447856` | hover primarnega gumba |
| `brand-ctaPressed` | `#3D6D4D` | pressed primarnega gumba |
| `success` | `#4FB870` | pozitiven rezultat, ROI |
| `warning` | `#EDA300` | mejni rezultat |
| `danger` | `#F46969` | izguba, napaka |
| `default` | `#8C8C8C` | nevtralna oznaka |

Rampa `sage` (50–950) je edina zelena lestvica. Generična Tailwind `lime`
lestvica je odstranjena iz configa (T3.2) — ni več aliasa, na katerega bi se
dalo nasloniti.

Accent paleta (`accent.*`) je blagovna in služi **samo grafu**: vanilija
`#FDF6DD`, mango `#EDA300`, breskev `#F6DFDF`, bežev `#F7F3FA`, sivka
`#A881C6`, hortenzija `#E0ECF4`, plavica `#2D8CCA`. Graf riše s plavico
(prihranek) in sivko (preostala izguba); zelena v grafu ne nastopa, da se
donos ne bere kot blagovna znamka.

Kontrast: vsi pari telesnega besedila in površin dosegajo WCAG AA (≥ 4.5).
Preverja `contrastRatio(fg, bg)` v `src/lib/ui.ts`, zankano nad 16 pari v
`src/a11y.test.ts`.

## Tipografija

Inter (`next/font/google`, podmnožici `latin` + `latin-ext` zaradi šumnikov),
izpostavljen kot `--font-inter`, privzeto prek `font-sans`. Lestvica je
univerzalna — ista na vseh prelomih, brez odzivnih variant:

| Žeton | Velikost / višina vrstice | Teža |
|---|---|---|
| `text-h1` | 24 / 32, `-0.25px` | 600 |
| `text-h2` | 20 / 28, `-0.25px` | 600 |
| `text-h3` | 18 / 26 | 600 |
| `text-h4` | 16 / 22 | 600 |
| `text-body-l` | 16 / 24 | 400 |
| `text-body-m` | 14 / 21 | 400 |
| `text-subtitle` | 13 / 18 | 500 |
| `text-caption` | 12 / 17 | 400 |
| `text-button` | 14 / 17 | 500 |
| `text-label` | 11 / 15, `0.4px` | 500 |

`text-label` se vedno pari z `uppercase` (text-transform ni del žetona).

## Površine

Elevacija izhaja iz svetlosti, ne iz sence. Štiri stopnje, svetla in temna
tema ločeno:

| Sloj | Svetlo | Temno |
|---|---|---|
| canvas | `#FAFAFA` | `#121413` |
| card | `#FFFFFF` | `#1B1E1C` |
| panel | `#F5F5F7` | `#232624` |
| subtle | `#F0F0F0` | `#2B2E2C` |

Hairline obroba `line` `#F0F0F0` / `line-dark` `#2E322F`. Besedilo: `ink`
`#181818`, `ink-muted` `#5C5C5C`, `ink-subtle` `#8C8C8C` in temni ekvivalenti.
Radiji: `rounded-card` 12px, `rounded-control` 8px, `rounded-pill`. Edina
senca v sistemu je `shadow-modal` (modali in popoverji, samo svetla tema; v
temni se sesede na `none`).

Interakcija: vsak interaktiven element ima hover, focus in active stanje.
Fokus je vedno `focus-visible:ring-2 focus-visible:ring-brand-sage` — ring se
pokaže le pri tipkovnici in je enak v obeh temah. Minimalna dotikalna tarča je
44px (`min-h-11`).

Gibanje: kratki `ease-out` prehodi (0,18–0,25 s), brez overshoota; kaskada
nagrad se ustavi do 2,4 s, `prefers-reduced-motion` ugasne vse štiri aktivne
animacije.

## Prepovedi

- **Brez generične zelene.** `#22c55e`, `#16a34a` in `lime-*` razredi so
  prepovedani v celotnem `src/`; straž-test `src/brand.test.ts` jih šteje.
- **Brez surovih hexov v komponentah.** Barva pride iz žetona; izjema so
  inline stili tretjih knjižnic (npr. toast), ki morajo navesti žeton iz te
  tabele.
- **Brez generičnih sivin** (`gray-*`, `zinc-*`) za površine in besedilo —
  uporabi `surface-*`, `line`, `ink-*`.
- **Brez gradientov** in brez senc razen `shadow-modal`. Globina je razlika v
  svetlosti.
- **Brez `focus:ring`** in brez `outline-none` brez spremljajočega
  `focus-visible:ring`; ring ni nikoli druge barve kot `brand-sage`.
- **Brez odzivnih tipografskih variant** — lestvica je univerzalna.
- **Brez zelene v grafu**; serije uporabljajo izključno `accent.*`.
- **Brez `Create Next App`** in drugih privzetkov ogrodja v `metadata`.
