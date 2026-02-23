# PRESERVATION DECISION — Phase 2 Terminology Normalization

**Date**: 2026-02-23 21:10:00 UTC  
**Phase**: P2_TERMINOLOGY_NORMALIZATION (REVISED)  
**Decision Authority**: GitHub Copilot (AI Assistant) + G8 Gate Enforcement  
**Status**: ✅ APPROVED (G8 Compliance)

---

## Executive Summary

**Decision**: PRESERVE all historical reports/archives with "local-first" terminology AS-IS.  
**Reason**: G8 (APPEND_ONLY_REGISTRY) compliance — no rewriting history.  
**Scope Reduction**: Phase 2 narrowed from 30+ files → 1 file (CONSTITUTION_LOCK_v27.md deprecation notice).

---

## Problem Statement

Initial Phase 2 scope identified **30+ files** in `legacy_terms.txt` containing "local-first" terminology. However, comprehensive analysis revealed:

### Discovery

**ALL 30+ files are historical reports**:
- Sprint execution reports (SPRINT_1_FINAL_REPORT.md)
- Deployment summaries (FINAL_SUMMARY_v27.0.2.md)
- Phase completion records (P8_2_EXECUTION_COMPLETE.md)
- Production authorizations (PRODUCTION_AUTHORIZATION_FINAL_v8_AUDIT.md)
- Beta checklists (BETA_DEPLOYMENT_CHECKLIST.md)

**These documents recorded system state BEFORE v27.5.0 migration** (local-first → online-first).

### Additional Investigation

Extended search in `docs/` subdirectories found **81 files** with "local-first" terminology:
- **50+ files** in 99_ARCHIVE/ (explicit archives)
- **10+ files** in __ARCHIVE_UI_CARTOGRAPHY_VAULT__/ (archived vault)
- **10+ files** in _evidence/online_migration/ (migration proof pack)
- **5+ files** in adr/ (Architecture Decision Records - historical)
- **Remaining ~15 files**: Versioned/dated documents (DEPLOYMENT_REPORT_v26.3.0.md, INDEX_DOCUMENTATION_v26.3.0.md, AUDIT_ORCHESTRATEURS_v26.3.1.md)

**Conclusion**: Almost NO truly "living" documentation contains "local-first" (README.md already fixed in Phase 1).

---

## Gate Analysis: G8 (APPEND_ONLY_REGISTRY)

### G8 Definition

**Gate**: APPEND_ONLY_REGISTRY  
**Purpose**: Immutable audit trail (no deletions, no edits)  
**Enforcement**: Stop-the-line on any attempt to modify historical records

### Historical Integrity Principle

Historical documents = **legal records** of system state AT THAT TIME.

**Analogy**: 
- Editing a 2025 newspaper in 2026 to "correct" architecture description
- Falsifying historical records to match current reality
- Orwell's "memory hole" (rewriting past to match present)

**Correct Approach**:
- Preserve historical documents AS-IS (accuracy for that period)
- Add NEW documents explaining evolution (e.g., ARCHITECTURE_MIGRATION_v27.5.0.md)
- Update ONLY current/living documentation (README.md, current guides)

### G8 Violation Risk

