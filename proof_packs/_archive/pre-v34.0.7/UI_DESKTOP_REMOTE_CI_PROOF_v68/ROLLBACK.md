# ROLLBACK — UI_DESKTOP_REMOTE_CI_PROOF_v68

## Minimal rollback commands

```bash
git restore -- .github/workflows/titane-static-gates.yml
git restore -- scripts/verify/enforce-online-first.sh
git restore -- docs/ui/desktop/UI_DESKTOP_DETERMINISTIC_ARTIFACTS_CI_CLEAN_BASELINE_CERTIFICATION_v67.md
git restore -- scripts/autoheal/autoheal_rules.jsonl
git restore -- docs/ui/desktop/UI_DESKTOP_REMOTE_CI_PROOF_v68_STARTUP_AUDIT.md
git restore -- docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_STATUS_v68.md
git restore -- docs/ui/desktop/runtime/UI_DESKTOP_CI_WORKFLOW_HARDENING_v68.md
git restore -- docs/ui/desktop/runtime/UI_DESKTOP_V67_METADATA_DRIFT_AUDIT_v68.md
git restore -- docs/ui/desktop/runtime/UI_DESKTOP_ACCEPTED_DIRTY_REDUCTION_AUDIT_v68.md
git restore -- docs/ui/desktop/UI_DESKTOP_REMOTE_CI_PROOF_AND_RELEASE_PRISTINE_CERTIFICATION_v68.md
git restore -- proof_packs/UI_DESKTOP_REMOTE_CI_PROOF_v68/GATE_REPORT.md
git restore -- proof_packs/UI_DESKTOP_REMOTE_CI_PROOF_v68/VERDICT.md
git restore -- proof_packs/UI_DESKTOP_REMOTE_CI_PROOF_v68/ROLLBACK.md
```

## Scope note
- Do not restore or rewrite src-tauri/data/ui_theme.json from this mission rollback path.
- That file is treated as user/runtime state and remains explicitly accepted-dirty.
