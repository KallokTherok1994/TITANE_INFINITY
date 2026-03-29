# DIFF_FILES — P1.12

## Files changed this cycle

### e2e/desktop/online-chat-proof-ui.wdio.test.js

```diff
+const runMultiReducerProof = process.env.TITANE_MULTI_REDUCER_PROOF === '1';
```

```diff
+  const multiReducerProofTest = runMultiReducerProof ? it : it.skip;
```

```diff
+  multiReducerProofTest(
+    'proves multi-reducer event replay coverage: xp / progress / knowledge / settings',
+    async function () { ... } // 123 lines — see 06_HARNESS_DIFF.md
+  );
```

### docs/governance/MULTI_REDUCER_REPLAY_PROOF_SPEC.md

New file — canonical governance spec for multi-reducer replay proof coverage.

### registry/proofpack-index.jsonl

One new line appended (P1.12 entry).

### proof_packs/POST_SEALED_MULTI_REDUCER_REPLAY_PROVE_2026-03-28_2335_e88264039/

New directory — 18 proof pack files (this pack).

---

## Files also changed in this session (P1.11, included in same commit)

### docs/governance/LOCAL_EVENT_REPLAY_PROOF_SPEC.md

New file — canonical governance spec for append-only event replay proof.

### proof_packs/POST_SEALED_EVENT_REPLAY_PROVE_2026-03-28_2308_e88264039/

New directory — 19 proof pack files (P1.11 pack).

---

## Files NOT changed this cycle

- `src-tauri/src/persistence/mod.rs` — NO CHANGE
- `src-tauri/src/persistence/commands.rs` — NO CHANGE
- `src-tauri/src/persistence/database.rs` — NO CHANGE
- `src-tauri/src/persistence/event_log.rs` — NO CHANGE
- `src-tauri/src/main.rs` — NO CHANGE
- `src-tauri/capabilities/persistence.json` — NO CHANGE
- Any other Rust source file — NO CHANGE

## NO_PRODUCT_MUTATION

No production code was modified in P1.12. All changes are:
- E2E harness additions (gated, no effect when env var unset)
- Governance documentation
- Registry append
- Proof pack artifacts
