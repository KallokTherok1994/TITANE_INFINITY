# 09 - Rollback Plan

## Proof Pack Rollback
Remove only this generated proof pack if the audit is withdrawn:
```powershell
Remove-Item -Recurse -Force proof_packs/MEMORY_FORENSIC_AUDIT_2026-05-25
```

## Baseline Corrections Rollback
The audit baseline included existing local modifications. If those must be reverted separately:
```powershell
git restore -- scripts/verify/verify_memory_integrity.sh scripts/autoheal/autoheal_rules.jsonl
```

## Registry Entry Rollback
If a proofpack index entry is appended for this audit, revert only that registry append:
```powershell
git restore -- registry/proofpack-index.jsonl
```

## Future Remediation Rollback
- Memory isolation gate restoration: `git restore -- scripts/checks/gate_memory_isolation.sh scripts/checks/check_memory_isolation.sh`
- Registry JSONL normalization: `git restore -- registry/repo-events.jsonl`
- Authority map updates: `git restore -- docs/architecture/MEMORY_AUTHORITY_MAP.md docs/MEMORY_CONSUMPTION_MAP.md docs/canon/MEMORY_TRIAGE_INDEX.md`

## Artifact Policy
Do not delete existing `artifacts/frontend-runtime-prebuild/...` directories as part of this rollback unless explicitly requested.
