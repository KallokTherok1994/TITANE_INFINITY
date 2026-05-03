# ROLLBACK

Authoritative rollback file for docs-registry compliance.

## Session rollback
```bash
git revert f0fda53d8 --no-edit
```

## File-only rollback (uncommitted alternative)
```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

## Scope
- Reverts governance duplicate-id repair only
- Does not touch product code
