# DIFF_FILES — P1.13a

## Files changed this cycle

### e2e/desktop/online-chat-proof-ui.wdio.test.js

```diff
+const runLtmPathProof = process.env.TITANE_LTM_PATH_PROOF === '1';
```

```diff
+  const ltmPathProofTest = runLtmPathProof ? it : it.skip;
```

```diff
+  ltmPathProofTest(
+    'proves LTM runtime path: persistent_memory IPC round-trip + isolation from conversation recall',
+    async function () { ... } // ~45 lines — see 06_HARNESS_DIFF.md
+  );
```

### docs/governance/LTM_RUNTIME_PATH_PROOF_SPEC.md

New file — canonical governance spec for LTM runtime path proof coverage.

### registry/proofpack-index.jsonl

One new line appended (P1.13a entry).

### proof_packs/POST_SEALED_LTM_PERSISTENCE_PROVEN_2026-03-29_1322_1fb883215/

New directory — 19 proof pack files (this pack).

---

## Files NOT changed this cycle

- `src-tauri/src/commands/persistent_memory.rs` — NO CHANGE
- `src-tauri/src/conversation_engine/commands.rs` — NO CHANGE
- `src-tauri/src/overdrive/chat_orchestrator.rs` — NO CHANGE
- `src-tauri/src/core/modules/unified_memory.rs` — NO CHANGE
- `src-tauri/src/main.rs` — NO CHANGE
- `src-tauri/capabilities/persistence.json` — NO CHANGE
- `src-tauri/tauri.conf.json` — NO CHANGE
- Any other Rust source file — NO CHANGE

## NO_PRODUCT_MUTATION

No production code was modified in P1.13a. All changes are:
- E2E harness additions (gated, no effect when env var unset)
- Governance documentation
- Registry append
- Proof pack artifacts
