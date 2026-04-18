# UNIFIED_MEMORY_LIST_TIER_ORDER_2026-04-18

- Date: 2026-04-18
- Scope: `src-tauri/src/unified_memory_v2/persistence.rs`
- Symptom: `MemoryPersistence::list_tier` renvoyait encore les ids dans l ordre natif de `read_dir`, donc un meme tier pouvait produire des sorties variables.
- Root cause: la surface backend collectait les noms `.json` sans normaliser leur ordre avant retour.
- Fix: tri stable des ids avant `Ok(ids)` et ajout d une regression Rust exacte sur deux fichiers freres du tier `stm`.
- Proof commands:
  - `cargo test --manifest-path src-tauri/Cargo.toml unified_memory_v2::persistence::tests::list_tier_returns_sorted_ids -- --exact`
  - `cargo test --manifest-path src-tauri/Cargo.toml unified_memory_v2::persistence::tests::save_and_load_round_trip_with_valid_id -- --exact`
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Proof results:
  - `unified_memory_v2::persistence::tests::list_tier_returns_sorted_ids`: PASS
  - `unified_memory_v2::persistence::tests::save_and_load_round_trip_with_valid_id`: PASS
  - `bash scripts/autoheal/detect_recurrence.sh`: PASS
  - `bash scripts/verify_instructions.sh`: PASS
- Verdict: PASS