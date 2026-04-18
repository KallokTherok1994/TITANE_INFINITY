# TELEMETRY_CSV_TIMESTAMP_GUARD_2026-04-18

- Date: 2026-04-18
- Scope: `src-tauri/src/api/telemetry_api.rs`
- Symptom: `parse_csv_line` acceptait encore un `timestamp` vide ou whitespace-only, donc une ligne CSV mal formee pouvait produire un echantillon telemetry sans horodatage.
- Root cause: la surface convertissait directement `parts[0].trim()` en `String` apres le simple controle du nombre de colonnes, sans verifier qu un timestamp reel existait.
- Fix: rejet explicite des timestamps vides ou blancs avant construction de `ProductionHealthSample`, avec deux regressions Rust exactes sur les cas vide et whitespace-only.
- Proof commands:
  - `cargo test --manifest-path src-tauri/Cargo.toml api::telemetry_api::tests::test_parse_empty_timestamp_returns_parser_error -- --exact`
  - `cargo test --manifest-path src-tauri/Cargo.toml api::telemetry_api::tests::test_parse_whitespace_timestamp_returns_parser_error -- --exact`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Proof results:
  - `api::telemetry_api::tests::test_parse_empty_timestamp_returns_parser_error`: PASS
  - `api::telemetry_api::tests::test_parse_whitespace_timestamp_returns_parser_error`: PASS
  - `bash scripts/autoheal/detect_recurrence.sh`: PASS
  - `bash scripts/verify_instructions.sh`: PASS
- Verdict: PASS