# GATE_REPORT

- Lot: `SANDBOX_LIST_ORDER_2026-04-18`
- Date: 2026-04-18
- Scope: `src-tauri/src/security/sandbox.rs`
- Change: trie maintenant les `safe_name` de `FileImportSandbox::list_files` avant retour.

- Gate 1: `cargo test --manifest-path src-tauri/Cargo.toml security::sandbox::tests::test_list_files_returns_sorted_safe_names -- --exact`
  - Status: PASS
- Gate 2: `cargo test --manifest-path src-tauri/Cargo.toml security::sandbox::tests::test_list_files_returns_imported_safe_name -- --exact`
  - Status: PASS
- Gate 3: `bash scripts/autoheal/detect_recurrence.sh`
  - Status: PASS
- Gate 4: `bash scripts/verify_instructions.sh`
  - Status: PASS