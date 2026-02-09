# DELTA RUNNER PROTOCOL v1.0
**Authority:** UI Cartography V6.1 + Kevin V5 Baseline Comparison  
**Purpose:** Auto-executable protocol for comparing Copilot V6 cartography with Kevin V5 baseline  
**Status:** READY (blocked on Kevin V5 baseline import)  
**Last Updated:** 2026-02-08

---

## 0. PRECONDITIONS (BLOCKING)

**Execute these checks BEFORE any delta comparison:**

```bash
# Check 1: Kevin V5 folder exists
if [ ! -d "docs/reference/kevin-v5/" ]; then
  echo "❌ BLOCKED: docs/reference/kevin-v5/ not found"
  echo "Action: Import Kevin V5 baseline before running delta"
  exit 1
fi

# Check 2: Kevin V5 contains files
file_count=$(find docs/reference/kevin-v5/ -type f | wc -l)
if [ "$file_count" -eq 0 ]; then
  echo "❌ BLOCKED: docs/reference/kevin-v5/ is empty"
  echo "Action: Extract/place Kevin V5 files in this directory"
  exit 1
fi

echo "✅ Preconditions met: Kevin V5 baseline present ($file_count files)"
```

**IF PRECONDITIONS FAIL:**
- STOP immediately
- Create: `VERIFICATION/DELTA_BLOCKED_LOG.md` with reason
- Do NOT modify VERDICT.md
- Do NOT change Gate F status from BLOCKED
- Exit with error code

**IMPORT SPECIFICATION:**
- Kevin V5 import must follow: `docs/reference/kevin-v5/KEVIN_V5_IMPORT_SPEC.md`
- Delta execution assumes: `KEVIN_V5_IMPORT_CHECKLIST.md` ALL items PASS

---

## 1. NORMALIZATION RULES

Kevin V5 may contain heterogeneous formats. Apply these normalization rules:

### Format Handling

| Format | Handling |
|--------|----------|
| **PDF** | Extract text with `pdftotext` or similar. Parse sections by headers. Extract tables if possible. |
| **ZIP** | Extract to `docs/reference/kevin-v5/extracted/`. Catalog contents. Process extracted files. |
| **MD** | Parse as-is. Extract headers, tables, lists. Structured comparison. |
| **DOCX** | Convert to MD or text. Parse structure. |
| **Images** | OCR if text-heavy. Otherwise describe content manually. |
| **JSON/YAML** | Parse directly. Compare schemas. |

### Section Mapping

Map Kevin V5 content to Copilot V6 structure:

| Kevin V5 Section | Copilot V6 Equivalent |
|------------------|----------------------|
| Navigation/Routes | 10-navigation/ |
| Pages/Tabs/Screens | 25-visual-map/ |
| Components | 20-components/ |
| IPC/Contracts | 30-contracts/ |
| States/UI Flows | 35-states/ |
| Error Handling | 40-observability/ |
| Issues/Problems | 50-audit/ |
| Architecture | 55-nonconformities/ |

### Conflict Resolution Rules

When Kevin V5 and Copilot V6 disagree:

1. **Structural truth:** Copilot V6 wins (code-driven, path:line proofs)
2. **UX/Visual truth:** Kevin V5 wins (human observation, screenshots)
3. **Count discrepancies:** Copilot V6 wins (automated scan, reproducible)
4. **Intent/Goals:** Kevin V5 wins (human intention, product vision)
5. **Unknowns:** Mark as DIVERGENT + investigation needed

---

## 2. DELTA EXECUTION (7 PHASES)

### Phase 1: Baseline Catalog

**Goal:** Inventory Kevin V5 contents

```bash
# Create catalog
find docs/reference/kevin-v5/ -type f > /tmp/kevin-v5-catalog.txt

# Generate summary
echo "Kevin V5 Baseline Catalog" > VERIFICATION/KEVIN_V5_CATALOG.md
echo "Found: $(wc -l < /tmp/kevin-v5-catalog.txt) files" >> VERIFICATION/KEVIN_V5_CATALOG.md
echo "" >> VERIFICATION/KEVIN_V5_CATALOG.md
cat /tmp/kevin-v5-catalog.txt >> VERIFICATION/KEVIN_V5_CATALOG.md
```

