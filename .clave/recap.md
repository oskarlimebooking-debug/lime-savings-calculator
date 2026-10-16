# Recap

Structured reasoning captured from agent runs.

## T1.1 — Zamenjava barvnih tokenov z Lime Booking paleto — 2026-10-16 21:05

- decision: `lime` sem naredil kot alias `sage` namesto da bi prepisoval razrede v 4 komponentah — eno vrstico namesto velikega diffa, in migracija teh komponent spada v T2.x/T3.x.
- decision: `accent` sem zamenjal (ne dopolnil) s 7 blagovnimi barvami, ker AC4 zahteva natanko 7 ključev; stare chart barve `#5B7CD4`/`#8E86C9` so s tem izginile.
- insight: `success`/`warning` ostajata objekta z `DEFAULT`+`soft`+`strong`, ker jih `ResultsPanel` tako uporablja; test AC2 zato bere `DEFAULT`, kadar je žeton objekt.
- risk: barva grafa se je vizualno spremenila (močnejša modra/vijolična) — nisem vizualno potrdil v brskalniku, le prek testov in generirane CSS.
