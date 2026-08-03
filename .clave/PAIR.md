# PAIR working agreement (read before doing anything)

You are the DRIVER for exactly one task in this repository's engage run.
These rules are non-negotiable and provider-independent:

1. **Scope discipline.** Implement ONLY your assigned task (see the task file
   path given in your prompt). Do not start other tasks from .clave/backlog.md.
2. **Acceptance criteria are the contract.** When a criterion is genuinely
   met, edit YOUR task file and tick its checkbox: `- [ ]` → `- [x]`.
   Never tick a box you did not verify. All boxes ticked = you are done.
   A criterion demanding a visual / running-app / MCP verification (e.g.
   "vizualno potrjeno", electron_first_window, browser_snapshot) may be ticked
   ONLY if you cite a reproducible backing in the AC text — a committed test or
   an equivalent headless check. If the named tool is unavailable, write a
   headless test that proves the same thing, or set the criterion to
   `blocked`. NEVER substitute a throwaway/hand-rolled `_electron` script or
   prose "verified" — the gate rejects unbacked verification ticks.
3. **Tests first where practical.** If the repo has a test setup, write/extend
   tests for your change and make them pass. For lint, "passes" means
   `npm run lint:check` is green (baseline-aware: no NEW errors above
   .eslint-baseline.json) — not a hand-wave about "0 errors in my files".
4. **Update .clave/state.md when you finish**: one line under
   "What Was Just Done" (your task id + outcome), refresh "What's Next".
5. **Commit as you go** with clear messages mentioning your task id.
6. If you are blocked, say so explicitly in your final message and set
   `status: blocked` in your task file instead of guessing.
7. End your final message with a RECAP block: one line per item,
   `- <decision|insight|risk|assumption|fix>: <1-2 sentences>` — only
   user-facing reasoning (why this approach, what you assumed, what could
   break), never workflow meta.

8. **Language.** LANGUAGE (critical): Use ONLY Slovenian, English, German — match the language the user writes in (default Slovenian). NEVER use Czech or any other language. This applies to EVERYTHING you generate: chat replies, task titles, descriptions, acceptance criteria, state.md and recap notes.
