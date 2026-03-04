# Phase 2: Terminology Normalization Strategy

**Date**: 2026-02-23 20:50:00 UTC  
**Policy**: P2 (Strict Mode, docs-only)  
**Ring**: Ring-4 (UI/Documentation)

---

## Problem: Historical Integrity vs. Current Accuracy

The legacy_terms.txt file contains **30+ files** with "local-first" terminology. However, many of these are **historical reports** documenting the system state AT THAT TIME (before v27.5.0 constitutional migration).

**Key Principle**: **NEVER modify historical documents** (violates G8: APPEND_ONLY_REGISTRY)

---

## Classification Strategy

### Category 1: LIVING DOCUMENTS (MODIFY)

Documents that describe CURRENT system state:

- README.md (✅ DONE in Phase 1)
- ARCHITECTURE.md
- GOVERNANCE.md (if exists)
- DEPLOYMENT.md (if referenced)
- docs/ subdirectories (current documentation)
- Contributing guides
- API references (current)

**Action**: Replace "local-first" → "online-first"

---

### Category 2: HISTORICAL REPORTS (DO NOT MODIFY)

Documents with specific dates/timestamps that record past state:

- P8_2_EXECUTION_COMPLETE.md (2026-02-17 report)
- BETA_DEPLOYMENT_CHECKLIST.md (historical checklist)
- PRODUCTION_AUTHORIZATION.md (v27.0.0 authorization)
- SPRINT_1_FINAL_REPORT.md (sprint report)
- PHASE2_READY_TO_EXECUTE.md (phase report)
- etc. (all reports with dates/versions)

**Action**: PRESERVE AS-IS (historical accuracy)  
**Reason**: G8 (APPEND_ONLY_REGISTRY) - immutable audit trail

---

### Category 3: CONSTITUTIONAL LOCKS (DEPRECATION NOTICE)

Documents that defined OLD architecture but are now superseded:

- CONSTITUTION_LOCK_v27.md (defined v27 architecture before v27.5.0 migration)

**Action**: ADD DEPRECATION NOTICE at top:

```markdown
> **⚠️ DEPRECATION NOTICE (2026-02-23)**  
> This constitutional lock defined the v27.0.0-v27.4.x architecture (local-first).  
> **Superseded by v27.5.0 constitutional migration (local-first → online-first).**  
> Preserved for historical reference only.  
> See: [ARCHITECTURE.md](../01_misc/ARCHITECTURE__ARCHITECTURE.md.md) for current architecture.
```

**Reason**: Preserve historical document but mark as superseded

---

## Execution Plan

### Step 1: Classify Files (AUTOMATED)

```bash
# Classify files by type
for file in $(cat "$RUN_DIR/PROOF/legacy_terms.txt"); do
  # Check if historical (has date/timestamp/version in filename or first 10 lines)
  if grep -qE "Timestamp:|Date:|Session:|Status:.*COMPLETE" "$file" 2>/dev/null | head -10; then
    echo "$file" >> "$RUN_DIR/PROOF/historical_reports.txt"
  elif [ "$file" = "CONSTITUTION_LOCK_v27.md" ]; then
    echo "$file" >> "$RUN_DIR/PROOF/constitutional_locks.txt"
  elif [ -f "$file" ]; then
    echo "$file" >> "$RUN_DIR/PROOF/living_documents.txt"
  fi
done
```

### Step 2: Modify Living Documents ONLY

Use multi_replace_string_in_file for living documents only.

### Step 3: Add Deprecation Notices

Add deprecation notice to constitutional locks.

### Step 4: Document Preservation Decision

Create PROOF/PRESERVATION_DECISION.md explaining why historical reports are preserved.

---

## Expected Results

- **Living Documents**: Terminology normalized (local-first → online-first)
- **Historical Reports**: Preserved as-is (immutable audit trail)
- **Constitutional Locks**: Deprecated notice added (historical reference)

---

## Gates Validation

- G5 (NO_SILENT_DRIFT): ✅ Living docs aligned with current architecture
- G8 (APPEND_ONLY_REGISTRY): ✅ Historical reports preserved (no rewrite)
- G7 (PROOF_DRIVEN_WORKFLOW): ✅ Classification documented in proof pack

---

**Status**: STRATEGY DEFINED  
**Next**: Execute classification and selective normalization
