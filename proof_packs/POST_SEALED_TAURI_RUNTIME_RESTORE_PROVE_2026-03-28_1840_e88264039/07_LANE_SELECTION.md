# LANE_SELECTION

## Available Lanes

| Lane | Description | Condition |
|------|-------------|-----------|
| A | Verify and prove — fixes already applied, runtime proof executable | Unit proof present + fresh binary |
| B | Fix then prove — apply fix, rebuild, run E2E | Fix required before runtime proof |
| C | Partial proof — prove what is provable, document blockers | Some components BLOCKED |
| D | Blocked — cannot proceed | No viable proof path |

---

## Lane Selected: LANE A

### Rationale

- P1.10c fixes already committed and verified (commands.rs + mod.rs)
- Unit proof present: 87/87 tests pass including 2 new roundtrip/counter tests
- Fresh debug binary: built 2026-03-28 18:30 UTC-4, NEWER than P1.10c source changes (~17:45)
- tauri-driver available, Xvfb active, Ollama UP
- WDIO restore harness exists and is gated by TITANE_RESTORE_PROOF=1
- No new fix required — direct execution path viable

### Lane A execution

1. Binary policy check → FRESH_DEBUG_BINARY, buildRequired=false ✓
2. Run TITANE_RESTORE_PROOF=1 bash scripts/e2e/run-online-chat-proof-ui.sh → X3 (with retry)
3. Verify hash equality: baselineHash === recoveredHash
4. Verify snapshots_created counter increments
5. Verify DB state: snapshots.json written, blobs consistent
6. Classify external sync boundary
7. Emit verdict

### Result

LANE A executed successfully. 3/3 successful runs. All assertions passed. Verdict: TAURI_RUNTIME_RESTORE_PROVEN.
