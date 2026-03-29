# ROLLBACK — P1.12

## 1. PRODUCT

NO_PATCH_NEEDED — no Rust or production code changed this cycle.
No product rollback applicable.

---

## 2. GOVERNANCE (P1.12 artifacts only)

### E2E harness rollback (removes multi-reducer test additions)
```
git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js
```
Note: This also removes P1.11 additions (eventReplayProofTest). Use selective patch revert if only P1.12 additions need removal.

### Registry rollback (removes P1.12 entry)
```
# Remove last line from registry/proofpack-index.jsonl
head -n -1 registry/proofpack-index.jsonl > /tmp/reg.tmp && mv /tmp/reg.tmp registry/proofpack-index.jsonl
```

### Governance spec rollback (removes MULTI_REDUCER_REPLAY_PROOF_SPEC.md)
```
git restore -- docs/governance/MULTI_REDUCER_REPLAY_PROOF_SPEC.md
```

### Proof pack removal (if needed)
```
rm -rf proof_packs/POST_SEALED_MULTI_REDUCER_REPLAY_PROVE_2026-03-28_2335_e88264039
```

### Full commit revert (if committed)
```
git revert HEAD --no-edit
```

---

## 3. PERSISTENCE / TEST ARTIFACTS

- events.json now has 15 events after P1.12 X3 runs
  - 3 P1.11 memory events
  - 12 P1.12 events (4 per run × 3 runs: xp, progress, knowledge, settings)
- To reset events (proof cycle reset only):
  ```
  echo "[]" > ~/.local/share/TITANE_INFINITY/persistence/titan_events.events.json
  ```
- snapshots.json has 4 snapshots (unchanged by P1.11/P1.12)

---

## 4. RUNTIME PROOF IMPACT

- Rolling back the E2E harness does NOT undo the runtime proof
- The 15 events in events.json and their correct replay are the persistent evidence
- Rolling back removes only the ability to re-run the proof test

### After rollback re-run instructions
```
TITANE_MULTI_REDUCER_PROOF=1 TITANE_NATIVE_BINARY_MODE=debug bash scripts/e2e/run-online-chat-proof-ui.sh
```
Note: pre-state ticks will be 300 (not 0) after P1.12 ran X3. Assertions use delta form (`preTicks + 100`) so they are correct regardless of accumulated prior state.

---

## 5. SCOPE BOUNDARIES AFTER P1.12

- All 5 reducers: PROVEN (no rollback needed for proof — evidence is in files)
- External sync: BLOCKED_ENV — unchanged
- LTM encrypted layer: future cycle
