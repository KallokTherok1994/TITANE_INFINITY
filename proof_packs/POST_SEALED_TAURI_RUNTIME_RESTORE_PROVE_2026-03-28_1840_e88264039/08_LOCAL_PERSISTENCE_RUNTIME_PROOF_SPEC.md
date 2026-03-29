# LOCAL_PERSISTENCE_RUNTIME_PROOF_SPEC

## Specification: What constitutes runtime proof of local persistence

### Minimum requirements

1. **IPC reachability**: All persistence commands must be invokable via Tauri IPC (not just compiled)
2. **Snapshot emission**: At least one snapshot must be written to the DB file
3. **Snapshot load**: A previously-written snapshot must be loadable by titan_load_state
4. **No-loss comparison**: SHA256(JSON.stringify(loaded)) must equal SHA256(JSON.stringify(stored))
5. **Counter correctness**: snapshots_created must increment per force_snapshot call
6. **Repeatability**: The above must hold across ≥3 independent runs

### Proof boundary

- In scope: local JSON file persistence (titan_events.snapshots.json)
- Out of scope: external Turso/cloud sync (BLOCKED_ENV)
- Out of scope: event log replay (events.json empty, append path WIRED_BUT_UNPROVEN)
- Out of scope: full-feature engine state (mock mode only — default state snapshot)

### Hash comparison spec

```
baselineState = await invokeTauriCommand('titan_load_state')
  // if null: force_snapshot_current → reload
baselineJson = JSON.stringify(baselineState)
baselineHash = SHA256(baselineJson)

await invokeTauriCommand('titan_force_snapshot', { stateJson: baselineJson })
recoveredState = await invokeTauriCommand('titan_recover_state')
recoveredHash = hashJson(recoveredState)

assert baselineHash === recoveredHash
```

### Pass criteria

- `baselineHash === recoveredHash`: PASS (no data loss, no mutation, no duplication)
- `snapshots_created` post > pre: PASS (emission counter working)
- DB snapshots count increases: PASS (write confirmed)
- All 3 runs meeting criteria: RUNTIME_PROOF

### This cycle's results against spec

| Requirement | Run 1 | Run 2 | Run 3 retry | Status |
|-------------|-------|-------|-------------|--------|
| IPC reachable | ✓ | ✓ | ✓ | PROVEN |
| Snapshot emitted | ✓ (2 new) | ✓ (1 new) | ✓ (1 new) | PROVEN |
| State loaded | ✓ | ✓ | ✓ | PROVEN |
| Hash equality | ✓ d161cf82 | ✓ d161cf82 | ✓ d161cf82 | PROVEN |
| Counter increments | ✓ 0→2 | ✓ 0→1 | ✓ 0→1 | PROVEN |
| Repeatability (≥3) | 3/3 | — | — | PROVEN |

### Verdict against spec: MEETS_SPEC — RUNTIME_PROOF_SATISFIED
