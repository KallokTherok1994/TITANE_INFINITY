# TITANE∞ — Future-Proof Checklist (One-Page)

**Purpose:** Verify constitutional compliance before UI changes  
**Frequency:** Before every UI change + weekly review  
**Authority:** ARCHITECTURAL_FREEZE_NOTICE.md + GOVERNANCE_RULES.md

---

## Instructions

Run through ALL 7 categories (19 items). Every item must be **PASS**.

If any item is **FAIL** → Stop. Address the issue before proceeding.

---

## A. Governance & Identity (3 items)

### A1. NO_HUMAN_NAME_AUTHORITY
**Rule:** GOV-NO-HUMAN-IDENTITY-ATTRIBUTION  
**Check:** All "Authority:" / "Decision:" lines use system labels (TITANE∞ Governance, Protocol, file refs)

- [ ] **PASS:** No human names in governance docs
- [ ] **FAIL:** Human name found

**Proof location:** docs/ui-carto-copilot/ (scan with grep)  
**Fix:** Replace with system label (see GOVERNANCE_RULES.md)

---

### A2. ARBITRATION_UPDATED
**Rule:** UI_FREEZE_GATES.md (Gate 1)  
**Check:** UI_ARBITRATION_LOG.md has decision entry for this change

- [ ] **PASS:** Decision exists or new entry added
- [ ] **FAIL:** No arbitration reference

**Proof location:** docs/ui-carto-copilot/UI_ARBITRATION_LOG.md  
**Fix:** Add decision entry with FIX_NOW/MONITOR/FREEZE/IGNORE

---

### A3. CHANGE_CONTROL_USED
**Rule:** UI_FREEZE_GATES.md (Gate 14)  
**Check:** CHANGE_CONTROL_TEMPLATE.md filled for this change

- [ ] **PASS:** Template filled, all 10 sections complete
- [ ] **FAIL:** Template not used or incomplete

**Proof location:** docs/ui-carto-copilot/changes/CHANGE-*.md  
**Fix:** Copy and fill CHANGE_CONTROL_TEMPLATE.md

---

## B. Freeze Compliance (3 items)

### B1. FREEZE_GATES_PASSED
**Rule:** UI_FREEZE_GATES.md (Gates 1-14)  
**Check:** All 14 gates passed

- [ ] **PASS:** All gates checked in change control
- [ ] **FAIL:** One or more gates failed

**Proof location:** CHANGE_CONTROL_TEMPLATE.md section 7  
**Fix:** Address failing gate(s) or document exemption

---

### B2. FREEZE_NOTICE_RESPECTED
**Rule:** ARCHITECTURAL_FREEZE_NOTICE.md  
**Check:** No frozen pattern modified without exemption

**Frozen patterns (DO NOT CHANGE):**
- ✅ 4-Ring Model
- ✅ secureInvoke pattern
- ✅ Design system tokens
- ✅ Cognitive Layout (Helios/Nexus)
- ✅ AppRoutes.tsx (canonical router)

- [ ] **PASS:** No frozen pattern changed
- [ ] **FAIL:** Frozen pattern modified

**Proof location:** ARCHITECTURAL_FREEZE_NOTICE.md  
**Fix:** Revert changes or get arbitration exemption

---

### B3. MANIFEST_SYNCHRONIZED
**Rule:** UI_FREEZE_GATES.md (Gate 9)  
**Check:** 09_MANIFEST.json updated with new counts/paths

- [ ] **PASS:** Manifest updated (routes, components, stores, etc.)
- [ ] **FAIL:** Manifest out of sync

**Proof location:** docs/ui-carto-copilot/09_MANIFEST.json  
**Fix:** Update manifest fields (routes_count, components_count, etc.)

---

## C. Anti-Silence (3 items)

### C1. NO_EMPTY_CATCH
**Rule:** ANTI_REGRESSION_SCANS.md (Scan A)  
**Check:** No new silent catch blocks introduced

- [ ] **PASS:** 0 new silent catches OR in NC-UI-SILENCE-EXEMPT-001
- [ ] **FAIL:** New silent catch found

**Proof location:** VERIFICATION/SCAN_RESULTS.md (Scan A)  
**Fix:** Add console.error minimum OR add to NC-UI-SILENCE-EXEMPT-001 with justification

---

### C2. ERRORS_VISIBLE
**Rule:** Zero-silence UI principle  
**Check:** All errors have visible feedback (log, toast, UI state)

- [ ] **PASS:** Every error path has feedback
- [ ] **FAIL:** Silent error found

**Proof location:** 35-states/38-empty-loading-error-catalog.md  
**Fix:** Add console.error/toast/UI error state

---

### C3. EXCEPTIONS_REGISTRY_UPDATED
**Rule:** NC-UI-SILENCE-EXEMPT-001  
**Check:** If new exception needed, added to 55-nonconformities-register.md

- [ ] **PASS:** No exception needed OR exception documented
- [ ] **FAIL:** Exception needed but not documented

**Proof location:** 55-nonconformities/55-nonconformities-register.md  
**Fix:** Add NC-UI-SILENCE-EXEMPT-002 (or update 001) with justification

---

## D. IPC Safety (3 items)

### D1. NO_DIRECT_INVOKE
**Rule:** ANTI_REGRESSION_SCANS.md (Scan B)  
**Check:** No new direct invoke() bypassing wrappers

- [ ] **PASS:** <= 5 total violations (NC-001 known)
- [ ] **FAIL:** New direct invoke found

**Proof location:** VERIFICATION/SCAN_RESULTS.md (Scan B)  
**Fix:** Use secureInvoke or tauriClient wrapper

