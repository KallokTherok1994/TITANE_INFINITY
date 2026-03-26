# 04_DIFF_FILES

## Changed Files (Functional)

- `src-tauri/src/conversation_engine/mod.rs`
- `src/lib/tauriClient.ts`

## Diff Summary

```diff
--- a/src-tauri/src/conversation_engine/mod.rs
+++ b/src-tauri/src/conversation_engine/mod.rs
@@
-    const DEFAULT_TIMEOUT_SECS: u64 = 20;
+    const DEFAULT_TIMEOUT_SECS: u64 = 60;
```

```diff
--- a/src/lib/tauriClient.ts
+++ b/src/lib/tauriClient.ts
@@
+const CONVERSATION_GENERATE_TIMEOUT_MS = 75_000;
@@
-      (params as Record<string, unknown>) || {}
+      (params as Record<string, unknown>) || {},
+      { timeout: CONVERSATION_GENERATE_TIMEOUT_MS }
```

## Governance File

- `scripts/autoheal/autoheal_rules.jsonl`
  - Appended entry: `AH-2026-03-14-0003`.