**Output:** `VERIFICATION/KEVIN_V5_CATALOG.md`

### Phase 2: Navigation Comparison

**Goal:** Compare routes, tabs, menus, navigation structure

**Copilot V6 Sources:**
- 10-navigation/10-topbar-map.md
- 10-navigation/11-sections-map.md
- 10-navigation/12-routes-map.md
- 25-visual-map/25-screen-map.md

**Kevin V5 Sources:** (locate equivalent sections)

**Compare:**
- TopNav items (7 sections: TITANE, TIME, STATS, ADMIN, DEV, PLUS, settings)
- Route count (87 in V6)
- Tab counts per section (TITANE: 8, DEV: 9, ADMIN: 5, STATS: 4)
- Active vs deprecated routes

**Output:** Section in DELTA_REPORT.md

### Phase 3: Component Comparison

**Goal:** Compare component inventory, responsibilities

**Copilot V6 Sources:**
- 20-components/20-inventory-by-feature.md
- 20-components/21-inventory-by-filetree.md
- 25-visual-map/25-screen-map.md

**Kevin V5 Sources:** (locate component lists)

**Compare:**
- Total components (296 in V6)
- Major pages/screens
- Persistent widgets (6 in V6)
- Missing components (in Kevin but not V6)
- Extra components (in V6 but not Kevin)

**Output:** Section in DELTA_REPORT.md

### Phase 4: Contracts Comparison

**Goal:** Compare IPC/HTTP contracts, endpoints

**Copilot V6 Sources:**
- 30-contracts/30-ipc-invocations-index.md
- VERIFICATION/TRUTH_IPC.md (1182 invocations)
- VERIFICATION/TRUTH_HTTP_PROXY.md

**Kevin V5 Sources:** (locate IPC/API documentation)

**Compare:**
- IPC command count (180+ commands in V6)
- HTTP endpoints (Ollama proxy in V6)
- Contract schemas (request/response)
- Error handling patterns

**Output:** Section in DELTA_REPORT.md

### Phase 5: States Comparison

**Goal:** Compare UI states, loading/error/empty patterns

**Copilot V6 Sources:**
- 35-states/38-empty-loading-error-catalog.md
- VERIFICATION/TRUTH_ZERO_SILENCE.md

**Kevin V5 Sources:** (locate UI state documentation)

**Compare:**
- Loading states coverage
- Error boundaries (3-layer in V6)
- Empty state handling
- Silent catch blocks (6 accepted in V6)

**Output:** Section in DELTA_REPORT.md

### Phase 6: Observability Comparison

**Goal:** Compare error handling, boot pipeline, diagnostics

**Copilot V6 Sources:**
- 40-observability/40-boot-pipeline.md
- 40-observability/41-error-boundaries.md
- VERIFICATION/TRUTH_PROD_BOOT.md

**Kevin V5 Sources:** (locate observability docs)

**Compare:**
- Boot chain (main.tsx → App.tsx in V6)
- Error boundary coverage
- Console monitoring
- Diagnostic mode

**Output:** Section in DELTA_REPORT.md

### Phase 7: Issues Comparison

**Goal:** Compare issue registers, P0/P1/P2 lists

**Copilot V6 Sources:**
- 50-audit/50-issues-register.md (8 issues: 0 P0, 1 P1, 5 P2, 2 P3)
- 55-nonconformities/55-nonconformities-register.md (9 NCs)
- UI_ARBITRATION_LOG.md (decisions)

**Kevin V5 Sources:** (locate issue lists)

**Compare:**
- P0 count (0 in V6)
- P1 count (1 in V6: P1-4 Tab Overflow)
- Known issues (match/divergent)
- Fixed issues (V6 vs Kevin)

**Output:** Section in DELTA_REPORT.md + DELTA_ISSUES.md

---

## 3. OUTPUTS (4 MANDATORY FILES)

### Output 1: DELTA_REPORT.md

**Location:** `docs/ui-carto-copilot/70-compare/DELTA_REPORT.md`

