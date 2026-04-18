# SANDBOX_LIST_ORDER_2026-04-18

- Date: 2026-04-18
- Scope: `src-tauri/src/security/sandbox.rs`
- Symptom: `FileImportSandbox::list_files` renvoyait encore les `safe_name` dans l ordre natif de `read_dir`, donc `secure_list_files` pouvait varier entre deux runs identiques.
- Root cause: la surface runtime collectait les noms du dossier sandbox sans normaliser leur ordre avant retour.
- Fix: tri lexicographique local de `files` avant `Ok(files)` et ajout d une regression Rust exact sur deux imports distincts.
- Proof commands:
  - `cargo test --manifest-path src-tauri/Cargo.toml security::sandbox::tests::test_list_files_returns_sorted_safe_names -- --exact`
  - `cargo test --manifest-path src-tauri/Cargo.toml security::sandbox::tests::test_list_files_returns_imported_safe_name -- --exact`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Verdict: PASS