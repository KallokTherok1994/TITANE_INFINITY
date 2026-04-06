# 09 — DIFF FILES

## File: src-tauri/src/core/modules/unified_memory.rs

### Change 1 — LTM disk write in promote_mtm_to_ltm() (lines ~539-570)

BEFORE:
```rust
self.ltm.index.insert(item.id.clone(), metadata);
// Implementation: Encrypted disk persistence for LTM entries
// - Encryption: Use ChaCha20-Poly1305 ...
// (comment only, no fs::write call)
```

AFTER:
```rust
self.ltm.index.insert(item.id.clone(), metadata.clone());
// ... (timeline event) ...
// ✅ FIX: actual disk write
if let Ok(json) = serde_json::to_string(&item) {
    if let Err(e) = std::fs::write(&metadata.file_path, json.as_bytes()) {
        eprintln!("[MEMORY] ⚠️ LTM disk write failed for {}: {}", item.id, e);
        self.ltm.index.remove(&item.id);  // anti-ghost guard
    }
} else {
    eprintln!("[MEMORY] ⚠️ LTM serialization failed for {}", item.id);
    self.ltm.index.remove(&item.id);
}
```

### Change 2 — restore_ltm_from_disk() call in init() (lines ~273-278)

BEFORE:
```rust
// Create LTM storage directory
if !self.ltm.storage_path.exists() { ... }
self.health = EngineHealth::Healthy;
```

AFTER:
```rust
// Create LTM storage directory
if !self.ltm.storage_path.exists() { ... }
// ✅ FIX: Restore LTM index from disk on startup
self.restore_ltm_from_disk();
self.health = EngineHealth::Healthy;
```

### Change 3 — new method restore_ltm_from_disk() (added ~line 681)

Scans ltm.storage_path/*.mem, serde_json deserializes each MemoryItem (Deserialize derived),
rebuilds MemoryMetadata, inserts into ltm.index. Corrupt files: skip + eprintln. No panic.

## Cargo check
```
Checking titane-infinity v28.5.0
Finished `dev` profile [unoptimized + debuginfo] target(s) in 55.86s
EXIT 0
```
