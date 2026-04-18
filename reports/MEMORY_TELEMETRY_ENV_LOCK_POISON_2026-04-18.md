# MEMORY_TELEMETRY_ENV_LOCK_POISON_2026-04-18

- Date: 2026-04-18
- Scope: `src-tauri/src/memory/telemetry.rs`
- Symptom: les tests de `memory::telemetry` cassaient en cascade apres un mutex poisoning de `ENV_LOCK`, car chaque acquisition utilisait `expect(...)` au lieu de recuperer le guard.
- Root cause: le verrou de serialisation des variables d environnement etait traite comme un verrou non recuperable alors que le poison ne devait pas masquer le vrai echec initial.
- Fix: recuperation du guard via `unwrap_or_else(|poisoned| poisoned.into_inner())` sur chaque acquisition de `ENV_LOCK`, avec preuve lane telemetry executee en sequence.
- Proof commands:
  - `cargo test --manifest-path src-tauri/Cargo.toml memory::telemetry::tests -- --test-threads=1`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Proof results:
  - `cargo test --manifest-path src-tauri/Cargo.toml memory::telemetry::tests -- --test-threads=1`: PASS
  - `bash scripts/autoheal/detect_recurrence.sh`: PASS
  - `bash scripts/verify_instructions.sh`: PASS
- Verdict: PASS