## Faza 1: Temelji oblikovnega sistema (tokeni)

### T1.1 — Zamenjava barvnih tokenov z Lime Booking paleto | Cx: 40 | P0
**Description:** Trenutni `tailwind.config.ts` uporablja generično Tailwind `lime` lestvico (`#22c55e`/`#16a34a`), ki ni Lime Booking blagovna znamka. Dodaj pravo paleto: brand sage `#74B587` (identiteta, focus ring, poudarki), CTA `#548F68` (hover `#447856`, pressed `#3D6D4D`), success `#4FB870`, warning `#EDA300`, danger `#F46969`, default `#8C8C8C`, ter accent paleto (vanilija `#FDF6DD`, mango `#EDA300`, breskev `#F6DFDF`, bežev `#F7F3FA`, sivka `#A881C6`, hortenzija `#E0ECF4`, plavica `#2D8CCA`) kot ločen `accent` ključ. V `globals.css` posodobi CSS spremenljivke (`--accent`, `--accent-light` → sage wash `rgba(116,181,135,.14)`, `--bg #FAFAFA`, `--card #FFFFFF`, `--warning #EDA300`). Stare `lime.*` ključe ohrani le kot alias, če jih kaj še uporablja — brez vzporednih sistemov.
**Acceptance Criteria:**
- [ ] Razširi `src/tailwind.config.test.ts`: `colors.brand.sage === '#74B587'`, `colors.brand.cta === '#548F68'`, `colors.brand.ctaHover === '#447856'` (vitest ob uvozu configa)
- [ ] Vitest trdi, da so vsi semantični ključi (`success`, `warning`, `danger`, `focus`) definirani in veljavni hex nizi (regex `/^#[0-9A-Fa-f]{6}$/`)
- [ ] Vitest prebere `src/app/globals.css` z `fs.readFileSync` in trdi, da `:root` vsebuje `--bg: #FAFAFA` in `--card: #FFFFFF`
- [ ] Vitest trdi, da `accent` paleta vsebuje natanko 7 ključev z unikatnimi hex vrednostmi
- [ ] `npm run typecheck` in `npm run build` končata z izhodom 0
**Depends on:** none

### T1.2 — Inter tipografska lestvica namesto Geist/Arial | Cx: 35 | P0
**Description:** `layout.tsx` nalaga Geist, `globals.css` pa telo postavi na `Arial, Helvetica, sans-serif`. Preklopi na Inter (`next/font/google` ali lokalni woff2) in dodaj Lime univerzalno lestvico kot Tailwind `fontSize` tokene — ista na vseh prelomnih točkah: H1 24/32·600·−0.25px, H2 20/28·600·−0.25px, H3 18/26·600, H4 16/22·600, body-l 16/24·400, body-m 14/21·400, subtitle 13/18·500, caption 12/17·400, button 14/17·500, label 11/15·500 uppercase 0.4px. Odstrani neuporabljene Geist woff datoteke.
**Acceptance Criteria:**
- [ ] Vitest trdi, da `config.theme.extend.fontSize` vsebuje ključe `h1,h2,h3,h4,body-l,body-m,subtitle,caption,button,label` z ujemajočimi se pari velikost/višina vrstice (npr. `h1 === ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.25px' }]`)
- [ ] Vitest prebere `src/app/layout.tsx` in trdi, da vsebuje `Inter` ter ne vsebuje več niza `Geist`
- [ ] Vitest prebere `globals.css` in trdi, da `font-family` ne vsebuje več `Arial`
- [ ] Datoteki `src/app/fonts/GeistVF.woff` in `GeistMonoVF.woff` ne obstajata več (`fs.existsSync === false`)
- [ ] `npm run build` končа z izhodom 0
**Depends on:** T1.1

