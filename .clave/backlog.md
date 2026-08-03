## Phase 1: Foundation, data & calculation engine

### T1.1 — Scaffold Next.js 14 + TS + Tailwind with Lime tokens | Cx: 25 | P0
**Description:** Initialize a Next.js 14 App Router project in TypeScript with Tailwind, mirroring the Lime stack in `../lime-api-v2`. Add the `lime` color scale (50–900), CSS vars (`--accent #16a34a`, `--accent-light #dcfce7`, `--bg #f8faf9`, `--card #fff`, `--warning #f59e0b`) and the `popIn`/`slideUp`/`fadeIn` keyframes to `globals.css`. Add vitest + `test`/`typecheck` npm scripts.
**Acceptance Criteria:**
- [ ] `npm run typecheck` (`tsc --noEmit`) exits 0
- [ ] `npm run build` completes successfully
- [ ] `npx vitest run` exits 0 with at least one passing smoke test
- [ ] `tailwind.config.*` defines `colors.lime.500 === '#22c55e'` and `colors.lime.600 === '#16a34a'` (asserted by a vitest test importing the config)
**Depends on:** none

### T1.2 — Price/region/category data module | Cx: 40 | P0
**Description:** Create a typed `lib/data.ts` (or JSON + loader) holding categories (frizerstvo, brivstvo, kozmetični saloni, druge lepotne storitve), SI regions (osrednjeslovenska, celjska, maribor, primorska, gorenjska, ostalo) plus optional HR/RS, and an approximate average price per category×region. Include a documented `NOSHOW_REDUCTION = 0.6` and `LIME_MONTHLY_PRICE` constant, each with a source comment.
**Acceptance Criteria:**
- [ ] `getPrice(category, region)` returns a positive finite number for every valid category×region combination (vitest loops all combos)
- [ ] `getPrice` throws or returns a documented fallback for unknown keys (asserted)
- [ ] `CATEGORIES` and `REGIONS` arrays each have unique slug keys (vitest Set-size assertion)
- [ ] `NOSHOW_REDUCTION` is within [0.5, 0.7] and `LIME_MONTHLY_PRICE > 0` (asserted)
- [ ] Every category exposes a price entry for every region (no undefined gaps, asserted)
**Depends on:** T1.1

### T1.3 — Pure calculation engine | Cx: 45 | P0
**Description:** Implement `lib/calc.ts` with pure functions: normalize no-shows to monthly (`period: 'weekly'|'monthly'`, weekly ×4.33), `monthlyLoss = noShowsPerMonth × price`, `yearlyLoss = monthlyLoss × 12`, `yearlySaving = yearlyLoss × NOSHOW_REDUCTION`, `monthlySaving = yearlySaving / 12`, and `roiMonths = LIME_MONTHLY_PRICE / monthlySaving`. Add `roiTier(roiMonths)` returning `'green' | 'warning'` (green when < 2). Guard divide-by-zero.
**Acceptance Criteria:**
- [ ] Weekly input of 5 with price 30 yields `monthlyLoss ≈ 649.5` and `yearlyLoss ≈ 7794` (vitest, tolerance ±0.5)
- [ ] `yearlySaving === yearlyLoss * 0.6` for sampled inputs (asserted)
- [ ] `roiMonths` equals `LIME_MONTHLY_PRICE / monthlySaving` and returns `Infinity` (not NaN/throw) when no-shows = 0
- [ ] `roiTier` returns `'green'` for roiMonths < 2 and `'warning'` for ≥ 2 (boundary tested at 2)
- [ ] All calc functions are pure — same inputs give same outputs across repeated calls (asserted)
**Depends on:** T1.2

## Phase 2: URL state & SEO

### T2.1 — URL param serialization/parsing | Cx: 35 | P0
**Description:** Implement `lib/urlState.ts`: `parseParams(searchParams)` → validated `{category, region, noshows, period}` with safe defaults and clamping (noshows ≥ 0, valid enums only); `toQueryString(state)` producing `?category=…&region=…&noshows=…&period=…`. Round-trip stable.
**Acceptance Criteria:**
- [ ] `parseParams(toQueryString(state))` deep-equals the original valid state (round-trip vitest)
- [ ] Invalid/missing params resolve to documented defaults, never throw (asserted with garbage input)
- [ ] `noshows` is coerced to a non-negative integer; negatives/NaN clamp to 0 (asserted)
- [ ] Unknown category/region enum values fall back to the first valid option (asserted)
**Depends on:** T1.2

