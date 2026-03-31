# Gates Report

## Governance Gates Run

### bash scripts/verify_instructions.sh

```
PASS: G_MARKER_NO_SKIPS
PASS: G_MARKER_PROOF_PACK
PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH
PASS: G_AH_RECURRENCE_GUARD_PASS
SUMMARY: PASS=20 FAIL=0
EXIT: 0
```

### bash scripts/autoheal/detect_recurrence.sh

```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=508
EXIT: 0
```

---

## Gate Summary

| Gate | Status |
|------|--------|
| G_MARKER_NO_SKIPS | PASS |
| G_MARKER_PROOF_PACK | PASS |
| G_MARKER_AUTOHEAL_CANONICAL_PATH | PASS |
| G_AH_RECURRENCE_GUARD_PASS | PASS |
| G_AH_RULE_CAPTURED_FOR_EACH_FIX | PASS |
| G_CHAMPION_LINT_PASS | PASS |
| G_CHAMPION_TSC_PASS | PASS |
| G_NO_PACKAGES_MODIFIED | PASS |
| G_NO_SOURCE_FILES_MODIFIED | PASS |
| G_PEER_BLOCKER_DOCUMENTED | PASS |
| G_BLOCKER_REACT_PLUGIN | PEER_BLOCKED (documented) |
| G_BLOCKER_REACT_HOOKS_PLUGIN | PEER_BLOCKED (documented) |
| G_TRIAL_DECISION | NO_TRIAL_JUSTIFIED (documented) |
| G_ROLLBACK_PLAN | PASS (no changes = trivial) |
| verify_instructions.sh SUMMARY | PASS=20 FAIL=0 |

**Overall gate status**: PASS (no failures)
**Migration status**: PEER_BLOCKED
