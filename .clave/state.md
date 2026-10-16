# Current State

> Last updated: 2026-10-16 21:08

## What Was Just Done

**2026-10-16 23:09:** T1.2: Tipografija prestavljena z Geist/Arial na Inter. `layout.tsx` zdaj nalaga Inter prek `next/font/google` (`subsets: latin + latin-ext` zaradi šumnikov, `display: swap`, spremenljivka `--font-inter`), telo dobi `font-sans`. V `tailwind.config.ts` dodan `fontFamily.sans` (`var(--font-inter)` → system-ui → sans-serif) in cela Lime univerzalna lestvica kot `fontSize` žetoni: h1 24/32·600·−0.25px, h2 20/28, h3 18/26, h4 16/22, body-l 16/24, body-m 14/21, subtitle 13/18, caption 12/17, button 14/17, label 11/15·0.4px. Stari žetoni h1/body-m/caption so dobili nove (manjše, px) vrednosti, zato so se `ResultsPanel` in `SavingsChart` vizualno pomanjšali — razredi ostajajo isti, brez sprememb komponent. `globals.css` ne uporablja več Ariala. Geist woff datoteki odstranjeni z `git rm`. Nov `src/typography.test.ts` (4 testi, AC1–AC4); skupno 163 testov, typecheck, lint in build zeleni, Inter se v buildu self-hosta kot woff2.

**2026-10-16 23:05:** T1.1: Barvni tokeni zamenjani z Lime Booking paleto. V `tailwind.config.ts` dodan `brand` ključ (sage `#74B587`, cta `#548F68`, ctaHover `#447856`, ctaPressed `#3D6D4D`) ter semantični `focus`, `danger` `#F46969` in `default` `#8C8C8C`; `success` `#4FB870` in `warning` `#EDA300` sta že ustrezala specifikaciji. `accent` paleta zamenjana s pravo blagovno (vanilija, mango, breskev, bežev, sivka, hortenzija, plavica — 7 unikatnih hexov), `ACCENT` v `src/lib/ui.ts` usklajen z njo, graf zato zdaj riše s plavico in sivko iz blagovne palete. Stara `lime.*` lestvica je zdaj samo alias `sage` lestvice, tako da nemigrirani `lime-*` razredi (Calculator, RewardsSection, RewardCard, InfoModal) brez sprememb kode renderajo brand zeleno — brez vzporednega sistema. V `globals.css` posodobljene `--accent`, `--accent-light` (sage wash), `--bg #FAFAFA`, `--card #FFFFFF`, `--warning #EDA300`. `src/tailwind.config.test.ts` razširjen na 6 testov (AC1–AC4 + alias); 159 testov, typecheck, lint in build zeleni, v zgenerirani CSS je `.bg-lime-600` zdaj sage `#427354`.

**2026-10-16 17:05:** T2.1: Skupni slogovni primitivi in prenova izbirnikov zaključeni. Dodan `src/lib/ui.ts` s čistimi funkcijami `buttonClass` / `cardClass` / `badgeClass` / `chipClass` / `inputClass`, nova `sage` barvna lestvica v `tailwind.config.ts` (500 = CTA `#548F68`) in `./src/lib/**` v Tailwind `content`, da se razredi iz knjižnice dejansko generirajo. Vseh 7 izbirnikov (CategoryPicker, RegionPicker, PackagePicker, AddonsPicker, NoShowInput, PriceInput, LanguagePicker) zdaj uporablja primitive; v njih ni več nobenega `lime-` razreda. Brez sprememb logike ali props vmesnikov. 33 novih testov v `src/lib/ui.test.ts`; skupno 143 testov, typecheck, lint in produkcijski build zeleni. Prisotnost sage utilityjev preverjena tudi v zgenerirani CSS datoteki.

**2026-08-03 12:12:** T4.1: Vercel Analytics integration and deploy configuration fully implemented. Added a typed `track` wrapper with a closed union event type (`copy_link` | `cta_click`) supporting custom sink injection. Set up `vercel.json` deployment rules, updated `README.md` documentation, added the CTA button linking to `LIME_BOOKING_URL` with click tracking, and verified with 3 passing tests in Vitest. Production build, typecheck, and linter check pass cleanly.

**2026-08-03 12:08:** T3.3: Live URL sync + copy link + toast fully implemented. Enabled dynamic browser URL synchronization via `router.replace`, hydrated initial state with server-parsed `searchParams`, added a sharing URL copy handler with an injectable clipboard function, integrated custom `react-hot-toast` notifications, and covered by 3 new unit tests in Vitest. Build, typecheck, lint, and tests all pass cleanly.

**2026-08-03 12:03:** T3.2: ResultsPanel component and pure helpers (formatEUR, roiLabel, getRoiClass) fully implemented and tested. Added 6 new unit/component tests in vitest, and configured vitest to handle JSX with Oxc. Passed all linter, typecheck, and production build checks.

**2026-08-03 11:58:** T3.1: Step components (CategoryPicker, RegionPicker, NoShowInput) fully implemented as controlled components. Created pure business logic helpers in src/lib/stepHelpers.ts with 9 passing Vitest tests. Components are responsive, support dark mode, and typecheck successfully.

**2026-08-03 11:54:** T2.2: Dynamic SEO metadata (`generateMetadata`) in `src/app/page.tsx` fully implemented. Extracted a pure `buildMetadata(state)` and verified all 4 acceptance criteria via Vitest tests. Next.js builds, lint checks, and typechecks pass.

**2026-08-03 11:46:** T1.3: Pure calculation engine (`lib/calc.ts`) fully implemented, including period normalization, saving calculations, and ROI tiering. All 5 acceptance criteria verified with extensive Vitest tests.

**2026-08-03 09:34:** Engage run materialized

## What's Next

T1.2 — Inter tipografska lestvica namesto Geist/Arial

## Blockers

None.
