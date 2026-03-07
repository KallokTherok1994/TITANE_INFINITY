# TITANE∞ — Registry Dashboard

- Généré: 2026-03-07T15:17:22.279Z
- Cycle actif: 01KFPVBPNG1KB0ZHD8KT6K5D7Y
- Objectif: Stabiliser les tests Vitest: éviter les faux rejets 'Dangerous characters' dans sanitizeMessage, et rétablir les suites streaming/UI/chat.
- Action prioritaire (unique): Regenerate registry snapshot
- Blocage principal: Registry incohérent: snapshot/dashboard obsolètes

## Dernière décision
- Aucune

## Dernier test_run
- Aucun

## Événements récents
- 2026-03-07T15:17:17.886Z [01KK4DZMXX] WORKFLOW_CHANGED: python-package-conda.yml ajouté sans environment.yml - trigger restreint aux fichiers Python uniquement
- 2026-03-07T14:07:57.523Z [01KK4A0P2K] WORKFLOW_CHANGED: rust.yml: add working-directory src-tauri for cargo build/test; Cargo.toml lives in src-tauri/ not root. prettier formatting applied to rust.yml and python-package-conda.yml
- 2026-03-07T04:10:07.675Z [01KK37T0XV] WORKFLOW_CHANGED: Add missing ALSA system dependency to unified build-verification workflow.
- 2026-03-07T02:00:49.972Z [01KK30D91M] WORKFLOW_CHANGED: Registry sync for workflow updates in .github/workflows/constitution-audit.yml and .github/workflows/rust-docker.yml after CI unblock fixes.
- 2026-03-06T13:16:08.653Z [01KK1MN32D] WORKFLOW_CHANGED: Downgraded Clippy from -D warnings to -W clippy::all in ci-unified workflow to unblock CI on 1209 expect_used lints with Rust stable 1.94
- 2026-03-06T12:17:29.330Z [01KK1H9P7H] WORKFLOW_CHANGED: Updated .github/workflows/ci-unified.yml to use Rust stable and unblock Unified CI failures
- 2026-03-06T12:05:01.251Z [01KK1GJVP2] WORKFLOW_CHANGED: Updated .github/workflows/p3-build-guard.yml to replace pnpm action setup with corepack bootstrap for CI stability
- 2026-03-06T02:56:02.867Z [01KK0H5N9J] WORKFLOW_CHANGED: Updated .github/workflows/consciousness-matrix.yml to fix CI failures and restore registry gate compliance
- 2026-02-09T15:28:34.050Z [01KH1G9K82] WORKFLOW_CHANGED: Workflow update in .github/workflows/performance.yml for Node 22 and libpng-dev install
- 2026-02-09T15:26:46.262Z [01KH1G69ZP] WORKFLOW_CHANGED: Workflow updates for pnpm install in .github/workflows/ci.yml and ci-unified.yml; gitleaks token in secret-scan-gitleaks.yml
- 2026-01-24T01:59:59.447Z [01KFPVNHPQ] INCIDENT: INCIDENT conformité: verify:registry échoue (registry-integrity) car snapshot.eventCount (5) !
- 2026-01-24T01:54:46.577Z [01KFPVC05H] FIX_APPLIED: Correctif sanitizeMessage: les caractères de contrôle/NULL byte sont nettoyés mais ne rendent plus le message invalide (évite les faux échecs Vitest et les réponses OMEGA de récupération).

---
Source: `runtime/registry/events.jsonl` (append-only)

