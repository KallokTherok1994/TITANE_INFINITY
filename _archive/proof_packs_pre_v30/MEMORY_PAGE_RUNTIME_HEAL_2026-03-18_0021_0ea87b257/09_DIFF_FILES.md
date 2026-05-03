# DIFF FILES

## Patch Applied: src/lib/security.ts

```diff
--- a/src/lib/security.ts
+++ b/src/lib/security.ts
@@ -302,6 +302,8 @@ const COMMAND_WHITELIST: readonly string[] = [
   'context_clear',
 
   // Persistent Memory (frontend hooks)
+  'persistent_memory_read',
+  'persistent_memory_get_bundles',
   'persistent_memory_get_context',
   'persistent_memory_get_stats',
   'persistent_memory_write_entry',
```

**Lines added**: 2
**Lines removed**: 0
**Files touched**: 1
**Risk level**: LOW — whitelist append only

## Committed In
`a8be15a55 feat(chat-mic): prove mic accessible from Chat IA — WDIO x3 PASS`
(Committed during concurrent session; fix confirmed present in HEAD `379464342`)

## No Other Files Modified
- No Rust changes required
- No TS type changes required
- No hook/store changes required
- No component changes required
