# ROLLBACK — P1.13a

## 1. PRODUCT

NO_PATCH_NEEDED — no Rust or production code changed this cycle.
No product rollback applicable.

---

## 2. GOVERNANCE (P1.13a artifacts only)

### E2E harness rollback (removes LTM path test additions)

```bash
git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js
```

Note: This also removes P1.11 and P1.12 additions (eventReplayProofTest, multiReducerProofTest). Use selective patch revert if only P1.13a additions need removal.

### Registry rollback (removes P1.13a entry)

```bash
head -n -1 registry/proofpack-index.jsonl > /tmp/reg.tmp && mv /tmp/reg.tmp registry/proofpack-index.jsonl
```

### Governance spec rollback (removes LTM_RUNTIME_PATH_PROOF_SPEC.md)

```bash
git restore -- docs/governance/LTM_RUNTIME_PATH_PROOF_SPEC.md
```

### Proof pack removal (if needed)

```bash
rm -rf proof_packs/POST_SEALED_LTM_PERSISTENCE_PROVEN_2026-03-29_1322_1fb883215
```

### Full commit revert (if committed)

```bash
git revert HEAD --no-edit
```

---

## 3. PERSISTENCE / TEST ARTIFACTS

- `~/.local/share/titane-infinity/persistent_memory/long_term/entries.json`: now has 3 encrypted entries from P1.13a X3 runs
- To reset long_term entries (proof cycle reset only):
  ```bash
  # Warning: this deletes LTM data. Only for proof reset purposes.
  echo '[]' | <encrypt and write to long_term/entries.json>
  # Or: delete the file (it will be recreated empty on next write)
  rm ~/.local/share/titane-infinity/persistent_memory/long_term/entries.json
  ```
- intermediate entries: 86 (unchanged by P1.13a)

---

## 4. RUNTIME PROOF IMPACT

- Rolling back the E2E harness does NOT undo the runtime proof
- The 3 long_term entries in persistent_memory are the persistent evidence
- Rolling back removes only the ability to re-run the proof test

### After rollback re-run instructions

```bash
DISPLAY=:1 TITANE_LTM_PATH_PROOF=1 TITANE_NATIVE_BINARY_MODE=debug bash scripts/e2e/run-online-chat-proof-ui.sh
```

Note: pre-state long_term will be 3 (not 0) after P1.13a ran X3. Assertions use delta form (`preLongTerm + 1`) so they are correct regardless of accumulated prior state.

---

## 5. SCOPE BOUNDARIES AFTER P1.13a

- persistent_memory_v19 IPC: PROVEN (no rollback needed for proof)
- unified_memory recall: BREAK_DOCUMENTED (no fix applied)
- External sync: BLOCKED_ENV — unchanged
- LTM → conversation bridge: future cycle (P1.14+)
