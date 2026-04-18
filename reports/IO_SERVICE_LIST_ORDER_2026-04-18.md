# IO_SERVICE_LIST_ORDER_2026-04-18

- Date: 2026-04-18
- Scope: `src-tauri/src/services/io_service.rs`
- Symptom: `IoService::list_dir` renvoyait encore les chemins dans l ordre natif de `read_dir`, donc un meme repertoire pouvait produire des sorties variables.
- Root cause: la surface backend collectait les `PathBuf` sans normaliser leur ordre avant retour.
- Fix: tri stable des chemins avant `Ok(files)` et ajout d une regression Rust exacte sur deux fichiers freres.
- Proof commands:
  - `cargo test --manifest-path src-tauri/Cargo.toml services::io_service::tests::list_dir_returns_sorted_paths -- --exact`
  - `cargo test --manifest-path src-tauri/Cargo.toml services::io_service::tests::read_file_reads_relative_workspace_file -- --exact`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Proof results:
  - `services::io_service::tests::list_dir_returns_sorted_paths`: PASS
  - `services::io_service::tests::read_file_reads_relative_workspace_file`: PASS
  - `bash scripts/autoheal/detect_recurrence.sh`: PASS
  - `bash scripts/verify_instructions.sh`: PASS
- Verdict: PASS