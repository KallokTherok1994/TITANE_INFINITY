# MEMORY RESTORE CHAIN

## Step 1 — Backup trigger
invoke("chat_memory_backup", { dest_dir: "/path/to/backup/ltm" })

## Step 2 — Backup artifact format
Each *.mem file: JSON-serialized MemoryItem
{ id, content, memory_type, tier, importance, tags, created_at, accessed_at, access_count, metadata }
Files: <uuid>.mem in dest_dir/

## Step 3 — Backup artifact destination
Caller-supplied dest_dir — can be any filesystem path accessible to Tauri

## Step 4 — Restore entrypoint
invoke("chat_memory_restore", { src_dir: "/path/to/backup/ltm" })

## Step 5 — Restored files/paths
Files written to: ~/.local/share/titane-infinity/unified_memory/ltm/<uuid>.mem
Each file validated as MemoryItem before write (corrupt = skipped, no crash)

## Step 6 — init()/rehydration after restore
reload_ltm_from_disk() is called immediately after file copy (no restart required)
- clears ltm.index (stale entries removed)
- re-scans *.mem files in ltm.storage_path
- rebuilds HashMap<MemoryId, MemoryMetadata> index
- each valid file adds entry to index (corrupt = logged + skipped)

## Step 7 — Recall after restore
recall(query, max_results) hits the rebuilt index
- lexical match on content/tags
- reads file content from disk (serde_json::from_slice)
- returns matching MemoryItem list

## Recovery path: COMPLETE
## Rehydration without restart: PROVEN via reload_ltm_from_disk() in restore command
