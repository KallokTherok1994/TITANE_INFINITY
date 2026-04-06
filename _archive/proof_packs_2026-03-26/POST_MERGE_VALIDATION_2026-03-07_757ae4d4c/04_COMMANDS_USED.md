# 04_COMMANDS_USED

Primary commands executed in this post-merge validation:
1. git status
2. git rev-parse --short HEAD
3. git branch --show-current
4. git log -20 --oneline
5. git status -sb
6. git rev-parse MAIN
7. git rev-parse origin/MAIN
8. gh run list --limit 20 --json ...
9. gh workflow list
10. gh run list --limit 100 --json ... | jq ...
11. gh run view 22798227097 --json ...
12. pnpm verify:registry
13. bash scripts/autoheal/detect_recurrence.sh
14. bash scripts/verify_instructions.sh
15. rg -n "libasound2-dev" .github/workflows/ci-unified.yml
16. rg -n "AH-2026-03-06-0077" scripts/autoheal/autoheal_rules.jsonl

Raw logs:
- proof_packs/POST_MERGE_VALIDATION_2026-03-07_757ae4d4c/raw/ci_workflow_summary.txt
- proof_packs/POST_MERGE_VALIDATION_2026-03-07_757ae4d4c/raw/verify_registry.txt
- proof_packs/POST_MERGE_VALIDATION_2026-03-07_757ae4d4c/raw/autoheal_recurrence.txt
- proof_packs/POST_MERGE_VALIDATION_2026-03-07_757ae4d4c/raw/verify_instructions.txt
