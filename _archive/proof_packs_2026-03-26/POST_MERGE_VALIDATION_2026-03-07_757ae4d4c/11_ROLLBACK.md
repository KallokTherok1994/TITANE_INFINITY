# 11_ROLLBACK

Rollback target:
- Merge commit: 757ae4d4c

Rollback procedure:
1. git checkout MAIN
2. git pull --ff-only origin MAIN
3. git revert 757ae4d4c
4. git push origin MAIN

Post-rollback verification:
- re-run CI set on MAIN
- re-run pnpm verify:registry
- re-run bash scripts/autoheal/detect_recurrence.sh
- re-run bash scripts/verify_instructions.sh
