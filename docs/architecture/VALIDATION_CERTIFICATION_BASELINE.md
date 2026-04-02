# VALIDATION_CERTIFICATION_BASELINE
**Date**: 2026-03-26 | **Version**: 28.88.0

Hiérarchie honnête des preuves. Un green test n'est pas une certification produit.

---

## RÈGLE FONDAMENTALE

> **vitest PASS ≠ desktop proof.**
> STABLE nécessite: tsc + lint + vitest + build + cargo check PASS localement.
> SEALED nécessite: wdio+tauri-driver desktop E2E PASS (BLOCKED_ENV actuellement).

---

## CARTE DES VALIDATEURS

| Validateur | Commande | Scope réel | Force verdict | Condition d'exécution | Statut 2026-03-26 |
|-----------|----------|-----------|--------------|----------------------|-------------------|
| TypeScript check | `pnpm run check` | Types TS complet | STABLE_PARTIAL | local (jsdom) | ✅ PASS |
| ESLint | `pnpm run lint` | Style + règles | STABLE_PARTIAL | local | ✅ PASS |
| vitest (full) | `pnpm test` | Logic JS/TS — 3518 tests | STABLE_PARTIAL | local (jsdom/node) | ✅ 3518/3518 PASS |
| vitest unit | `pnpm test -c vitest.unit.config.ts` | Unit tests | STABLE_PARTIAL | local | PASS (sous-ensemble) |
| vitest integration | `pnpm test -c vitest.integration.config.ts` | Integration | STABLE_PARTIAL | local | PASS (sous-ensemble) |
| vitest browser | `pnpm run test:browser` | Browser API tests | QUALIFIED | browser headless | UNKNOWN (non run cette session) |
| Cargo check | `cargo check` | Types Rust | STABLE_PARTIAL | local | ✅ PASS |
| Cargo test | `pnpm run test:rust` | Logic Rust | QUALIFIED | local | PASS ciblé (non full cette session) |
| Vite build | `pnpm run build` | Bundle production | STABLE_PARTIAL | local | ✅ PASS |
| playwright | `pnpm run test:e2e` | Browser E2E | UNKNOWN | CI + browser | BLOCKED_ENV |
| wdio+tauri-driver | `wdio.desktop.conf.cjs` | Desktop certification | PROVEN_RUNTIME | Tauri runtime + hardware | BLOCKED_ENV |

---

## NIVEAUX DE PREUVE (du plus faible au plus fort)

```
UNKNOWN          — non exécuté ou environnement manquant
QUALIFIED        — preuve partielle, contexte limité
STABLE_PARTIAL   — preuve locale suffisante pour développement
PROVEN_RUNTIME   — preuve en conditions produit réelles (desktop)
SEALED           — toutes gates PROVEN_RUNTIME + rollback clair
```

---

## CE QUE CHAQUE VALIDATEUR PROUVE (et ne prouve PAS)

### vitest (3518 tests)
**Prouve**: logique TypeScript, comportement composants React (jsdom), services JS, mocks backend.
**Ne prouve PAS**: IPC Tauri réel, accès fichier natif, performances runtime, intégration Rust réelle.

### tsc --noEmit
**Prouve**: cohérence des types au moment de la compilation.
**Ne prouve PAS**: comportement runtime, erreurs async, types Rust/TS mismatch.

### cargo check
**Prouve**: compilation Rust, types Rust, coherence des features.
**Ne prouve PAS**: logique métier Rust, sécurité IPC, performance native.

### pnpm build (Vite)
**Prouve**: bundle générable, imports résolus, tree-shaking OK.
**Ne prouve PAS**: fonctionnement dans Tauri WebView, runtime natif.

### wdio+tauri-driver (BLOCKED_ENV)
**Prouve**: fonctionnement complet en conditions desktop réelles.
**Condition**: binary Tauri compilé + runtime disponible + écran ou Xvfb.
**Status**: BLOCKED_ENV — requis pour SEALED.

---

## SCRIPTS DISPONIBLES

| Usage | Script | Notes |
|-------|--------|-------|
| Validation rapide (quotidien) | `pnpm run check && pnpm run lint` | < 30s |
| Suite tests locale | `pnpm test` | ~130s, 3518 tests |
| Test:100 (vitest + browser) | `pnpm run test:100` | vitest + browser tests |
| Rust tests | `pnpm run test:rust` | cargo test --lib |
| Build | `pnpm run build` | Vite bundle |
| Verify complet (CI) | `pnpm run verify` | lint + check + tests + guards |
| E2E browser | `pnpm run test:e2e` | playwright — needs browser |
| Desktop E2E | `wdio` config | BLOCKED_ENV — needs Tauri binary |

---

## GATE POUR PROCHAINE RELEASE

Pour passer de STABLE à SEALED (v28.89.0 ou v28.x):
1. ✅ `pnpm run check` PASS
2. ✅ `pnpm run lint` PASS
3. ✅ `pnpm test` ≥ 3518/3518 PASS
4. ✅ `pnpm run build` PASS
5. ✅ `cargo check` PASS
6. ⬜ `pnpm run test:e2e` PASS (playwright)
7. ⬜ desktop E2E (wdio+tauri-driver) PASS — **gate principale pour SEALED**
8. ⬜ `pnpm run verify` PASS (CI complet)
