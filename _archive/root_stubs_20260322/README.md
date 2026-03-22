# Root Stubs Archive — 2026-03-22

These files were quarantined from the repository root on 2026-03-22 as part of the
REPO_HYGIENE_MALWARE_DEADCODE audit. They are historical planning/implementation documents
that were never part of any compiled module but were committed at the root level.

## Files

| file | original path | reason for quarantine |
|------|--------------|----------------------|
| GATEWAY_IMPLEMENTATION_PLAN.rs | / (root) | v21.5 Rust API gateway planning doc; not in Cargo.toml; orphaned stub |
| PHASE_C1_COMPLETION_REPORT.ts | / (root) | v27.0.0 completion report TS file; not in tsconfig/vite; orphaned stub |
| run_baseline_measurements.rs | / (root) | rust-script benchmark tool; not in Cargo.toml; orphaned stub |
| test_persona_engine.rs | / (root) | v24 standalone Rust test; not in cargo test suite; orphaned stub |

## Classification

All files: OBSOLETE_UNREFERENCED → QUARANTINE (not DELETE due to historical reference value in proof_packs)

## Rollback

```bash
git checkout HEAD -- GATEWAY_IMPLEMENTATION_PLAN.rs PHASE_C1_COMPLETION_REPORT.ts \
  run_baseline_measurements.rs test_persona_engine.rs
```
