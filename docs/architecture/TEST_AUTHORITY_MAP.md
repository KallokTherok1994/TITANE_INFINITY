# TEST_AUTHORITY_MAP
**TITANE∞ — Cartographie de l'autorité de test et validation**
**Date**: 2026-03-26
**Phase**: PHASE 9 — VÉRITÉ DE TEST ET VALIDATION
**Sources**: `TEST_STACK_DISCOVERY.md`, `vitest.config.ts`, `wdio.desktop.conf.cjs`, `playwright.config.ts`, `src-tauri/Cargo.toml`
**Verdict**: QUALIFIED

---

## Toolchain de validation (prouvée)

| Tool | Version | Layer | Rôle |
|------|---------|-------|------|
| `vitest` | — | Frontend unit/integration | Tests JS/TS: hooks, services, orchestration |
| `playwright` | — | Browser E2E | Tests navigateur (non-desktop) |
| `wdio` + `tauri-driver` | — | Desktop E2E (Tauri/WRY) | Tests desktop réels via WebDriverIO |
| `cargo test` | Rust 1.94 | Rust unit/integration | Tests backend Rust: memory OS, IPC, pipeline |
| `tsc --noEmit` | — | TypeScript | Vérification types |

---

## Voie 1 — Unit / Integration Frontend (CANONICAL)

```
Tool: vitest
Config: vitest.config.ts (principal), vitest.unit.config.ts, vitest.integration.config.ts
Commande: pnpm run test (ou pnpm exec vitest run)
Résultats derniers: 3399 tests PASS (v28.88.0 — 2026-03-22)
Mocks Tauri: tests/mocks/tauri.ts, tauriCore.ts, tauriEvent.ts
```

**Règle**: les tests vitest sont des tests **browser/node simulés**. Ils ne prouvent pas le runtime Tauri desktop réel.

**Verdicts corrects**:
- vitest PASS → `STABLE_PARTIAL` (pas `PROVEN_RUNTIME`)
- Mocks Tauri ne remplacent pas la certification IPC réelle

---

## Voie 2 — Browser E2E (PARTIAL)

```
Tool: playwright
Config: playwright.config.ts
Commande: pnpm run test:e2e (si disponible)
Statut: QUALIFIED — utilisé pour tests navigateur non-Tauri
```

**Règle**: playwright ne teste pas le runtime desktop (IPC Tauri, commandes Rust). Verdicts browser uniquement.

---

## Voie 3 — Desktop E2E / Certification (CANONICAL pour prod)

```
Tool: WebDriverIO (wdio) + tauri-driver + WRY
Config: wdio.desktop.conf.cjs
Script: bash scripts/e2e/run-online-chat-proof-ui.sh
Artefacts (derniers): reports/ui_research_e2e/20260320T13*
```

**Statut dernier cycle**: PASS ×3 (2026-03-20 — session Lock #1)

**Règle**: les tests desktop WRY sont la seule preuve valide pour `PROVEN_RUNTIME`. Le harness est sensible à la latence modèle.

---

## Voie 4 — Rust Tests (CANONICAL backend)

```
Tool: cargo test
Scope: src-tauri/Cargo.toml
Derniers résultats: 4463 PASS (v28.88.0)
Test canonical: conversation_os_single_pipeline_trace_and_artifacts_are_canonical
```

**Règle**: cargo test prouve le backend Rust (memory OS, IPC, pipeline). Ne prouve pas le frontend.

---

## Verdicts de nature différente — NE PAS MÉLANGER

| Voie | Prouve quoi | Ne prouve PAS |
|------|------------|--------------|
| vitest | Logique JS/TS, hooks, services (avec mocks) | Runtime Tauri, IPC réel, desktop UI |
| playwright | Navigateur (sans Tauri) | Desktop, IPC Rust, commandes Tauri |
| wdio/tauri-driver | Desktop réel, IPC, chat end-to-end | Performance sous charge, multi-user |
| cargo test | Rust: memory OS, IPC handlers, pipeline | Frontend React, hooks, UI |
| tsc --noEmit | Types TypeScript | Comportement runtime |

---

## Doublons de tooling identifiés

| Doublon | Nature | Décision |
|---------|--------|---------|
| `vitest.config.ts` + `vitest.unit.config.ts` + `vitest.integration.config.ts` | Configs spécialisées | **KEEP** — scopes différents (unit vs integration), pas de vraie duplication |
| `vitest.browser.config.ts` | Config browser vitest | **KEEP** — browser mode vitest, distinct de playwright |
| `playwright.config.ts` vs `wdio.desktop.conf.cjs` | E2E browser vs desktop | **KEEP** — natures fondamentalement différentes (browser vs tauri desktop) |

**Aucun doublon critique à supprimer.** Chaque config a un scope distinct.

---

## Voie de validation actuelle recommandée

```
1. pnpm run check                           → TypeScript PASS/FAIL
2. pnpm exec vitest run                     → Unit/Integration PASS/FAIL (3399 tests)
3. cargo test --manifest-path src-tauri/Cargo.toml  → Rust PASS/FAIL (4463 tests)
4. bash scripts/e2e/run-online-chat-proof-ui.sh     → Desktop PASS/FAIL (certification réelle)
```

**Pour SEALED**: les 4 voies doivent PASS. Desktop E2E requis pour toute déclaration `PROVEN_RUNTIME`.

---

## Règle de scellement

```
STABLE    = vitest PASS + cargo test PASS + tsc PASS
SEALED    = STABLE + Desktop E2E PASS + build PASS + gates pertinentes PASS
```

---

## Points UNKNOWN restants

| Point | Nature | Résolution |
|-------|--------|-----------|
| `vitest.workspace.ts` | Config workspace vitest — usage réel ? | Vérifier si utilisé par pnpm run test |
| Tests storybook/chromatic | Présents en devDependencies — sont-ils dans CI ? | Audit CI workflows |
| Desktop E2E latence modèle | Harness sensible — quel profil modèle forcé ? | Voir `scripts/e2e/run-online-chat-proof-ui.sh` |

---

## Verdict

```
PHASE 9: QUALIFIED
- Voies de test: 4 identifiées, rôles distincts documentés
- Doublons critiques: aucun (configs spécialisées légitimes)
- Vérité de validation: explicite — vitest ≠ certification desktop
- Règle de scellement: STABLE vs SEALED clairement différenciées
- Points UNKNOWN: 3 (non bloquants pour la progression)
- Prochaine action: PHASE 10 — BUILD / TEST / PREUVE
```
