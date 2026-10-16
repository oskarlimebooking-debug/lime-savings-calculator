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
