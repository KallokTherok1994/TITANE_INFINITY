# Blocker Classification

## Blocker 1: eslint-plugin-react

| Field | Value |
|-------|-------|
| Installed | 7.37.5 |
| Latest | 7.37.5 |
| Peer range declared | `^3 \|\| ^4 \|\| ^5 \|\| ^6 \|\| ^7 \|\| ^8 \|\| ^9.7` |
| Includes ESLint 10? | **NO** |
| Severity | **HARD** — peer mismatch causes npm/pnpm install conflict and may cause runtime errors |
| Workaround available? | **NO** — 7.37.5 is the latest; no version in the last 10 releases supports ESLint 10 |
| Re-evaluate when | A new `eslint-plugin-react` release is published with `^10` in peer range |

**Evidence**: `npm info eslint-plugin-react@latest peerDependencies` → `{ eslint: '^3 || ... || ^9.7' }`
No `^10` or `>=10` present. Confirmed across last 10 published versions.

---

## Blocker 2: eslint-plugin-react-hooks

| Field | Value |
|-------|-------|
| Installed | 7.0.1 |
| Latest | 7.0.1 |
| Peer range declared | `^3.0.0 \|\| ^4.0.0 \|\| ^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0-0 \|\| ^9.0.0` |
| Includes ESLint 10? | **NO** |
| Severity | **HARD** — same as above; peer conflict prevents clean install |
| Workaround available? | **NO** — 7.0.1 is the latest version; no ESLint 10 support |
| Re-evaluate when | A new `eslint-plugin-react-hooks` release is published with `^10` in peer range |

**Evidence**: `npm info eslint-plugin-react-hooks@latest peerDependencies` → caps at `^9.0.0`.

---

## Blocker 3: FlatCompat / @eslint/eslintrc (Config Blocker)

| Field | Value |
|-------|-------|
| Current | Uses `FlatCompat` from `@eslint/eslintrc@3.3.5` in `eslint.config.js` |
| ESLint 10 behavior | ESLint 10 removes `@eslint/eslintrc` entirely |
| Severity | **CONFIG** — requires full native flat-config rewrite of `.eslintrc.cjs` |
| Workaround available? | YES (requires effort) — rewrite `.eslintrc.cjs` into native flat config objects |
| Blocking migration? | Secondary blocker — only relevant after Blockers 1+2 are resolved |

**Evidence**: ESLint 10 migration guide explicitly removes FlatCompat support.
Current `eslint.config.js` line: `const compat = new FlatCompat(...)` + `compat.config(legacyConfig)`.

---

## Classification Summary

- **PEER_BLOCKED**: 2 hard blockers with no upstream workaround available as of 2026-03-21.
- **CONFIG_MIGRATION_REQUIRED**: 1 config blocker (solvable with effort, but irrelevant until peer blockers resolved).
- **Overall**: `PEER_BLOCKED` — ecosystem not ready for ESLint 10.
