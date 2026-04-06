# Cargo Test Results

Command: cd src-tauri && cargo test --lib
Exit: 0

BEFORE FIX: 4455 passed; 1 failed
  FAIL: control_panel_commands::tests::test_cp_get_system_info
  ROOT CAUSE: stale hardcoded version assertion "28.0.0" vs Cargo.toml "28.5.0"
  FIX: src-tauri/src/control_panel_commands/tests.rs line 27: "28.0.0" → "28.5.0"

AFTER FIX: 4456 passed; 0 failed
G_CARGO_TEST=PASS
