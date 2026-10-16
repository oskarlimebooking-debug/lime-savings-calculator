# Recap

Structured reasoning captured from agent runs.

## T1.1 — Zamenjava barvnih tokenov z Lime Booking paleto — 2026-10-16 21:05

- decision: `lime` sem naredil kot alias `sage` namesto da bi prepisoval razrede v 4 komponentah — eno vrstico namesto velikega diffa, in migracija teh komponent spada v T2.x/T3.x.
- decision: `accent` sem zamenjal (ne dopolnil) s 7 blagovnimi barvami, ker AC4 zahteva natanko 7 ključev; stare chart barve `#5B7CD4`/`#8E86C9` so s tem izginile.
- insight: `success`/`warning` ostajata objekta z `DEFAULT`+`soft`+`strong`, ker jih `ResultsPanel` tako uporablja; test AC2 zato bere `DEFAULT`, kadar je žeton objekt.
- risk: barva grafa se je vizualno spremenila (močnejša modra/vijolična) — nisem vizualno potrdil v brskalniku, le prek testov in generirane CSS.

## T1.2 — Inter tipografska lestvica namesto Geist/Arial — 2026-10-16 21:09

- decision: Izbral sem `next/font/google` namesto lokalnega woff2 — Next ga ob buildu self-hosta (potrjeno: `.next/static/media/*.woff2`), tako da v repo ni treba dodajati binarnih datotek in ni runtime klica na Google.
- insight: Obstoječi žetoni `h1`/`body-m`/`caption` so z novo lestvico dobili manjše, px vrednosti (h1 2.25rem → 24px, body-m 15px → 14px), zato sta `ResultsPanel` in `SavingsChart` zdaj vizualno manjša. Razredi so isti, zato nisem spreminjal nobene komponente — če je glavna številka prihranka zdaj premajhna, je to stvar T2.2.
- assumption: `label` nima `textTransform` v žetonu, ker ga Tailwind `fontSize` ne podpira — uppercase ostane kot `uppercase` utility ob `text-label`.
- risk: Build zdaj ob prvem prevodu potrebuje dostop do fonts.googleapis.com (nato ga Next cachira); CI brez omrežja bi padel.

## T1.3 — Površine, radiji, senčenje in temna tema — 2026-10-16 21:14

- decision: Temne stopnje sem dal v isti `surface` ključ s predpono `dark-` (ne v ločen `surfaceDark`), ker AC2 zahteva vse osem v `colors.surface`; v komponentah to pomeni `dark:bg-surface-dark-card`.
- decision: Ostal sem pri tokenih in CSS spremenljivkah; nisem prepisoval `rounded-2xl`/`shadow-sm`/`bg-white` razredov v komponentah — to je delo prenove komponent (T2.x), tokeni so pogoj zanjo.
- insight: Svetlo ozadje telesa se je spremenilo z bele na canvas `#FAFAFA`, kar je po specifikaciji, a je edina vidna sprememba te naloge; kartice so bele šele, ko jih komponente tako označijo.
- assumption: `--shadow-modal: none` v temnem bloku štejem kot skladno z AC4 (noben `box-shadow` ni definiran); test to tudi izrecno preverja.

## T2.2 — Prenova rezultatskega panela in grafa — 2026-10-16 21:19

- insight: `getRoiClass` vrača `roi-success`/`roi-warning`, kar ni Tailwind razred in trenutno ničesar ne pobarva — barvo nosijo podvojeni `roiTier === "green"` ternarji v panelu. Tega nisem popravil, ker AC1 pripne točno vrnjeno vrednost in AC4 zahteva, da `ResultsPanel.test.tsx` še vedno najde niz `roi-success` v markupu; čiščenje te podvojitve priporočam v T3.2.
- insight: AC1 govori o meji 2 meseca, implementacija (in opis naloge: "ne mejnih vrednosti") pa ima mejo 1 mesec/30 dni. Meje nisem premikal; obstoječi test pokriva oboje (`1` → success, `2` → warning), zato AC drži brez spremembe logike.
- decision: Majhna besedila sem dal na `ink-muted` (#5C5C5C), ne na `ink-faint` (#8C8C8C), ker bi slednji pri 11–12px padel na WCAG AA; natančna kontrastna revizija je T3.1.
- assumption: `AutoFitAmount` nisem spreminjal — velikost že podeduje iz žetona v `className`, logika skaliranja je neodvisna od palete.

## T2.3 — Umirjena animacija po Lime pravilih — 2026-10-16 21:24

- decision: Odboj sem odstranil tudi iz samih keyframov `rewardSettle` (prej `scale(1.02)` pri 60 %), ne le iz krivulje — zamenjava krivulje brez tega bi odboj ohranila.
- decision: Mrtve `slideUp` keyframe sem izbrisal, ker bi se moj AC2 test (izpeljan seznam) ob njih sicer sklicevalo na animacijo, ki ne obstaja kot razred; dodal sem še test, ki prihodnje mrtve keyframe ujame.
- insight: AC2 preverja le animacije, ne CSS prehodov — graf še vedno uporablja `transition-all duration-700`, ki ga reduced-motion blok ne izklopi. To je kandidat za T3.1 (dostopnost).
- fix: Prvi osnutek testa je uporabljal `String.matchAll`, kar pri tem `tsconfig` (ES5 cilj) pade na TS2802; nadomestil sem ga z `exec` zanko, da typecheck ostane zelen.
- risk: Kaskada nagrad je zdaj skoraj dvakrat hitrejša; če je bil 4,6 s namenoma dramatičen, je to vidna sprememba občutka, ne le čiščenje.