### T2.2 — Dynamic SEO metadata (generateMetadata) | Cx: 40 | P1
**Description:** Implement Next.js `generateMetadata({ searchParams })` in `app/page.tsx` that reads params via T2.1, computes yearly loss via T1.3, and returns `title` = "{Panoga} v {Regija}: letna izguba €{znesek} | Lime Savings Calculator", a `description` with the figure + CTA, and Open Graph tags. Configure ISR (`export const revalidate`). Extract a pure `buildMetadata(state)` for testing.
**Acceptance Criteria:**
- [ ] `buildMetadata` for a known state returns a `title` containing the localized category, region, and the computed euro figure (vitest)
- [ ] Returned object includes `openGraph.title`, `openGraph.description`, and `openGraph.images` (asserted non-empty)
- [ ] `description` is ≤ 160 characters (asserted)
- [ ] `npm run build` succeeds with `generateMetadata` and `revalidate` present (typecheck + build pass)
**Depends on:** T2.1, T1.3

## Phase 3: UI, interactivity & sharing

### T3.1 — Step components (category / region / no-shows) | Cx: 45 | P1
**Description:** Build controlled components `CategoryPicker`, `RegionPicker`, `NoShowInput` (slider + numeric, weekly/monthly toggle). Each is a pure controlled component taking `value`+`onChange`. Keep selection/formatting logic in exported helpers so it is headlessly testable without a DOM render.
**Acceptance Criteria:**
- [ ] `NoShowInput` helper clamps out-of-range slider/numeric values to [min,max] (vitest on the helper)
- [ ] Weekly/monthly toggle helper converts the displayed count correctly between modes (asserted)
- [ ] `CategoryPicker`/`RegionPicker` option lists are derived from `lib/data.ts` (length matches data, asserted via imported helper)
- [ ] Components typecheck with strict prop types (`tsc --noEmit` passes)
**Depends on:** T1.2, T1.3

### T3.2 — Results panel with ROI highlight | Cx: 40 | P1
**Description:** Build `ResultsPanel` rendering monthly/yearly loss, yearly saving, and "Lime Booking se povrne v X mesecih" with tier-based color (green < 2 months, warning otherwise) and the source footnote (no-show reduction study + Lime price source). Currency via a pure `formatEUR` helper (sl-SI). Animate value changes with the existing `popIn` class.
**Acceptance Criteria:**
- [ ] `formatEUR(1234.5)` returns a sl-SI formatted euro string (vitest, contains "€" and grouped digits)
- [ ] `roiLabel(state)` helper returns the expected "…v X mesecih" string and the correct tier for sampled inputs (asserted)
- [ ] A helper maps roiMonths to the `lime-*` (green) vs `warning` class — asserted at boundary 2
- [ ] Source footnote text is present in the rendered output helper/props (asserted non-empty string)
**Depends on:** T1.3

### T3.3 — Live URL sync + copy link + toast | Cx: 35 | P2
**Description:** Wire the page so state changes call `router.replace` with `toQueryString` (no reload) and hydrate initial state from `parseParams`. Add "Kopiraj povezavo" button using `navigator.clipboard` and react-hot-toast confirmation. Keep the URL-building side pure (covered by T2.1).
**Acceptance Criteria:**
- [ ] The URL builder used by the button produces a string that `parseParams` round-trips back to current state (vitest reuses T2.1 helpers)
- [ ] Copy handler is a thin wrapper over an injectable clipboard fn; a vitest with a mock clipboard asserts the full URL string is passed to it
- [ ] Copy handler resolves/rejects without throwing when the clipboard mock rejects (asserted)
- [ ] `tsc --noEmit` passes with react-hot-toast wired in
**Depends on:** T2.1, T3.1, T3.2

## Phase 4: Analytics & deployment config

### T4.1 — Analytics events + Vercel deploy config | Cx: 30 | P2
**Description:** Add Vercel Analytics and a typed `track(event)` wrapper firing `copy_link` and `cta_click` (Preizkusi Lime Booking → limebooking.si). Add the CTA button, `vercel.json`/env docs, and confirm production build. Keep `track` injectable so events can be asserted without a browser.
**Acceptance Criteria:**
- [ ] `track` calls the injected analytics sink with the exact event name for `copy_link` and `cta_click` (vitest with a spy)
- [ ] Event-name constants are a closed union; passing an unknown event fails typecheck (verified by a `// @ts-expect-error` line that `tsc` accepts)
- [ ] CTA href resolves to the configured Lime Booking URL constant (asserted)
- [ ] `npm run build` succeeds and `vercel.json` (or documented env in README) exists on disk
**Depends on:** T3.3