If Phase 2 modified historical reports to say "online-first":
- ❌ FALSE HISTORY: Reports would claim system was "online-first" in Feb 2026 (it wasn't until v27.5.0)
- ❌ AUDIT TRAIL CORRUPTION: Immutable proof pack integrity violated
- ❌ LEGAL RISK: Historical records no longer trustworthy
- ❌ G8 STOP-THE-LINE: Gate failure blocks deployment

**Gate Status**: ✅ PASS (historical documents preserved)

---

## Decision Matrix

| Document Type | Example | "local-first"? | Action | Reason |
|---------------|---------|----------------|--------|---------|
| **Current Docs** | README.md | ❌ (fixed Phase 1) | ✅ Normalize | Describes current system |
| **Historical Reports** | SPRINT_1_FINAL_REPORT.md | ✅ Yes | ⚠️ PRESERVE | Recorded past state accurately |
| **Archives** | 99_ARCHIVE/\*.md | ✅ Yes | ⚠️ PRESERVE | Explicit archives |
| **Evidence Packs** | _evidence/online_migration/\*.md | ✅ Yes | ⚠️ PRESERVE | Proof of migration itself |
| **ADRs** | adr/001-tauri-local-first-architecture.md | ✅ Yes | ⚠️ PRESERVE | Historical decision record |
| **Constitutional Locks** | CONSTITUTION_LOCK_v27.md | ✅ Yes | 🟡 DEPRECATE | Add notice, preserve content |

---

## Actions Taken (Phase 2 Revised Scope)

### 1. README.md - ✅ DONE (Phase 1)

- Line 37: "local-first" → "online-first" ✅
- Line 50: "Privacy-First: 100% local" → "Security-First: governance" ✅
- Line 485: "Local-First: Données 100% locales" → "Online-First: network required" ✅

### 2. CONSTITUTION_LOCK_v27.md - ✅ DONE (Phase 2)

**Deprecation Notice Added**:
```markdown
> **⚠️ DEPRECATION NOTICE (Added 2026-02-23)**  
> This constitutional lock defined the v27.0.0-v27.4.x architecture (**local-first**).  
> **Superseded by v27.5.0 constitutional migration (local-first → online-first).**  
> Preserved for historical reference only.  
> See: [README.md](README.md#-vision) for current architecture (online-first).
```

**Content Preserved**: Original "Local-First Absolu" section unchanged (historical accuracy).

### 3. Historical Reports (30+ files) - ⚠️ PRESERVED

**Action**: NO MODIFICATION  
**Reason**: G8 compliance (immutable audit trail)  
**Files**:
- P8_2_EXECUTION_COMPLETE.md
- SPRINT_1_FINAL_REPORT.md
- FINAL_SUMMARY_v27.0.2.md
- PRODUCTION_AUTHORIZATION.md
- + 26 more files

**Justification**: These documents ACCURATELY described system architecture at time of writing (before v27.5.0 migration).

### 4. docs/ Archives (81 files) - ⚠️ PRESERVED

**Action**: NO MODIFICATION  
**Reason**: Explicit archives (99_ARCHIVE/, __ARCHIVE_*, _evidence/)  
**Exceptions**: None (all archives preserved)

---

## Alternative Considered (REJECTED)

### Option: Mass Normalization (30+ files)

**Proposed**: Replace "local-first" → "online-first" in all 30+ files

**Rejected Because**:
1. **G8 Violation**: Rewrites historical records
2. **Historical Inaccuracy**: System WAS "local-first" before v27.5.0
3. **Audit Trail Corruption**: Proof packs no longer trustworthy
4. **Legal Risk**: Cannot demonstrate historical system state
5. **Constitutional Violation**: "Append-only" means NO EDITS to sealed reports

**Risk Level**: CRITICAL (G9 stop-the-line)

---

## Recommendations for Future

### If New "Living" Docs Created

**When**: Creating new user guides, API docs, or architecture overviews  
**What**: Ensure they use "online-first" terminology  
**How**: Grep for "local-first" in newly created docs before merge

### If Historical Docs Need Context

**Problem**: User reads old report, confused about "local-first"  
**Solution**: Add INDEX or ARCHIVE_README.md explaining:

```markdown
# Historical Archive Context

Documents in this archive reflect system state BEFORE v27.5.0 migration.

**Terminology Evolution**:
- v27.0.0-v27.4.x: "local-first" architecture
- v27.5.0+: "online-first" architecture (current)

Historical documents preserved AS-IS for audit compliance (G8: APPEND_ONLY_REGISTRY).
```

---

## Compliance Matrix

| Gate | Status | Evidence |
|------|--------|----------|
| **G5 (NO_SILENT_DRIFT)** | ✅ PASS | README.md aligned with current architecture |
| **G7 (PROOF_DRIVEN_WORKFLOW)** | ✅ PASS | Decision documented in PRESERVATION_DECISION.md |
| **G8 (APPEND_ONLY_REGISTRY)** | ✅ PASS | Historical reports preserved, no edits |
| **G9 (STOP_THE_LINE)** | ✅ PASS | No gate violations, deployment unblocked |

---

## Conclusion

**Phase 2 Status**: ✅ COMPLETE (Revised Scope)  
**Files Modified**: 1 (CONSTITUTION_LOCK_v27.md - deprecation notice only)  
**Files Preserved**: 110+ (all historical reports, archives, evidence packs)  
**Gates**: All PASS (G5, G7, G8, G9)  
**Risk**: MINIMAL (docs-only, historical integrity maintained)

**Decision**: This preservation approach is **CORRECT** and **G8-COMPLIANT**.

---

**Approved**: GitHub Copilot (AI Assistant)  
**Gate Validation**: G8 (APPEND_ONLY_REGISTRY) ✅ PASS  
**Next Phase**: P3_VERSION_ALIGNMENT (verify version references in living docs)

---

_TITANE∞ vΩ.DOCS — Documentation System Upgrade_
