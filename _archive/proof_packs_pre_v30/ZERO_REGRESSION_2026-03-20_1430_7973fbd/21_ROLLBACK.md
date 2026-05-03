# 21 — ROLLBACK
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

---

## Rollback Targets

### 1. Rollback new evals scaffold (remove only)
```bash
# Remove new untracked files (eval scaffold)
git clean -fd evals/
git clean -fd proof_packs/ZERO_REGRESSION_2026-03-20_1430_7973fbd/
git restore -- scripts/verify/verify_evals_scaffold.sh 2>/dev/null || true
```

### 2. Rollback autoheal entries (remove the 2 appended lines)
```bash
# The autoheal_rules.jsonl was modified (+2 lines)
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

### 3. Full rollback to champion baseline
```bash
git reset --hard v28.0.0
# or
git reset --hard 7973fbdec
```

---

## What Rollback Restores

| Item | State after rollback |
|------|---------------------|
| evals/ | REMOVED (was new) |
| scripts/verify/verify_evals_scaffold.sh | REMOVED (was new) |
| scripts/autoheal/autoheal_rules.jsonl | Restored to pre-session (457 entries) |
| src/ | Unchanged (was not touched) |
| src-tauri/ | Unchanged (was not touched) |
| Production behavior | Unchanged (no code modified) |

---

## Impact of NOT rolling back

Zero impact on production behavior. The evals scaffold is purely governance/documentation files.
The autoheal entries are append-only and do not affect runtime.

## Champion retained at: 7973fbdec (v28.0.0)
