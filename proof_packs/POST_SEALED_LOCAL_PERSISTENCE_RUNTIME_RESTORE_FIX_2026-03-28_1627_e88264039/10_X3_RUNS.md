# X3_RUNS

## Restore harness runs (x3)

| Run | Command | Result | Log |
| --- | --- | --- | --- |
| run1 | TITANE_RESTORE_PROOF=1 TITANE_PROOF_RUN=run1 TITANE_PROOF_SCENARIO=MEMORY_MULTI_TURN bash scripts/e2e/run-memory-chat-proof-ui.sh | FAIL - titan_load_state empty (no snapshots) | reports/tauri_memory_e2e/20260328T201955Z/wdio-memory-chat-proof-ui.log |
| run2 | TITANE_RESTORE_PROOF=1 TITANE_PROOF_RUN=run2 TITANE_PROOF_SCENARIO=MEMORY_MULTI_TURN bash scripts/e2e/run-memory-chat-proof-ui.sh | FAIL - titan_load_state empty (no snapshots) | reports/tauri_memory_e2e/20260328T202157Z/wdio-memory-chat-proof-ui.log |
| run3 | TITANE_RESTORE_PROOF=1 TITANE_PROOF_RUN=run3 TITANE_PROOF_SCENARIO=MEMORY_MULTI_TURN bash scripts/e2e/run-memory-chat-proof-ui.sh | FAIL - titan_load_state empty (no snapshots) | reports/tauri_memory_e2e/20260328T202326Z/wdio-memory-chat-proof-ui.log |

## X3 checks

- Product drift (x3): git diff --name-only (no src/src-tauri diffs).
- Direct seal surfaces stable (x3): git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json (empty).
- Trigger check (x3): no new diffs under src/ or src-tauri.
- Proof-pack completeness check (x3): ls proof_packs/POST_SEALED_LOCAL_PERSISTENCE_RUNTIME_RESTORE_FIX_2026-03-28_1627_e88264039 (run three times).
