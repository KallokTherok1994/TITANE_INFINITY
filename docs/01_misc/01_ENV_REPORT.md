# 01_ENV_REPORT.md — Environment Report
**Generated:** 2026-02-28T16:13:09Z  
**Pack:** PREP_BG_2026-02-28_1613_a8b70c2

## Tool Versions

| Tool    | Version         | Status    |
|---------|-----------------|-----------|
| node    | v18.19.1        | ✅ OK      |
| npm     | 9.2.0           | ✅ OK      |
| pnpm    | NOT FOUND (not in PATH, uses node_modules/.bin via npm/npx) | ⚠️ WARN |
| cargo   | 1.91.1 (ea2d97820 2025-10-10) | ✅ OK |
| rustc   | 1.91.1 (ed61e7d7e 2025-11-07) | ✅ OK |

## pnpm Resolution

pnpm n'est pas dans le PATH système mais les deps `node_modules/` sont installées (pnpm lockfile présent).
Toutes les commandes pnpm doivent être exécutées via `node node_modules/.bin/<tool>` ou en préfixant avec `npx pnpm`.

## OS

- Linux (Ubuntu/Debian based)
- Arch: x86_64

## Verdict ENV

- WARN: pnpm absent du PATH. Workaround: `npx pnpm` ou `node_modules/.bin/<vitest|cross-env>` directement.
- node/cargo/rustc: OK → tests et builds possibles.
