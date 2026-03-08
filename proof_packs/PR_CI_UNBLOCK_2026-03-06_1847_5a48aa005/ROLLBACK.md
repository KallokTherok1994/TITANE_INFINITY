# ROLLBACK

SOURCE_OF_TRUTH:
- 13_ROLLBACK.md

COMMANDS:
```bash
git revert 47779f2df 4f5f073da 68bcc6eb9 13578aa5d 186fe020c
git restore -- .github/workflows/rust-docker.yml scripts/autoheal/autoheal_rules.jsonl
```
