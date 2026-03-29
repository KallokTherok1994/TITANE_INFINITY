# ROLLBACK

## 1. PRODUCT

NO_PATCH_NEEDED — no Rust or production code changed this cycle.
No product rollback applicable.

---

## 2. GOVERNANCE

### E2E harness rollback (removes event replay test)
```
git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js
```

### Registry rollback (removes P1.11 entry)
```
git restore -- registry/proofpack-index.jsonl
```

### Governance spec rollback (removes LOCAL_EVENT_REPLAY_PROOF_SPEC.md)
```
git restore -- docs/governance/LOCAL_EVENT_REPLAY_PROOF_SPEC.md
```

### Proof pack removal (if needed)
```
rm -rf proof_packs/POST_SEALED_EVENT_REPLAY_PROVE_2026-03-28_2308_e88264039
```

---

## 3. PERSISTENCE / TEST ARTIFACTS

- events.json now has 3 events from P1.11 proof runs
- snapshots.json has 4 snapshots from P1.10d (unchanged by P1.11)
- To clear events (if resetting proof state):
  ```
  echo "[]" > ~/.local/share/TITANE_INFINITY/persistence/titan_events.events.json
  ```
- This is safe: events.json is append-only but reset is needed for proof cycle reset only

---

## 4. RUNTIME PROOF IMPACT

- Event replay is now PROVEN at runtime
- Rolling back the E2E harness does NOT undo the runtime proof (evidence is in the DB file)
- Rolling back the harness only removes the ability to re-run the proof test
- The DB evidence (3 events, correct timestamps, all post-snap[3]) remains on disk

### Next step after rollback
If rolled back: re-add the eventReplayProofTest and rerun with TITANE_EVENT_REPLAY_PROOF=1

### If NOT rolled back (normal case)
Event replay is PROVEN. Next cycle options:
- External sync proof (requires TURSO_URL + SYNC_TOKEN)
- Other module reducers ("xp", "progress", "knowledge", "settings")
- Full-feature build error resolution (7 pre-existing errors)
