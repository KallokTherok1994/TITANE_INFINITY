# TITANE∞ — Registry Dashboard

- Généré: 2026-04-17T20:00:24.173Z
- Cycle actif: 01KFPVBPNG1KB0ZHD8KT6K5D7Y
- Objectif: Stabiliser les tests Vitest: éviter les faux rejets 'Dangerous characters' dans sanitizeMessage, et rétablir les suites streaming/UI/chat.
- Action prioritaire (unique): Run pnpm verify:registry
- Blocage principal: Registry incohérent: snapshot/dashboard obsolètes

## Dernière décision
- Aucune

## Dernier test_run
- Aucun

## Événements récents
- 2026-04-17T20:00:23.711Z [01KPEGFFMZ] WORKFLOW_CHANGED: Added ci-unified workflow gate for frontend circular dependency verification via Madge on the HMR-critical corridor.
- 2026-04-06T12:51:08.231Z [01KNHDHJT7] WORKFLOW_CHANGED: PR #207 registry sync for workflow and E2E gate stabilization after challenger remediation in .github/workflows/* and e2e/total-dev-unlock.spec.ts.
- 2026-04-03T12:17:05.445Z [01KN9MD2X5] WORKFLOW_CHANGED: CI workflow failures resolved: TAURI_SURFACE.md 216→217 (L4/P4/P6), secret-scan.sh docs/_evidence/.log exception, .gitignore temp/*, evals/reports/.gitkeep
- 2026-03-07T21:24:51.295Z [01KK530NEZ] FIX_APPLIED: PR #175: Rust build FAIL - dist manquant. Fix: step Ensure frontend dist placeholder dans rust.yml. AH-0092.
- 2026-03-07T21:01:12.984Z [01KK51NCCR] FIX_APPLIED: PR #175 LAST RED: Rust build FAIL - alsa-sys manque libasound2-dev. Fix: ajout libasound2-dev dans rust.yml. AH-0091.
- 2026-03-07T18:13:10.866Z [01KK4R1PJJ] FIX_APPLIED: PR #175 CI UNBLOCK: Fix Prettier e2e/desktop/ui-driver.wdio.js + Rust missing system deps (glib/gobject). AH-0089 + AH-0090.
- 2026-03-07T16:18:37.008Z [01KK4HFXTF] FIX_APPLIED: Phase canonique: PR #175 validé (32 fichiers), tous les gates PASS, 103 entrées AutoHeal, prêt pour merge vers MAIN
- 2026-03-07T16:02:13.863Z [01KK4GHXQ7] FIX_APPLIED: Phase stabilité: 5 failures MAIN analysées et documentées, cascade Prettier AH-0086/0087 ajoutés
- 2026-03-07T15:17:17.886Z [01KK4DZMXX] WORKFLOW_CHANGED: python-package-conda.yml ajouté sans environment.yml - trigger restreint aux fichiers Python uniquement
- 2026-03-07T14:07:57.523Z [01KK4A0P2K] WORKFLOW_CHANGED: rust.yml: add working-directory src-tauri for cargo build/test; Cargo.toml lives in src-tauri/ not root. prettier formatting applied to rust.yml and python-package-conda.yml
- 2026-03-07T04:10:07.675Z [01KK37T0XV] WORKFLOW_CHANGED: Add missing ALSA system dependency to unified build-verification workflow.
- 2026-03-07T02:00:49.972Z [01KK30D91M] WORKFLOW_CHANGED: Registry sync for workflow updates in .github/workflows/constitution-audit.yml and .github/workflows/rust-docker.yml after CI unblock fixes.

---
Source: `runtime/registry/events.jsonl` (append-only)

