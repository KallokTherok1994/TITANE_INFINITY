# TITANE∞ — UI Change Control Template

**Purpose:** Mandatory template for ALL UI architectural changes  
**Authority:** ARCHITECTURAL_FREEZE_NOTICE.md + UI_FREEZE_GATES.md (Gate 14)  
**Status:** REQUIRED

---

## Instructions

1. **Copy this template** to a new file: `docs/ui-carto-copilot/changes/CHANGE-YYYY-MM-DD-description.md`
2. **Fill all 10 sections** (mandatory)
3. **Update UI_ARBITRATION_LOG.md** with decision entry
4. **Pass all Freeze Gates** (UI_FREEZE_GATES.md)
5. **Attach to PR** or commit message

---

## 1. Change Summary

**One-line description:**
<!-- Example: "Add SETTINGS tab to DEV section with 5 configuration panels" -->

**Change type:**
- [ ] New route/page
- [ ] New navigation section/tab
- [ ] New component (major)
- [ ] New store (Zustand)
- [ ] New IPC pattern
- [ ] Layout/AppShell modification
- [ ] Router change
- [ ] Design system change
- [ ] Other (specify):

**Motivation:**
<!-- Why is this change needed? User need, bug, technical debt, etc. -->

---

## 2. Ring Impact

**Primary Ring:** Ring 4 (UI/OS)

**Affected Rings:**
- [ ] Ring 1 (Core) - If yes, explain:
- [ ] Ring 2 (Engines) - If yes, explain:
- [ ] Ring 3 (Services) - If yes, explain:
- [ ] Ring 4 (UI/OS) - Always yes for UI changes

**4-Ring Compliance:**
- [ ] No Ring 2 importing Ring 3
- [ ] No Ring 1 importing anything
- [ ] UI changes contained to Ring 4

---

## 3. Authorized By

**Decision authority (REQUIRED):**
<!-- Must reference ONE of: -->
- [ ] UI_ARBITRATION_LOG.md entry: [ID / date / decision]
- [ ] New arbitration entry added (attach decision document)
- [ ] Emergency fix (P0 only) - post-facto arbitration required within 24h

**Decision link:**
<!-- Example: "docs/ui-carto-copilot/UI_ARBITRATION_LOG.md line 245, decision: FIX_NOW" -->

**Governance compliance:**
- [ ] No human name attribution (GOV-NO-HUMAN-IDENTITY-ATTRIBUTION)
- [ ] Authority uses system label (TITANE∞ Governance / Protocol / file ref)

---

## 4. Scope Boundaries

**What IS changed:**
<!-- List files/components/routes explicitly -->
- File: `src/...`
- Component: `...`
- Route: `/...`

**What is NOT changed:**
<!-- Critical: State what you're NOT touching to prevent scope creep -->
- [ ] Routing system (AppRoutes.tsx remains canonical)
- [ ] Design tokens (visual-states.ts unchanged)
- [ ] 4-ring architecture (no imports violations)
- [ ] IPC wrapper pattern (secureInvoke/tauriClient)
- [ ] Other frozen patterns: [list]

**Line of code estimate:**
- Added: ~N lines
- Modified: ~N lines
- Deleted: ~N lines

---

## 5. Risks

**P0 Risks (Blocking):**
<!-- Production-breaking, data loss, security -->
- [ ] None identified
- [ ] Risk: [description] - Mitigation: [plan]

**P1 Risks (Major):**
<!-- User-facing regression, performance -->
- [ ] None identified
- [ ] Risk: [description] - Mitigation: [plan]

**P2 Risks (Minor):**
<!-- UI inconsistency, minor UX -->
- [ ] None identified
- [ ] Risk: [description] - Mitigation: [plan]

**Security considerations:**
- [ ] No new secrets hardcoded
- [ ] No new IPC commands without allowlist check
- [ ] No fetch("ipc://") introduced
- [ ] secureInvoke wrapper used for all IPC

---

## 6. Proof Plan

**Required proofs (check all that apply):**
- [ ] Path:line references for all changed files
- [ ] Before/after code snippets
- [ ] Screenshots (optional but recommended for UI)
- [ ] Console logs showing no errors
- [ ] Anti-regression scans passed (ANTI_REGRESSION_SCANS.md)

**Proof artifacts:**
<!-- List where proofs are stored -->
- File: `docs/ui-carto-copilot/VERIFICATION/CHANGE-YYYY-MM-DD-proof.md`
- Screenshots: `docs/ui-carto-copilot/screenshots/...`

**Code references:**
<!-- Example proof -->
```
File: src/components/NewComponent.tsx
Lines: 1-150 (new file)
Proof: [paste key code snippet or path:line]
```

---

## 7. Tests / Gates to Run

**Required tests:**
- [ ] `pnpm run lint` (must pass)
- [ ] `pnpm run typecheck` (must pass)
- [ ] `pnpm run test` (if applicable)
- [ ] `pnpm run build` (must succeed)
- [ ] Manual UI testing (describe scenario)

