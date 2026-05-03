# INVARIANTS_CHECK

- Minimal patch only: YES (single file config change)
- 4-Ring boundary violated: NO evidence in this patch
- One Door governance changed: NO
- IPC canonical contract changed: NO
- Tauri capability/allowlist changed: NO
- Silent fallback introduced: NO
- Browser truth mislabeled as desktop truth: NO (explicitly separated)

## Kernel mandatory commands to run post-fix
- bash scripts/autoheal/detect_recurrence.sh
- bash scripts/verify_instructions.sh
