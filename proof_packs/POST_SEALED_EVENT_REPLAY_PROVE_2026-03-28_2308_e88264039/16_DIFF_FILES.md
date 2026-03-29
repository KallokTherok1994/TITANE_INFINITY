# DIFF_FILES

## Files changed this cycle (P1.11)

### e2e/desktop/online-chat-proof-ui.wdio.test.js

```diff
+const runEventReplayProof = process.env.TITANE_EVENT_REPLAY_PROOF === '1';
```

```diff
+  const eventReplayProofTest = runEventReplayProof ? it : it.skip;
```

```diff
+  eventReplayProofTest(
+    'proves append-only event emission and replay via Tauri IPC',
+    async function () {
+      this.timeout(120000);
+      // [full test body — see 11_X3_RUNS.md for flow description]
+    }
+  );
```

### docs/governance/LOCAL_EVENT_REPLAY_PROOF_SPEC.md

New file — see canonical deliverable.

### registry/proofpack-index.jsonl

One new line appended (P1.11 entry).

### proof_packs/POST_SEALED_EVENT_REPLAY_PROVE_2026-03-28_2308_e88264039/

New directory — 18 proof pack files (this pack).

---

## Files NOT changed this cycle

- src-tauri/src/persistence/commands.rs — NO CHANGE
- src-tauri/src/persistence/mod.rs — NO CHANGE
- src-tauri/src/persistence/database.rs — NO CHANGE
- src-tauri/src/persistence/event_log.rs — NO CHANGE
- src-tauri/src/main.rs — NO CHANGE
- src-tauri/capabilities/persistence.json — NO CHANGE
- Any other Rust source file — NO CHANGE

## NO_PATCH_NEEDED (no Rust/production code changes)
