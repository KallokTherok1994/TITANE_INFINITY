# 13 - Rollback

Minimal rollback for V61 closure changes:

```bash
git restore -- proof_packs/V60_IPC_ENTRY_CAPTURE_REAL_UI_STRONG_CLOSURE_20260313_015700_8ed1ef72c64abd90/VERDICT.md
git restore -- scripts/autoheal/autoheal_rules.jsonl
git clean -fd -- proof_packs/V61_PROMOTION_CLOSURE_RELEASE_GOVERNANCE_20260313_074108_8ed1ef72c
```

Rollback impact:
- Removes V61 promotion closure artifacts.
- Removes V60 supersession notice.
- Reverts V61 AutoHeal entry.
