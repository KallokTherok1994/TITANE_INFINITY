# F0 Next Lock

**Lock:** F0 completes  
**Next required lock:** D5 (Intelligence Seal)  
**D5 State:** NOT_STARTED — T4 approval required

## D5 Preconditions (from D5_READINESS_ASSESSMENT.md)

- All proof packs C0–F0: PRESENT
- E0 Desktop E2E: PASS_WITH_EXPLICIT_BLOCKERS (acceptable for partial seal)
- 12 blocker lanes documented and classified (not blocking D5 itself)
- Validators: verify_readme_changelog_registry_sync PASS, verify_intelligence_seal_prereqs PASS
- seal_state: NOT_SEALED

## D5 Execution Gate

D5 requires:
1. T4 explicit approval
2. No premature SEALED claim in README or CHANGELOG
3. All F0 registries synced (done by this lock)
4. D5_READINESS_ASSESSMENT.md consulted

## Optional Next Locks

- **F1**: Conversation surface E2E (resolves 8 blocker lanes)
- **C3 security lock**: resolves AI-DESKTOP-15
- **T4 activation gates**: resolve 07, 11, 12, 13 lanes
