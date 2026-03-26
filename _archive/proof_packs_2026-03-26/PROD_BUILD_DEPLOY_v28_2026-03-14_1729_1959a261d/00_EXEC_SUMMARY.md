# PROD BUILD + DEPLOY — EXEC SUMMARY
## TITANE_INFINITY v28.0.0 — 2026-03-14_1729

**Tokens présentés**: GO_FOR_PROD_BUILD__TITANE_INFINITY + GO_FOR_PROD_DEPLOY__TITANE_INFINITY  
**Résultat**: PASS  
**Commit HEAD au moment du build**: 1959a261d (MAIN)

## Contexte

Build de production déclenché après le correctif IPC (commit 7d210d2a8).
Les artifacts précédents dans deployment/latest (mars 14 11:16) ne contenaient pas la
normalisation du payload `conversation_generate`. Ce build intègre le fix.

## Pipeline exécuté

| Étape | Résultat |
|-------|---------|
| `pnpm run lint` | PASS |
| `pnpm run format:check` | PASS (6 fichiers reformatés puis re-vérifiés) |
| `pnpm run ollama:bundle` | PASS (SHA256: b128a368...) |
| `vite build` | PASS (3458 modules transformés) |
| `tauri build` (release) | PASS (5m51s — 3 bundles: DEB + RPM + AppImage) |
| `bash scripts/post-build.sh` | PASS (.desktop installé) |

## Artifacts générés

| Artifact | SHA256 | Taille |
|----------|--------|--------|
| `TITANE-Infinity_27.2.0_amd64.AppImage` | `028a1a64dbcb99af5bc82373a38d3aa920389594a5e7ca4c4c470bf2100ffc47` | 88M |
| `TITANE-Infinity_27.2.0_amd64.deb` | `6adb68c10e0eab53809792d9a5d8f8df184de4ef8f509907bb1c8cfd7c0e07cf` | 17M |
| `titane-infinity` (binary) | `9f0dc389d73d33ea6f955f8d13b0f4badd19eb983dcad1a0ccab48d01c4daa66` | 30M |

## Gouvernance

- AutoHeal: AH-2026-03-14-0195 (entries=213)
- detect_recurrence: PASS
- verify_instructions: PASS=20 FAIL=0
