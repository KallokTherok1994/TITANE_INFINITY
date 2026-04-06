# Rollback Plan — AH-PACK-META-011

## Purpose
Revert packaging metadata hotfix if any unintended downstream impact appears.

## Fast rollback
```bash
git restore -- src-tauri/tauri.conf.json scripts/autoheal/autoheal_rules.jsonl
```

## Commit-level rollback
```bash
git revert <commit_sha_of_AH-PACK-META-011>
```

## Verification after rollback
```bash
jq -e . src-tauri/tauri.conf.json
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

Expected: all PASS.