**Structure:**
```markdown
# Delta Report: Copilot V6 vs Kevin V5
## Executive Summary
- Total areas compared: 6
- MATCH count: X
- MISSING count: Y (in V6 but not Kevin)
- EXTRA count: Z (in Kevin but not V6)
- DIVERGENT count: W

## 1. Navigation
[Table: MATCH/MISSING/EXTRA/DIVERGENT]

## 2. Components
[Table]

## 3. Contracts
[Table]

## 4. States
[Table]

## 5. Observability
[Table]

## 6. Issues
[Table]

## Conclusion
Overall delta status: [ACCEPTABLE / CONCERNING / CRITICAL]
```

**Use template:** `DELTA_REPORT_TEMPLATE.md`

### Output 2: DELTA_ISSUES.md

**Location:** `docs/ui-carto-copilot/70-compare/DELTA_ISSUES.md`

**Purpose:** New issues discovered ONLY from delta comparison

**Structure:**
```markdown
# Delta-Discovered Issues

## New Issues from Delta

| ID | Severity | Description | Source | Proof |
|----|----------|-------------|--------|-------|
| DELTA-001 | P1 | Missing component X in V6 | Kevin V5 p.23 | ... |
| DELTA-002 | P2 | Route count mismatch | Kevin: 95, V6: 87 | ... |

## Resolution Required
[List issues requiring action]

## Acceptable Divergences
[List differences that are acceptable with rationale]
```

**Use template:** `DELTA_ISSUES_TEMPLATE.md`

### Output 3: DELTA_GATE_SUMMARY.md

**Location:** `docs/ui-carto-copilot/VERIFICATION/DELTA_GATE_SUMMARY.md`

**Purpose:** Gate F status determination

**Structure:**
```markdown
# Gate F Summary: Kevin V5 Delta Comparison

## Execution Status
- Baseline present: YES
- Delta completed: [YES/NO]
- All 6 areas compared: [YES/NO]

## Results
- MATCH: X items
- MISSING: Y items (severity breakdown)
- EXTRA: Z items (severity breakdown)
- DIVERGENT: W items (severity breakdown)

## Gate F Decision
[PASS / FAIL]

Justification: [3-5 lines with proof references]

## Impact on Overall Verdict
- P0 from delta: X
- P1 from delta: Y
- Blocking issues: [list or "none"]
```

### Output 4: VERDICT_UPDATE.md

**Location:** `docs/ui-carto-copilot/VERIFICATION/VERDICT_UPDATE.md`

**Purpose:** Update overall verdict based on delta results

**Structure:**
```markdown
# Verdict Update Post-Delta

## Previous Verdict
Status: FAIL
Reason: Kevin V5 baseline missing (Gate F blocked)

## Delta Results
- Gate F: [PASS/FAIL]
- New P0: X
- New P1: Y
- Acceptable divergences: Z

## Updated Verdict
Status: [PASS / FAIL]

Justification (max 5 lines):
[reasoning with references]

## SEAL Eligibility
[YES / NO]
Reason: [if NO, list blocking issues]
```

---

## 4. VERDICT RULES (STRICT)

**PASS Allowed ONLY IF:**
1. ✅ Kevin V5 baseline present and processed
2. ✅ All 6 comparison areas completed
3. ✅ Delta executed without errors
4. ✅ Gate F = PASS (no critical gaps)
5. ✅ No P0 issues (neither pre-existing nor delta-discovered)
6. ✅ All P1 issues handled OR accepted (via arbitration)
7. ✅ Gates A-E already PASS (verified)

**FAIL IF:**
- ❌ Any P0 issue found (pre-existing or delta)
- ❌ Unhandled P1 issues (no arbitration decision)
- ❌ Missing critical coverage (major component missing)
- ❌ Gate F = FAIL (delta shows critical gaps)

**BLOCKED IF:**
- 🚫 Kevin V5 baseline missing (precondition failed)
- 🚫 Delta cannot execute (errors)

**SEAL Eligibility:**
- Only allowed if VERDICT = PASS
- All gates A-F must = PASS
- All P1 must be handled/accepted
- Constitutional freeze in place

---

## 5. LOGGING (MANDATORY)

