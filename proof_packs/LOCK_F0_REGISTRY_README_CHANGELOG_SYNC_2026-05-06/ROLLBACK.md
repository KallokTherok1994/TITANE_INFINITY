# F0 Rollback Plan

**Lock:** F0  
**Date:** 2026-05-06

## Rollback Steps

1. `git revert HEAD` — removes F0 commit (all 17+ files reverted)
2. `git restore docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md` — restore pre-F0
3. `git restore docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md` — restore stale pre-E0 lanes
4. `git restore docs/registry/TITANE_PROOF_PACK_REGISTRY.md` — remove C0–F0 entries
5. `git restore docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md` — restore false D5 CLEAN row
6. `git restore docs/cartography/TITANE_ADVANCED_INTELLIGENCE_MAP.md` — remove E0/F0 nodes
7. `git restore README.md CHANGELOG.md RELEASE_SURFACE_INVENTORY.md` — remove AI sections
8. `rm -rf scripts/verify/verify_readme_changelog_registry_sync.sh scripts/verify/verify_intelligence_seal_prereqs.sh` — remove F0 validators
9. `rm -rf proof_packs/LOCK_F0_REGISTRY_README_CHANGELOG_SYNC_2026-05-06/` — remove proof pack
10. `git restore docs/roadmap/F0_INGRESS_AUDIT.md docs/roadmap/D5_READINESS_ASSESSMENT.md` — restore roadmap
11. `git restore docs/reports/ADVANCED_INTELLIGENCE_RELEASE_TRUTH_MATRIX.md docs/reports/README_CHANGELOG_SYNC_MATRIX.md docs/reports/REGISTRY_SYNC_MATRIX.md docs/reports/PROOF_PACK_COVERAGE_MATRIX.md docs/reports/DESKTOP_E2E_BLOCKER_MATRIX.md` — restore reports

## Impact

- Docs-only rollback: no runtime behavior changes
- F0 is documentation sync — rollback does not affect any code or Tauri capabilities
- E0 proof pack and Desktop E2E state remain unchanged by F0 rollback
- AutoHeal: remove last row from `scripts/autoheal/autoheal_rules.jsonl`
