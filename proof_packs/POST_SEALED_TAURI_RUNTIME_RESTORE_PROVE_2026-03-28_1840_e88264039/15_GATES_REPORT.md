# GATES_REPORT

## Gate definitions and status

### G1: Unit tests pass (87/87)
- Requirement: All existing Rust unit tests pass
- Evidence: cargo test --manifest-path src-tauri/Cargo.toml (mock features) → 87/87 PASS
- New tests: test_snapshot_default_state_roundtrip ✓, test_snapshot_status_counter_pattern ✓
- Status: PASS

### G2: Fresh binary
- Requirement: Debug binary must postdate P1.10c source changes
- Evidence: Binary at 18:30, source changes at ~17:45 → binary is NEWER
- Policy: FRESH_DEBUG_BINARY, buildRequired=false
- Status: PASS

### G3: IPC reachability
- Requirement: All 7 persistence commands reachable via Tauri IPC
- Evidence: All commands return expected types (see RUNTIME_TARGET_TRUTH_MAP)
- Status: PASS (7/7)

### G4: Snapshot emission
- Requirement: titan_force_snapshot_current writes at least one snapshot to DB
- Evidence: Run 1 preSnapshots=0→postSnapshots=2 (2 snapshots written)
- Status: PASS

### G5: State load
- Requirement: titan_load_state returns non-null state from DB
- Evidence: All 3 successful runs load baselineState successfully
- Status: PASS

### G6: No-loss hash equality (X3)
- Requirement: baselineHash === recoveredHash in ≥3 independent runs
- Evidence: d161cf82... in all 3 successful runs
- Status: PASS (3/3)

### G7: Counter correctness
- Requirement: snapshots_created increments per force_snapshot call
- Evidence: 0→2 (run1, 2 calls), 0→1 (runs 2/retry, 1 call each)
- Status: PASS

### G8: DB persistence across process restarts
- Requirement: Snapshots written by run N are loadable in run N+1
- Evidence: Run 2 loads run 1's snapshots; run 3 retry loads runs 1+2's snapshots
- Status: PASS

### G9: External sync classification
- Requirement: External sync status must be declared
- Evidence: TURSO_URL not set → BLOCKED_ENV (consistent across all runs)
- Status: CLASSIFIED (BLOCKED_ENV — not a gate failure, boundary acknowledged)

---

## Gate summary

| Gate | Status |
|------|--------|
| G1: Unit tests (87/87) | PASS |
| G2: Fresh binary | PASS |
| G3: IPC reachability | PASS |
| G4: Snapshot emission | PASS |
| G5: State load | PASS |
| G6: No-loss X3 | PASS |
| G7: Counter correctness | PASS |
| G8: Cross-run persistence | PASS |
| G9: External sync | CLASSIFIED |

All product gates: PASS. Runtime proof gates satisfied. Verdict: TAURI_RUNTIME_RESTORE_PROVEN.
