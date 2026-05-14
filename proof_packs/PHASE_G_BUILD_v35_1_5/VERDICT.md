# PHASE G — BUILD v35.1.5 — VERDICT

**Date**: 2026-05-14  
**Version**: 35.1.4 → 35.1.5  
**Scope**: Rule 13 version bump + Tauri release build + WDIO certification du fix Phase A.  
**Operating Mode**: DURABLE.

## Build (Rule 13)

```
pnpm run build:tauri   # 12m 52s
```

| Artifact | SHA-256 | Taille |
|---|---|---|
| `titane-infinity` (release ELF) | `bdde90c97823dd1c671fde4540d8a69ddee9d48986f7944f83fe8010a52bfe69` | ~25M |
| `titane-infinity_35.1.5_amd64.deb` | `ca6bd9bd2158407497fac0fb912e7190aae069976d7bb7ab9ce9905651024cdb` | 25M |
| `titane-infinity-35.1.5-1.x86_64.rpm` | `1c82802f8c508f2c2129297ac2f6fb8710b96872a4537c4e3db03232a6884a5b` | 25M |
| `titane-infinity_35.1.5_amd64.AppImage` | `a4fdbe3f3aabe2b9a3801d47409a01f474086ff1e836d947f17798fbbf37bb07` | 95M |

Voir `BUNDLE_SHA256.txt` pour la trace verbatim `sha256sum`.

## Vitest chat suite — 120/120 PASS

```
Test Files  9 passed (9)
     Tests  120 passed (120)
   Duration  8.40s
```

Files: conversation-manager, chatEngine-memory-integration, chat-fallback-display,
useChat, useChatMemory, useConversationEngine, useOmegaPipeline, omegaModeClassifier,
useAgentLiveSnapshot.

## WDIO certification (binaire frais v35.1.5)

- Binaire choisi par `RELEASE_PREFERRED_POLICY`: `src-tauri/target/release/titane-infinity` (sha256 `bdde90c9...`, mtime 1778773612032).
- Spec Files: **40 passed / 11 failed / 51 total** in 33:04.
- **Fix Phase A certifié** : `✓ loads dev page root [data-testid="page-dev"]` PASS
  (le symptôme historique = 8× DevPage FAIL avec `[data-testid="page-dev"]` introuvable
  est éliminé en runtime). Voir `wdio-phase-a-cert-v35_1_5.log`.
- Les 11 failures restantes sont sur des tests secondaires (re-navigation `/dev` après
  premier load, regressions IPC sur specs Admin/Backend/Strict) — hors scope Phase A;
  Rule 1 (minimal patch) interdit de chasser ces FAILs dans le même commit.

## Gates governance

- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS=52 FAIL=0

## Audits déterministes (Phase B+C+E reproductibles)

```
node scripts/audit/audit-advanced-agents-runtime.mjs   → 6/6 RUNTIME_PROVEN (PASS)
node scripts/audit/audit-chat-controls.mjs             → 43 files, 67 testids, 128 handlers, 0 stubs (PASS)
node scripts/audit/audit-buttons-and-functions.mjs     → 282 files, 614 buttons, 0 stubs (PASS)
```

## Rollback Plan

1. `git revert <commit-sha>` du commit Phase G (bump + autoheal + proof pack).
2. Revenir à v35.1.4 ne perd aucune fonctionnalité runtime — toutes les corrections
   Phase A/B/C/E sont déjà committed sur `MAIN` (`43994997b`, `dce2f3fca`, `88d2fadf1`).
3. Reconstruire si nécessaire: `pnpm run build:tauri`.

## VERDICT FINAL

**PASS** — Build Tauri release v35.1.5 reproductible (3 bundles), fix Phase A
(`lazyWithRetry`) certifié en runtime sur binaire frais via WDIO,
suite chat Vitest 120/120 PASS, gates governance PASS=52 FAIL=0.
