# 13 ROLLBACK

## Full rollback for this unblock session

```bash
git revert 47779f2df 4f5f073da 68bcc6eb9 13578aa5d 186fe020c
```

## Targeted file rollback (working tree only)

```bash
git restore -- .github/workflows/rust-docker.yml scripts/autoheal/autoheal_rules.jsonl
```

Status: `PASS` (rollback path explicit and executable)

