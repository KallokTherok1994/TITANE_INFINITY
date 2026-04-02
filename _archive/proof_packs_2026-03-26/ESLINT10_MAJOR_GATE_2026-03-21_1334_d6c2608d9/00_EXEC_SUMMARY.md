# ESLint 10 Major Migration Gate — Executive Summary
**Date**: 2026-03-21 13:34 UTC
**Commit**: d6c2608d9
**Branch**: MAIN
**Gate type**: Champion-first, read-only ecosystem analysis

---

## A. Mission

Determine with proof whether ESLint 10 is truly ecosystem-blocked or only trial-blocked.
Champion (eslint 9.39.4) must be preserved at all times.
No packages installed during this analysis.

---

## B. Champion Baseline

| Item | Value |
|------|-------|
| eslint | 9.39.4 |
| @eslint/js | 9.39.4 |
| eslint-plugin-react | 7.37.5 |
| eslint-plugin-react-hooks | 7.0.1 |
| @typescript-eslint/eslint-plugin | 8.57.1 |
| @typescript-eslint/parser | 8.57.1 |
| eslint-plugin-react-refresh | 0.4.26 |
| eslint-plugin-storybook | 10.2.12 |
| eslint-config-prettier | 10.1.8 |

**Champion lint**: EXIT 0 — PASS
**Champion tsc**: EXIT 0 — PASS

---

## C. Blocker Summary

| Package | Installed | Latest | Peer Range | ESLint 10? | Severity | Workaround |
|---------|-----------|--------|-----------|-----------|----------|-----------|
| eslint-plugin-react | 7.37.5 | 7.37.5 | `^3‖^4‖^5‖^6‖^7‖^8‖^9.7` | **NO** | HARD | **NONE** |
| eslint-plugin-react-hooks | 7.0.1 | 7.0.1 | `^3‖^4‖^5‖^6‖^7‖^8‖^9.0` | **NO** | HARD | **NONE** |
| @typescript-eslint/eslint-plugin | 8.57.1 | 8.57.1 | `^8.57‖^9‖^10` | YES | — | n/a |
| eslint-plugin-react-refresh | 0.4.26 | 0.4.26 | `^9‖^10` | YES | — | n/a |
| eslint-plugin-storybook | 10.2.12 | 10.2.12 | `>=8` | YES | — | n/a |

**Additionally**: `eslint.config.js` uses `FlatCompat` + `.eslintrc.cjs` legacy compat layer.
ESLint 10 removes `@eslint/eslintrc` / legacy compat support entirely — requiring full flat-config migration.

---

## D. Key Findings (1-10)

1. `eslint-plugin-react@7.37.5` is the latest published version. Its peer dep hard-caps at `^9.7`.
2. `eslint-plugin-react-hooks@7.0.1` is the latest published version. Its peer dep caps at `^9.0.0`.
3. Neither plugin has any published version supporting ESLint 10 as of 2026-03-21.
4. ESLint 10 latest is `10.1.0`; `@eslint/js@10` latest is `10.0.1`.
5. `@typescript-eslint/eslint-plugin@8.57.1` explicitly supports ESLint 10 — not a blocker.
6. `eslint-plugin-react-refresh@0.4.26` supports ESLint `^9 || ^10` — not a blocker.
7. `eslint-plugin-storybook@10.2.12` supports `eslint >=8` — not a blocker.
8. The current `eslint.config.js` uses `FlatCompat` (legacy compat shim). ESLint 10 drops this entirely.
9. A migration to ESLint 10 would require: (a) react/react-hooks plugin upgrades — not yet available; (b) full native flat-config rewrite of `.eslintrc.cjs`.
10. Champion is certified STABLE: lint EXIT 0, tsc EXIT 0, no changes made.

---

## E. Trial Decision

**PEER_BLOCKED** — No trial justified.

Two critical plugins (`eslint-plugin-react`, `eslint-plugin-react-hooks`) have no published version supporting ESLint 10.
No isolated trial can resolve missing upstream peer support.

---

## F. Final Verdict

**VERDICT: PEER_BLOCKED**

ESLint 10 migration is ecosystem-blocked at the React plugin layer.
Champion (eslint 9.39.4) is retained and certified STABLE.
Re-evaluate when `eslint-plugin-react` and `eslint-plugin-react-hooks` publish ESLint 10–compatible releases.
