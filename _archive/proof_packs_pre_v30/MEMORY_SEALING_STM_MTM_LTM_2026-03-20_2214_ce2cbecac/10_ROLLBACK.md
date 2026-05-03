# 10 — ROLLBACK

## To undo all memory changes from this session:
```bash
git restore -- src-tauri/src/core/modules/unified_memory.rs
```

## Verify rollback:
```bash
cargo check --manifest-path src-tauri/Cargo.toml
grep -n "restore_ltm_from_disk\|fs::write.*metadata.file_path" \
  src-tauri/src/core/modules/unified_memory.rs
# Should return no results after rollback
```

## What rollback restores:
- promote_mtm_to_ltm(): reverts to comment-only LTM disk write
- init(): removes restore_ltm_from_disk() call
- restore_ltm_from_disk() method removed

## Impact of rollback:
- LTM is back to RAM-only (no disk persistence, no cross-session survival)
- Previously created *.mem files remain on disk but are not loaded

## Cleanup if desired (optional):
```bash
rm -f ~/.local/share/titane-infinity/ltm/*.mem
```
