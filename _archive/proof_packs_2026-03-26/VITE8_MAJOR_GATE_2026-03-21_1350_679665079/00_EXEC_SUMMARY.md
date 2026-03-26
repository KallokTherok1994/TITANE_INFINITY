# 00 — EXEC SUMMARY
## Vite 8 + @vitejs/plugin-react 6 Readiness Gate

**Date:** 2026-03-21 13:50 UTC  
**SHA:** 679665079  
**Branch:** MAIN

---

## A) EXEC_MODE
BACKGROUND / GOVERNED MAJOR GATE — read-only analysis, no repo mutation

## B) SCOPE_RING
Ring 4 (build toolchain — vite, vitest, storybook, rolldown)

## C) RISK
LOW — discovery only, champion stack not modified

## D) PLAN
bootstrap → inventory → discovery → compatibility (npm info) → blocker classification → champion baseline proof → gates → trial decision → verdict

## E) PROOFS
Commands run (all read-only):
- `git status / rev-parse / log / branch`
- `pnpm list --depth=0` (ecosystem snapshot)
- `pnpm why vite / @vitejs/plugin-react / vitest`
- `cat vite.config.ts / vitest.config.ts / vitest.workspace.ts / .storybook/main.ts`
- `npm info vite@8 / @vitejs/plugin-react@6 / vitest@4.1.0 / @storybook/builder-vite@latest ...`
- `pnpm tsc --noEmit` → exit 0
- `pnpm build` → exit 0
- `bash scripts/verify_instructions.sh` → PASS=20 FAIL=0
- `bash scripts/autoheal/detect_recurrence.sh` → PASS

## F) ROLLBACK
No changes made to repo. Rollback is a no-op.
If trial is executed: `git restore -- package.json pnpm-lock.yaml vite.config.ts`

---

## FINDINGS (1–10)

1. **Champion:** vite@7.3.1, @vitejs/plugin-react@5.1.4, vitest@4.0.18 — all PASS
2. **vite@8.0.1** available; requires Node `^20.19.0 || >=22.12.0`; running Node v20.20.0 — NODE OK
3. **vite@8** ships rolldown@1.0.0-rc.10 as default bundler (replaces rollup) — SIGNIFICANT INTERNAL CHANGE
4. **vitest@4.0.18** has `dependencies.vite: '^6.0.0 || ^7.0.0'` — HARD BLOCKER: does not support vite@8; must upgrade to vitest@4.1.0
5. **@vitejs/plugin-react@5.1.4** peers `^4.2.0 ... ^7.0.0` — HARD BLOCKER: does not include vite@8; workaround: upgrade to 5.2.0 (peers include `^8.0.0`) or 6.0.1
6. **@storybook/builder-vite@10.3.1** peers `^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0` — NO BLOCKER
7. **@storybook/react-vite@10.3.1** peers `^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0` — NO BLOCKER
8. **rollup-plugin-visualizer@6.0.5** peers include `rolldown: '1.x || ^1.0.0-rc'` — NO BLOCKER
9. **vite.config.ts rollupOptions.treeshake** uses rollup-specific options (moduleSideEffects, propertyReadSideEffects, tryCatchDeoptimization) — CONFIG_MODE_BLOCK (soft; needs rolldown compat check)
10. **Verdict: QUALIFIED** — all peer blockers have workarounds; a minimal trial is feasible but requires vitest + plugin-react upgrade + rolldown config validation
