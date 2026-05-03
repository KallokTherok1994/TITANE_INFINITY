# 03 — LTM FULL CONTENT RECALL MAP

## BEFORE (placeholder behavior):

src-tauri/src/core/modules/unified_memory.rs — recall(), LTM section (line ~403):

```rust
// Search LTM (index only - full load on demand)
for (id, metadata) in &self.ltm.index {
    if Self::matches_query_metadata(metadata, query) {
        // For now, return metadata as lightweight item  ← comment admits it's a placeholder
        let item = MemoryItem {
            content: format!("[LTM:{}]", metadata.memory_type as u8),  // ← FAKE CONTENT
            ...
        };
        results.push(item);
    }
}
```

Problem: Even if files now exist on disk (from previous fix), recall() never reads them.
The model receives `"[LTM:0]"` as memory content — useless placeholder.

## AFTER (real content load):

```rust
for (id, metadata) in &self.ltm.index {
    if Self::matches_query_metadata(metadata, query) {
        let full_item: Option<MemoryItem> = std::fs::read(&metadata.file_path)
            .ok()
            .and_then(|bytes| serde_json::from_slice::<MemoryItem>(&bytes).ok());

        let item = if let Some(mut disk_item) = full_item {
            disk_item.accessed_count += 1;
            disk_item.last_accessed = now;
            disk_item  // ← REAL CONTENT from disk
        } else {
            eprintln!("[MEMORY] ⚠️ LTM full content unavailable for {}: skipping", id);
            continue;  // ← skip corrupt/missing, no crash, no fake content
        };
        results.push(item);
    }
}
```

## Disk file path:
`metadata.file_path` set in `promote_mtm_to_ltm()`:
  `self.ltm.storage_path.join(format!("{}.mem", item.id))`
  → Linux: `~/.local/share/titane-infinity/ltm/<uuid>.mem`

## Deserialization:
`MemoryItem` derives `Serialize, Deserialize` (line 87 in unified_memory.rs).
`serde_json::from_slice::<MemoryItem>()` — safe, returns Option via .ok()

## Failure degradation:
- File not found → `.ok()` = None → `continue` → not injected into results
- JSON corrupt → `.ok()` = None → `continue` → not injected into results
- No panic, no fake content, no crash
- Log: `[MEMORY] ⚠️ LTM full content unavailable for <id>: skipping recall hit`
