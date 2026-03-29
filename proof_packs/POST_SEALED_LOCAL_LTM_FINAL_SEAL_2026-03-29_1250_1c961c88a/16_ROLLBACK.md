# ROLLBACK

## Rollback Commands
```bash
rm -rf proof_packs/POST_SEALED_LOCAL_LTM_FINAL_SEAL_2026-03-29_1250_1c961c88a/
git restore -- registry/proofpack-index.jsonl
```

## Rollback Scope
- Delete proof pack directory
- Revert registry entry (if appended)
- No code rollback needed (no code changes)