### Log File: DELTA_RUN_LOG.md

**Location:** `docs/ui-carto-copilot/VERIFICATION/DELTA_RUN_LOG.md`

**Contents:**
```markdown
# Delta Run Log
Date: [ISO timestamp]
Commit: [git hash]
Executor: [agent/human]

## Precondition Checks
- Kevin V5 folder: [exists/missing]
- File count: [N]
- Formats found: [PDF/MD/ZIP/...]

## Phase Execution
### Phase 1: Baseline Catalog
Command: find docs/reference/kevin-v5/ -type f
Result: [N files]
Duration: [Xs]

### Phase 2: Navigation
Files compared: [list]
Result: [summary]
Duration: [Xs]

[... repeat for all phases ...]

## Outputs Generated
- DELTA_REPORT.md: [created/failed]
- DELTA_ISSUES.md: [created/failed]
- DELTA_GATE_SUMMARY.md: [created/failed]
- VERDICT_UPDATE.md: [created/failed]

## Verdict
Final status: [PASS/FAIL/BLOCKED]
Gate F: [PASS/FAIL]
```

**Use template:** `DELTA_RUN_LOG_TEMPLATE.md`

---

## 6. ROLLBACK PROCEDURES

**IF DELTA EXECUTION FAILS:**

1. Stop immediately at failure point
2. Log error to DELTA_RUN_LOG.md
3. DO NOT modify VERDICT.md
4. DO NOT change Gate F status
5. Create DELTA_FAILURE_REPORT.md with:
   - Phase that failed
   - Error message
   - Files processed so far
   - Partial results (if any)

**IF RESULTS ARE UNCERTAIN:**

1. Mark Gate F as UNCERTAIN (not PASS/FAIL)
2. Create DELTA_REVIEW_NEEDED.md listing ambiguities
3. DO NOT update VERDICT.md until manual review
4. Require human arbitration decision

**ROLLBACK COMMAND:**
```bash
# Remove delta outputs (keep log for forensics)
rm -f docs/ui-carto-copilot/70-compare/DELTA_REPORT.md
rm -f docs/ui-carto-copilot/70-compare/DELTA_ISSUES.md
rm -f docs/ui-carto-copilot/VERIFICATION/DELTA_GATE_SUMMARY.md
rm -f docs/ui-carto-copilot/VERIFICATION/VERDICT_UPDATE.md
# Keep: DELTA_RUN_LOG.md, DELTA_FAILURE_REPORT.md
```

---

## 7. EXECUTION CHECKLIST

Before executing delta comparison, verify:

- [ ] Kevin V5 baseline imported to `docs/reference/kevin-v5/`
- [ ] At least 1 file present in Kevin V5 folder
- [ ] All Copilot V6 docs present (00-preflight through VERIFICATION)
- [ ] Git working tree clean (no uncommitted changes)
- [ ] Templates available (DELTA_REPORT_TEMPLATE.md, etc.)
- [ ] DELTA_RUN_LOG.md ready to populate
- [ ] Current VERDICT.md backed up

**Execution command:**
```bash
# Run delta protocol
./scripts/run-delta-comparison.sh  # (if script created)
# OR manually execute phases 1-7 above
```

**Post-execution:**
- [ ] Verify all 4 outputs generated
- [ ] Review DELTA_REPORT.md for accuracy
- [ ] Check DELTA_GATE_SUMMARY.md for Gate F decision
- [ ] Read VERDICT_UPDATE.md for verdict change
- [ ] Update VERDICT.md per verdict rules
- [ ] Update 09_MANIFEST.json (gate_f_status)
- [ ] Commit with message: `docs(ui): delta comparison complete (kevin v5)`

---

## CONSTITUTIONAL COMPLIANCE

✅ **Blocking Precondition:** Won't execute without Kevin V5  
✅ **Proof-Driven:** All comparisons must cite sources  
✅ **No Hallucination:** DIVERGENT if uncertain  
✅ **Verdict Rules:** Strict PASS/FAIL conditions  
✅ **Rollback Ready:** Clean rollback procedure  
✅ **Logging:** Complete execution audit trail  

---

**END PROTOCOL**