**Freeze gates (all must pass):**
- [ ] Gate 1: ARBITRATION_REFERENCE (decision cited)
- [ ] Gate 2: PROOF_REQUIRED (path:line provided)
- [ ] Gate 3: MINIMAL_CHANGE (scope minimal)
- [ ] Gate 4: NO_SCOPE_CREEP (boundaries defined)
- [ ] Gate 5: ROLLBACK_READY (plan documented)
- [ ] Gate 6: FOUR_RING_COMPLIANCE (no violations)
- [ ] Gate 7: FREEZE_PATTERN_RESPECT (no frozen pattern changed)
- [ ] Gate 8: NO_NEW_SILENCE_UI (errors logged/displayed)
- [ ] Gate 9: MANIFEST_SYNC (09_MANIFEST.json updated)
- [ ] Gate 10: DOCUMENTATION_UPDATE (relevant docs updated)
- [ ] Gate 11: ACCEPTED_EXCEPTIONS (NC-* if needed)
- [ ] Gate 12: NO_HUMAN_NAME_AUTHORITY (system labels only)
- [ ] Gate 13: ANTI_REGRESSION_SCANS (if major change)
- [ ] Gate 14: CHANGE_CONTROL_USED (this template filled)

---

## 8. Rollback Plan

**How to undo this change:**
<!-- Must be specific and executable -->
```bash
# Step 1: Revert commit
git revert <commit-hash>

# Step 2: Restore files (if needed)
git checkout <previous-commit> -- src/file.ts

# Step 3: Clean build
pnpm run clean && pnpm run build

# Step 4: Verify
pnpm run test
```

**Rollback risk assessment:**
- [ ] Low risk (isolated change)
- [ ] Medium risk (explain):
- [ ] High risk (explain):

**Backup strategy:**
- [ ] Branch: `backup/before-change-YYYY-MM-DD`
- [ ] Tag: `pre-change-YYYY-MM-DD`
- [ ] Other: [describe]

---

## 9. Freeze Exemption

**Is this change exempt from any freeze gates?**
- [ ] No exemption needed (standard change)
- [ ] Yes, exemption required

**If exemption required:**
<!-- Exemptions are RARE and require strong justification -->

**Exempted gate(s):**
- Gate #: [number]
- Reason: [strong justification]
- Compensating control: [alternative safety measure]

**Exemption authority:**
- [ ] Emergency P0 fix (post-facto arbitration within 24h)
- [ ] Arbitration log explicitly grants exemption
- [ ] Other (must be documented):

---

## 10. Registry / Logs to Update

**Required updates (check when done):**
- [ ] **UI_ARBITRATION_LOG.md** - Add decision entry or reference existing
- [ ] **09_MANIFEST.json** - Update counts (routes, components, stores, etc.)
- [ ] **50-audit/50-issues-register.md** - Close related issues or add new
- [ ] **55-nonconformities/55-nonconformities-register.md** - Add NC-* if exception needed
- [ ] **ARCHITECTURAL_FREEZE_NOTICE.md** - Update if frozen pattern added
- [ ] **UI_FREEZE_GATES.md** - Update if new gate needed
- [ ] **VERIFICATION/SCAN_RESULTS.md** - Log anti-regression scan results

**Documentation updates:**
- [ ] README.md (if user-facing)
- [ ] Component cards (20-components/22-component-cards/)
- [ ] Routes map (10-navigation/12-routes-map.md)
- [ ] Visual map (25-visual-map/25-screen-map.md)
- [ ] Other: [list]

---

## Constitutional Compliance Checklist

Before submitting this change control:

- [ ] ✅ All 10 sections filled (no TBD/TODO)
- [ ] ✅ Authority uses system labels (no human names)
- [ ] ✅ Proof-driven (path:line or command outputs)
- [ ] ✅ Minimal change (smallest possible scope)
- [ ] ✅ Rollback plan executable (tested mentally)
- [ ] ✅ Freeze gates passed (all 14 checked)
- [ ] ✅ No forbidden terms (SCELLÉ/PRÊT PRODUCTION)
- [ ] ✅ Registries updated (manifest, arbitration, issues)

---

## Example (Filled Template)

<details>
<summary>Click to see example</summary>

### 1. Change Summary
**One-line:** Add SETTINGS tab to DEV section with configuration panels

**Change type:** ☑ New route/page

**Motivation:** User needs centralized settings for Ollama host, model selection, and preferences

### 2. Ring Impact
**Primary Ring:** Ring 4 (UI/OS)
**Affected:** Ring 4 only

### 3. Authorized By
**Authority:** UI_ARBITRATION_LOG.md entry #45, decision: FIX_NOW (Sprint N+2)

### 4. Scope Boundaries
**IS changed:** src/pages/SettingsPage.tsx (new), AppRoutes.tsx (add route)
**NOT changed:** Design tokens, IPC patterns, routing system core

### 5. Risks
**P0:** None
**P1:** None
**P2:** Minor - Settings tab might overflow (>8 tabs)

### 6. Proof Plan
**Proofs:** path:line in src/pages/SettingsPage.tsx:1-200, screenshot attached

### 7. Tests
**Tests:** lint ✅, typecheck ✅, build ✅, manual UI ✅
**Gates:** All 14 passed ✅

### 8. Rollback
```bash
git revert abc123
pnpm run build
```

### 9. Freeze Exemption
**Exemption:** No

### 10. Registry Updates
**Updated:** UI_ARBITRATION_LOG.md ✅, 09_MANIFEST.json ✅, routes-map.md ✅

</details>

---

**Status:** ✅ TEMPLATE READY FOR USE
