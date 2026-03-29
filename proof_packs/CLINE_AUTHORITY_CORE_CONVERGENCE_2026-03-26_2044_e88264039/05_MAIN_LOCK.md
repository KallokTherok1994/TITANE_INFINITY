# MAIN LOCK

## Identified Lock: AUTHORITY_DRIFT_CONFIRMED + SHELL_OVERWEIGHT_CONFIRMED

### Primary Lock: AUTHORITY_DRIFT_CONFIRMED

**Root Cause**: Two core service files had version headers that diverged from the canonical version (28.88.0):

1. `src/services/ai/orchestrator.ts` — claimed v37.0.0
2. `src/services/conversationEngine.ts` — claimed v∞

**Impact**: Developers and governance tools reading these files would get a false impression of the product version, potentially leading to:
- Incorrect dependency assumptions
- Misaligned release planning
- Confusion in code reviews
- False authority claims competing with the canonical version

**Resolution**: Minimal patch — authority realignment of version headers to match canonical 28.88.0.

### Secondary Lock: SHELL_OVERWEIGHT_CONFIRMED

**Root Cause**: src/App.tsx acts simultaneously as:
1. Shell UI (legitimate)
2. Museum of 30+ modules (illegitimate)
3. Policy layer for environment detection (illegitimate)
4. Historical collision point for 60+ routes (illegitimate)

**Impact**: Product truth is diluted. Labs modules (Reality, Hyper, Quantum, Identity, Memory Evolution, Cloud, Orchestration Intelligence, Perfect Fusion, Ultimate Optimization) are at the same level as Core (TitanePage, Conversation Engine).

**Resolution**: Deferred — requires broader architectural discussion. Not causally linked to the current lock (version drift). Proposing shell thinning without runtime proof of which "Centers" are actually used in production would violate the NO_FAKE_LIGHTENING rule.

### Why AUTHORITY_DRIFT was the primary lock

The version drift in core services is a **provable, localized, bounded** problem with a trivial rollback. Shell overweight, while real, requires:
- Runtime proof of which lazy-loaded modules are actually invoked
- User-facing impact assessment
- Navigation impact analysis

These are P1 for future work but not the current lock.