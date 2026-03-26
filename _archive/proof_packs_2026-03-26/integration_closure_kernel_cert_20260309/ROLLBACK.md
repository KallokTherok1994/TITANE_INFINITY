## Rollback Plan — integration_closure_kernel_cert_20260309

**Date:** 2026-03-09

### Scope

Files changed in this session:
- `scripts/gates/g6-build-reproducibility.sh` (hardened hash normalization)
- `scripts/autoheal/autoheal_rules.jsonl` (AH-2026-03-09-0109 appended)
- `docs/_evidence/integration_closure/INT-0_INT-1_proof.md` (new)
- `docs/_evidence/integration_closure/INT-2_kernel_cert.md` (new)
- `proof_packs/integration_closure_kernel_cert_20260309/` (new)

### Rollback Commands

```bash
# Restore modified files
git restore -- scripts/gates/g6-build-reproducibility.sh
git restore -- scripts/autoheal/autoheal_rules.jsonl

# Remove new files
git rm -r docs/_evidence/integration_closure/
git rm -r proof_packs/integration_closure_kernel_cert_20260309/
```

### Post-Rollback Verification

```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

### Risk Assessment

**LOW** — All changes are in governance tooling and documentation only. No production code modified. No Tauri capabilities changed. No IPC contract modified.
