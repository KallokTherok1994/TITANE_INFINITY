# 16 ROLLBACK

## If capability coverage validator causes issues
git restore -- scripts/verify/verify-capabilities-coverage.sh

## If AutoHeal entry is incorrect
# Remove last line of scripts/autoheal/autoheal_rules.jsonl
# (use: head -n -1 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah.tmp && mv /tmp/ah.tmp scripts/autoheal/autoheal_rules.jsonl)

## Full session rollback
git restore -- scripts/verify/verify-capabilities-coverage.sh scripts/autoheal/autoheal_rules.jsonl

## Prior session fixes (do NOT roll back without re-opening proof):
# provider fix: git revert 34b2097d7
# memory persist: git revert 69c1c948f
# memory inject: git revert 61df44d0b
# memory backup: git revert a3212d6fb
# cap gap fix: git revert bb41032e4
