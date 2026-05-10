# ROLLBACK - UI_DESKTOP_REMOTE_CI_PROOF_v69

Date: 2026-05-10

## rollback scope
- `scripts/verify/enforce-online-first.sh`
- v69 status and triage docs
- v69 proof pack files
- AutoHeal append row for v69 CI repair

## commands
```bash
git restore -- scripts/verify/enforce-online-first.sh
git restore -- docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_FINAL_STATUS_v69.md
git restore -- docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_FAILURE_TRIAGE_v69.md
git restore -- proof_packs/UI_DESKTOP_REMOTE_CI_PROOF_v69/GATE_REPORT.md
git restore -- proof_packs/UI_DESKTOP_REMOTE_CI_PROOF_v69/VERDICT.md
git restore -- proof_packs/UI_DESKTOP_REMOTE_CI_PROOF_v69/ROLLBACK.md
```

If the v69 AutoHeal line was committed, revert that commit or restore `scripts/autoheal/autoheal_rules.jsonl` from the previous commit.