### T1.3 — Površine, radiji, senčenje in temna tema | Cx: 45 | P0
**Description:** Dodaj Lime površinske sloje kot tokene: svetla tema canvas `#FAFAFA` → kartice `#FFFFFF` → paneli `#F5F5F7` → subtilna polnila `#F0F0F0`, ločilnice `#F0F0F0`, besedilo `#181818`/`#5C5C5C`/`#8C8C8C`. Temna tema: `#121413` → `#1B1E1C` → `#232624` → `#2B2E2C`, hairline `#2E322F`, besedilo `#F2F3F1`/`#B1B5B2`/`#8B8F8D`, **brez senc** (elevacija samo s svetlostjo). Radiji: kartice 12px, gumbi/inputi 8px, chipi pill. Razmiki na 4pt osnovi. Senčenje le za modale/popover v svetli temi. Obstoječi `@media (prefers-color-scheme: dark)` blok razširi na vse površine.
**Acceptance Criteria:**
- [ ] Vitest trdi, da Tailwind `borderRadius` vsebuje `card: '12px'`, `control: '8px'`, `pill: '9999px'`
- [ ] Vitest trdi, da `colors.surface` vsebuje vse štiri svetle in vse štiri temne stopnje z unikatnimi vrednostmi
- [ ] Vitest prebere `globals.css` in trdi, da blok `prefers-color-scheme: dark` definira `--bg: #121413` in `--card: #1B1E1C`
- [ ] Vitest trdi, da noben `box-shadow` ni definiran znotraj temnega bloka v `globals.css` (regex preverjanje izseka bloka)
- [ ] `npm run typecheck` končа z izhodom 0
**Depends on:** T1.1

## Faza 2: Prenova komponent

### T2.1 — Skupni slogovni primitivi in prenova izbirnikov | Cx: 55 | P1
**Description:** Ustvari `src/lib/ui.ts` s čistimi funkcijami, ki vračajo nize razredov: `buttonClass(variant: 'primary'|'secondary'|'ghost', size)`, `cardClass(elevated?)`, `badgeClass(status)`, `chipClass(selected)`. Primarni gumb = CTA `#548F68` z belo oznako, hover/pressed stopnje, fokus sage ring. Nato prepiši `CategoryPicker`, `RegionPicker`, `PackagePicker`, `AddonsPicker`, `NoShowInput`, `PriceInput`, `LanguagePicker` tako, da uporabljajo te primitive namesto podvojenih ad-hoc razredov. Brez sprememb logike ali props vmesnikov — samo vizualni sloj.
**Acceptance Criteria:**
- [ ] Vitest: `buttonClass('primary')` vrne niz s CTA razredom in fokus ring razredom; `buttonClass('ghost')` ne vsebuje polnila ozadja (trditve na nizu)
- [ ] Vitest: `chipClass(true) !== chipClass(false)` in izbrana varianta vsebuje sage wash razred
- [ ] Vitest: `badgeClass` za vseh 6 statusov vrne unikatne nize in nikoli prazen niz
- [ ] Vitest prebere vseh 7 prenovljenih komponent in trdi, da nobena ne vsebuje več surovih `bg-lime-` razredov
- [ ] Obstoječi testi (`AddonsPicker.test.tsx`, `PackagePicker.test.tsx`, `PriceInput.test.tsx`, `LanguagePicker.test.tsx`) še naprej prehajajo nespremenjeni
**Depends on:** T1.1, T1.2, T1.3

### T2.2 — Prenova rezultatskega panela in grafa | Cx: 50 | P1
**Description:** Prenovi `ResultsPanel`, `SavingsChart` in `AutoFitAmount` po Lime hierarhiji: glavna številka v H1 tokenu, podporne vrednosti v body-m, viri v caption. ROI poudarek naj uporablja success `#4FB870` oziroma warning `#EDA300` prek obstoječega `getRoiClass` helperja — posodobi le preslikavo razredov, ne mejnih vrednosti. Graf naj uporablja accent paleto (plavica/sivka), ne treh zelenih. Ploske površine, brez gradientov.
**Acceptance Criteria:**
- [ ] Vitest: `getRoiClass` vrne success-token razred za roiMonths < 2 in warning-token razred za ≥ 2, testirano na meji 2 (obstoječi test razširjen)
- [ ] Vitest: pomožna funkcija barv grafa vrne izključno vrednosti iz accent palete (preverjeno proti uvoženemu `accent` objektu iz Tailwind configa)
- [ ] Vitest prebere `SavingsChart.tsx` in `ResultsPanel.tsx` ter trdi, da ne vsebujeta `gradient`
- [ ] Obstoječi `ResultsPanel.test.tsx` in `SavingsChart.test.tsx` prehajata brez sprememb trditev o vsebini
- [ ] `npm run typecheck` končа z izhodom 0
**Depends on:** T2.1

