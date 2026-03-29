# CURRENT MAIN LOCK

## Lock: Truth Surface Contradictions

**Type**: AUTHORITY_DUPLICATION / FALSE_PASS_OR_FALSE_HEALTH
**Priority**: #5 (canonical authority conflict)

### Problem
The truth surface (`.clinerules/05-truth-surface.md`) contained contradictions:
- `.github/agents/` marked as "❌ DOES NOT EXIST" but EXISTS (10 agent files)
- `.github/instructions/` marked as "❌ DOES NOT EXIST" but EXISTS (5 instruction files)

### Why This Is The Main Lock
1. The truth surface is the GOVERNANCE SURFACE — it must be accurate
2. It affects how future audits are conducted
3. It's a minimal, bounded fix (update 2 rows)
4. It reduces contradiction count
5. It's provably safe (just status flags, no code changes)

### Out Of Scope
- Grand Nettoyage (cleanup of 482 proof packs, 1830 reports, 35 branches)
- Memory governance classification implementation
- Orchestrator version comment cleanup
- Champion/Challenger enablement

### Deferred
- Repository cleanup (20GB .git)
- Root-level file consolidation
- Branch cleanup
- Proof pack archival

### Historical Only
- `.github/agents/` and `.github/instructions/` are governance-only surfaces
- Not used by product runtime (verified: no imports in src/)