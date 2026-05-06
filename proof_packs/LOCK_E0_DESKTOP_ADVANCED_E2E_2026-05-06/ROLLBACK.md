# ROLLBACK — LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06

## Trigger Condition

Rollback if:
- WDIO spec introduces test regressions in subsequent runs
- Validator checks produce unexpected FAILs on CI
- Any lane previously PASS flips to FAIL on re-run

## Rollback Procedure

```bash
# 1. Revert commit
git revert HEAD

# 2. Remove E0 artifacts
rm -rf proof_packs/LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06/
rm -f e2e/advanced-intelligence/advanced-intelligence.desktop.wdio.spec.js
rm -f e2e/advanced-intelligence/reports/e2e_matrix_run.json
rm -f tests/contract/e2e-desktop/advanced-intelligence-contracts.test.ts
rm -f reports/desktop_advanced_intelligence_e2e_matrix.md
rm -f docs/roadmap/E0_INGRESS_AUDIT.md

# 3. Restore validator to T0 state
git checkout HEAD~1 -- scripts/verify/verify_desktop_advanced_intelligence_tests.sh

# 4. Remove AutoHeal E0 entry (last line)
head -n -1 scripts/autoheal/autoheal_rules.jsonl > /tmp/heal_tmp && mv /tmp/heal_tmp scripts/autoheal/autoheal_rules.jsonl

# 5. Verify rollback
bash scripts/autoheal/detect_recurrence.sh
```

## Post-Rollback State

- Registry: 20 lanes remain indexed (T0 scaffold preserved)
- Validator: restored to 8-check version
- AutoHeal: 1671 entries (E0 entry removed)
- No feature flags changed — no flag rollback needed
