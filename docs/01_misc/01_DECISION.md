# PIVOT DECISION: Framework-First Validation

**Date**: 2026-02-18T212142Z  
**Decision**: Pivot from "build all 8 complex phases now" to "validate orchestration framework first with stubs"

## Why Pivot

**Problem**: Each phase script iteration takes 60+ seconds to test due to:
1. Complex gate logic (E2E, builds, packaging)
2. External dependencies (Tauri, Ollama, WebDriver)
3. Long execution times (E2E runs can take 30+ sec alone)
4. Each bug discovery requires: edit → commit → re-run master → wait → debug

**Cost**: Framework validation was blocked by gate implementation complexity.

**Insight**: The orchestration framework itself (packing, sealing, registry, commit) is **orthogonal** to gate complexity.

## Decision

✅ **SPLIT THE WORK**:

| Phase | Current Approach | Pivot Approach | Time Impact |
|-------|------------------|----------------|------------|
| Framework | Blocked by gates | Validate NOW with stubs | <15s |
| Per-gate | Sequential complex debug | Sequential simple updates | Per upgrad e: <5s each |
| **Total to production** | Unknown (framework tax) | Predictable roadmap | Clear ROM |

## What Changes

- **Phase scripts** become STUBS (deterministic, <1s each)
- **Orchestrator** unchanged (already works for scheduling)
- **Library** unchanged (works correctly)
- **Registry** contains truthful "FRAMEWORK_ONLY" entry (not false PASS claims)
- **Master run** completes in <15 sec (framework proves itself)

## What Does NOT Change

- ❌ No Tauri config edits
- ❌ No runtime modifications  
- ❌ No new dependencies
- ❌ No approach changes to allowlists or guards
- ✅ Pure ring-4 (test tooling) changes only

## Autoheal Policy (Pivot Run)

- Max 2 loops per phase
- Max 4 total loops for entire stub run
- Only fix ring-4 issues (stub script bugs)

## Next: PHASE_SWAP_PLAYBOOK

After framework PASS, each phase upgrade from STUB → REAL will:
1. Create a minor phase script improvement
2. Rerun master (now in <20s with 1 real phase)
3. Validate gate produces correct output
4. Commit + registry

This approach keeps **per-gate iteration fast** after framework is proven.

---

**Outcome**: Production timeline becomes: 
- ✅ Framework PASS (today)
- Phased gate upgrades (daily PRs as gates are added)
- Production readiness declared only when ALL phases are REAL and passing required criteria