---

### D2. NO_IPC_FETCH
**Rule:** ANTI_REGRESSION_SCANS.md (Scan C)  
**Check:** No fetch("ipc://") introduced

- [ ] **PASS:** 0 ipc:// fetch found
- [ ] **FAIL:** ipc:// fetch found

**Proof location:** VERIFICATION/SCAN_RESULTS.md (Scan C)  
**Fix:** Remove immediately (P0 violation), use secureInvoke

---

### D3. IPC_WRAPPER_PATTERN
**Rule:** secureInvoke/tauriClient wrapper  
**Check:** All new IPC calls use wrapper pattern

- [ ] **PASS:** All IPC calls wrapped
- [ ] **FAIL:** Unwrapped IPC call found

**Proof location:** Code review + Scan B  
**Fix:** Wrap with secureInvoke(command, payload)

---

## E. Router Canon (2 items)

### E1. NO_ALTERNATE_ROUTER
**Rule:** AppRoutes.tsx is canonical  
**Check:** No new router file introduced (no router2.tsx, routes.tsx, etc.)

- [ ] **PASS:** AppRoutes.tsx remains sole router
- [ ] **FAIL:** Alternate router found

**Proof location:** 10-navigation/15-redirects-and-deadcode.md  
**Fix:** Remove alternate router OR get arbitration decision

---

### E2. ROUTER_DEAD_CODE_ABSENT
**Rule:** src/_deprecated/router.tsx stays deprecated  
**Check:** No reintroduction of deprecated router.tsx

- [ ] **PASS:** router.tsx still in _deprecated/
- [ ] **FAIL:** router.tsx reintroduced

**Proof location:** src/_deprecated/router.tsx  
**Fix:** Move back to _deprecated/ with DEPRECATED header

---

## F. Delta Readiness (2 items)

### F1. GATE_F_BLOCKED
**Rule:** Kevin V5 baseline required  
**Check:** Gate F status remains "BLOCKED_BASELINE_MISSING"

- [ ] **PASS:** Gate F status unchanged
- [ ] **FAIL:** Gate F status modified prematurely

**Proof location:** 09_MANIFEST.json (gate_f_status)  
**Fix:** Revert Gate F status to BLOCKED_BASELINE_MISSING

---

### F2. VERDICT_UNCHANGED
**Rule:** No PASS verdict without Kevin V5 delta  
**Check:** VERIFICATION/VERDICT.md still shows FAIL

- [ ] **PASS:** VERDICT.md unchanged (FAIL status)
- [ ] **FAIL:** VERDICT.md modified

**Proof location:** VERIFICATION/VERDICT.md  
**Fix:** Revert VERDICT.md to FAIL status

---

## G. Forbidden Terms (3 items)

### G1. NO_SCELLE_TERM
**Rule:** Constitutional protocol  
**Check:** No "SCELLÉ" in verdict/status documents

- [ ] **PASS:** No SCELLÉ term found
- [ ] **FAIL:** SCELLÉ term found

**Proof location:** grep "SCELLÉ" docs/ui-carto-copilot/  
**Fix:** Remove SCELLÉ term, use appropriate status

---

### G2. NO_PRET_PRODUCTION_TERM
**Rule:** Constitutional protocol  
**Check:** No "PRÊT PRODUCTION" in verdict documents

- [ ] **PASS:** No PRÊT PRODUCTION term found
- [ ] **FAIL:** PRÊT PRODUCTION term found

**Proof location:** grep "PRÊT PRODUCTION" docs/ui-carto-copilot/  
**Fix:** Remove term, use appropriate status

---

### G3. NO_TERMINE_IN_VERDICT
**Rule:** Constitutional protocol  
**Check:** No "TERMINÉ" in verdict context (OK elsewhere)

- [ ] **PASS:** No TERMINÉ in verdict status
- [ ] **FAIL:** TERMINÉ in verdict

**Proof location:** VERIFICATION/VERDICT.md  
**Fix:** Avoid "TERMINÉ" for verdict; use "PASS" or "FAIL"

---

## Quick Scan Commands

```bash
# A1: Check for human names in authority
grep -rn "Authority:" docs/ui-carto-copilot/ | grep -v "TITANE\|Protocol\|Governance"

# C1: Check for silent catch blocks
rg -n "} catch" src --type ts | wc -l
# Expected: <= 6 (NC-UI-SILENCE-EXEMPT-001)

# D1: Check for direct invoke
rg -n "invoke\(" src --type ts | grep -v "secureInvoke\|tauriClient" | wc -l
# Expected: <= 5 (NC-001)

# D2: Check for IPC fetch
rg -n 'ipc://' src --type ts | wc -l
# Expected: 0

# E1: Check for alternate router
find src -name "router*.tsx" -o -name "routes.tsx" | grep -v "_deprecated"
# Expected: 0 results (only AppRoutes.tsx allowed)

# G1-G3: Check forbidden terms
grep -rn "SCELLÉ\|PRÊT PRODUCTION" docs/ui-carto-copilot/VERIFICATION/VERDICT.md
# Expected: 0 results
```

---

## Summary

**Total Checkpoints:** 19  
**Required PASS:** 19/19 (100%)

**Categories:**
- A. Governance & Identity: 3 items
- B. Freeze Compliance: 3 items
- C. Anti-Silence: 3 items
- D. IPC Safety: 3 items
- E. Router Canon: 2 items
- F. Delta Readiness: 2 items
- G. Forbidden Terms: 3 items

**If ALL PASS** → Proceed with change  
**If ANY FAIL** → Stop, fix, re-check

---

**Status:** ✅ CHECKLIST READY
