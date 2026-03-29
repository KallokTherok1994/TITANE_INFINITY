# CLASSIFICATION — DEFERRED ITEMS

## Items Deferred To Future Sessions

### 1. Grand Nettoyage (AUDIT_GRAND_NETTOYAGE_2026-03-26.md)
- **Type**: LEGACY_OR_ARCHIVE_DRIFT
- **Scope**: 482 proof packs, 1830 reports, 28 .md files, 40 .sh scripts, 35 branches
- **Reason**: Too large for this session, requires dedicated cleanup session
- **Priority**: Medium (structural hygiene, not runtime truth)

### 2. Memory Governance Classification
- **Type**: STUB_OR_DOC_ONLY_OVERCLAIM
- **Scope**: Implement STABLE_PREFERENCE/NOISE/DURABLE_CONSTRAINT classification
- **Reason**: Requires design decisions and integration with MemoryIntelligenceEngine
- **Priority**: Low (system works without it)

### 3. Orchestrator Version Comment Cleanup
- **Type**: WARNING_DEBT
- **Scope**: Remove/consolidate version comments (v19.3Ω, v20Ω, v21Ω, v22Ω, v24.3, v24.5, v37.0.0)
- **Reason**: Cosmetic only, no functional impact
- **Priority**: Low

### 4. Champion/Challenger Enablement
- **Type**: STUB_OR_DOC_ONLY_OVERCLAIM
- **Scope**: Enable comparison framework (currently `enabled: false`)
- **Reason**: Requires evaluation of whether A/B comparison is needed
- **Priority**: Low (system works without it)

### 5. `.claude/` Directory Analysis
- **Type**: UNKNOWN
- **Scope**: Understand what `.claude/` directory contains
- **Reason**: Untracked directory, purpose unknown
- **Priority**: Low (not affecting system)