### T2.3 — Umirjena animacija po Lime pravilih | Cx: 40 | P2
**Description:** Lime dovoljuje le kratke prelive in ease prehode — brez odbojev in dekorativnega vrtenja. Trenutni `popIn` in `rewardSettle` uporabljata `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot). Zamenjaj z ease-out krivuljami, skrajšaj trajanja, `reelSpin` ohrani (je funkcionalen del nagradnega mehanizma), a skrajšaj `SETTLE_MS` kaskado v `RewardsSection.tsx`. Preveri, da `prefers-reduced-motion` blok pokriva vse aktivne animacije.
**Acceptance Criteria:**
- [ ] Vitest prebere `globals.css` in trdi, da noben `animation` ne uporablja krivulje s kontrolno točko > 1 (regex na `cubic-bezier`)
- [ ] Vitest trdi, da `prefers-reduced-motion` blok našteje vsa imena animacijskih razredov, ki so definirana v datoteki (izpeljan seznam, ne trdo kodiran)
- [ ] Vitest: izvožena konstanta `SETTLE_MS` je naraščajoče zaporedje in zadnji element ≤ 3000
- [ ] Obstoječi `RewardsSection.test.tsx` prehaja nespremenjen
**Depends on:** T2.1

## Faza 3: Dostopnost, znamka in zaključek

### T3.1 — Fokus ring, kontrast in dotikalne tarče | Cx: 40 | P1
**Description:** Vsak interaktiven element dobi vse tri stanja (hover / focus / active). Fokus je vedno sage `#74B587` ring v obeh temah. Minimalna dotikalna tarča 44px na mobilnem. Dodaj čisto pomožno funkcijo `contrastRatio(fg, bg)` v `src/lib/ui.ts` in z njo v testih preveri uporabljene pare besedilo/ozadje.
**Acceptance Criteria:**
- [ ] Vitest: `contrastRatio('#FFFFFF', '#447856') >= 4.5` in `contrastRatio('#181818', '#FAFAFA') >= 4.5`
- [ ] Vitest: vsi pari telesnega besedila iz tokenov (svetla in temna tema) dosežejo ≥ 4.5 (zankan test nad preslikavo parov)
- [ ] Vitest: `buttonClass` za vse variante in velikosti vrne razred z minimalno višino ≥ 44px (`min-h-11` ali ekvivalent)
- [ ] Vitest prebere vse datoteke v `src/components` in trdi, da nobena ne uporablja `outline-none` brez spremljajočega `focus-visible:ring`
**Depends on:** T2.1, T2.2

### T3.2 — Čiščenje stare palete, znamka in DESIGN.md | Cx: 35 | P2
**Description:** Odstrani zadnje ostanke stare generične zelene iz celotnega `src/`, zamenjaj privzeto `metadata` v `layout.tsx` ("Create Next App") z Lime naslovom in opisom, dodaj Lime petal favicon/mark in logotip SVG v `public/`. Zapiši `DESIGN.md` z izpeljanim oblikovnim sistemom (tokeni, uporaba, prepovedi) in dodaj straž-test, ki prepreči regresijo nazaj na staro paleto.
**Acceptance Criteria:**
- [ ] Vitest straž-test prečeše vse datoteke v `src/` in trdi 0 pojavitev `#22c55e`, `#16a34a` in `lime-500`
- [ ] Vitest trdi, da `layout.tsx` ne vsebuje niza `Create Next App` in da je izvožen `metadata.title` neprazen ter vsebuje "Lime"
- [ ] Datoteke `public/logo-primary.svg` in `public/favicon-circle.svg` obstajajo in so neprazne (`fs.statSync().size > 0`)
- [ ] `DESIGN.md` obstaja in vsebuje razdelke "Barve", "Tipografija", "Površine", "Prepovedi" (preverjeno z branjem datoteke v vitestu)
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` in `npm run test` vsi končajo z izhodom 0
**Depends on:** T2.3, T3.1