# Phase 2: Revised Strategy - Historical Preservation

**Date**: 2026-02-23 21:00:00 UTC  
**Decision**: PRESERVE ALL TOP-LEVEL REPORTS (append-only audit trail)

---

## Critical Finding

**ALL 30+ files** in legacy_terms.txt are **historical reports/archives**:

- Sprint reports (SPRINT_1_FINAL_REPORT.md)
- Deployment summaries (FINAL_SUMMARY_v27.0.2.md)
- Phase execution records (P8_2_EXECUTION_COMPLETE.md)
- Audit trails (PRODUCTION_AUTHORIZATION_FINAL_v8_AUDIT.md)

**These are immutable snapshots** documenting system state AT THAT TIME (before v27.5.0 migration).

---

## Gate Compliance: G8 (APPEND_ONLY_REGISTRY)

**G8 Definition**: Immutable audit trail (no deletions, no edits)

Modifying historical reports to say "online-first" when they documented "local-first" architecture **violates G8** by rewriting history.

**Analogy**: Like editing a 2025 newspaper to fix a "mistake" in 2026. The newspaper was accurate for 2025.

---

## Revised Phase 2 Scope

### SKIP: Top-Level Historical Reports

**Action**: PRESERVE all 30+ top-level markdown files  
**Reason**: Historical audit trail (G8 compliance)  
**Files**: All files in legacy_terms.txt

### ADD: Docs Subdirectories Search

**Action**: Search for "local-first" in docs/ subdirectories  
**Target**: Living documentation (not historical reports)  
**Examples**:

- docs/architecture/ (current architecture docs)
- docs/guides/ (current user guides)
- docs/api/ (current API reference)

### EXCEPTION: Constitutional Lock

**File**: CONSTITUTION_LOCK_v27.md  
**Action**: Add deprecation notice (not modify content)  
**Reason**: Mark as superseded by v27.5.0 migration

---

## New Search Strategy

```bash
# Find "local-first" in docs/ subdirectories only (living docs)
rg "local-first|offline-first" --type md docs/ > "$RUN_DIR/PROOF/docs_legacy_terms.txt"

# Exclude historical backups
rg "local-first|offline-first" --type md docs/ \
   --glob '!**/backup_*/**' \
   --glob '!**/*_archive/**' \
   > "$RUN_DIR/PROOF/docs_living_legacy_terms.txt"
```

---

## Expected Result

- **Top-level reports**: Preserved (30+ files, G8 compliance)
- **docs/ living docs**: Normalized (local-first → online-first)
- **CONSTITUTION_LOCK_v27.md**: Deprecation notice added

---

## Justification

**Legal/Audit Perspective**:

- Historical reports = legal records of system state
- Editing historical reports = falsifying records
- G8 (APPEND_ONLY_REGISTRY) exists precisely to prevent this

**Correct Approach**:

- Preserve history AS-IS
- Add new documents explaining evolution (e.g., "ARCHITECTURE_MIGRATION_v27.5.0.md")
- Update ONLY living/current documentation

---

**Status**: STRATEGY REVISED  
**Gate**: G8 (APPEND_ONLY_REGISTRY) compliance ENSURED  
**Next**: Search docs/ for living documentation to normalize
