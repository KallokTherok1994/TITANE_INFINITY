# TITANE∞ — UI FREEZE GATES (Anti-Drift Rules)

**Authority:** ARCHITECTURAL_FREEZE_NOTICE.md  
**Date:** 2026-02-08 (v1.2 - Gates 12-14 added)  
**Mode:** Governance enforcement (doc-only, manual review)

---

## Purpose

These gates prevent **architectural drift** in the frozen UI codebase.

Every UI change must pass these checks before merge.

---

## Gate 1: ARBITRATION REFERENCE

**Rule:** Every UI architectural change MUST reference a decision from:
- `docs/ui-carto-copilot/UI_ARBITRATION_LOG.md`, OR
- A new arbitration entry with explicit justification

**What Counts as "Architectural":**
- New routes/pages
- New navigation sections/tabs
- New persistent widgets
- New stores (Zustand)
- New IPC patterns
- Layout/AppShell changes
- Router modifications
- Design system breaking changes

**What Does NOT Count:**
- Bug fixes (proven, localized)
- Documentation updates
- Test additions
- Console.log cleanup
- Performance optimizations (non-structural)

**Enforcement:**
- PR description must cite arbitration decision
- Reviewer checks `UI_ARBITRATION_LOG.md` entry exists
- No merge without reference

**Example:**
```
✅ GOOD:
"Add new SETTINGS tab (Authority: UI_ARBITRATION_LOG.md entry #23, decision: FIX_NOW)"

❌ BAD:
"Add new SETTINGS tab (we need this feature)"
```

---

## Gate 2: NO LAYOUT/NAVIGATION DRIFT

**Rule:** Layout, navigation, and routing MUST NOT change without explicit arbitration entry.

**Protected Files:**
- `src/App.tsx` (layout shell)
- `src/AppRoutes.tsx` (canonical router)
- `src/ui/AppLayout.tsx` (persistent zones)
- `src/ui/AppShell.tsx` (shell structure)
- `src/ui/AppNav.tsx` (top navigation)
- `src/ui/TopNav.tsx` (sections)

**Allowed Without Arbitration:**
- Bug fixes (proven regression)
- Style/CSS tweaks (no structural change)
- Accessibility improvements (ARIA, keyboard)

**Forbidden Without Arbitration:**
- Adding/removing nav sections
- Changing layout zones
- Router architecture changes
- Tab overflow handling changes
- Persistent widget additions

**Enforcement:**
- Diff review on protected files
- Justification in PR body required
- Reference to arbitration decision

---

## Gate 3: NO "SCELLÉ" UNTIL KEVIN V5

**Rule:** FORBIDDEN to use these terms in docs/PR/commits until Gate F finalisée:
- "SCELLÉ"
- "PRÊT PRODUCTION"
- "TERMINÉ" (in absolute sense)
- "APPROVED FOR PRODUCTION"

**Reason:** Kevin V5 delta comparison blocked (Gate F)

**Allowed Terms:**
- "V6 cartography updated"
- "Hygiene sprint terminé"
- "Freeze active"
- "Delta pending"

**Enforcement:**
- Grep docs for forbidden terms
- PR review rejects premature "SCELLÉ"
- README status must say "Delta pending"

**Gate F Unblock Conditions:**
1. Kevin V5 baseline imported to `docs/reference/kevin-v5/`
2. Delta comparison executed (DELTA_VS_KEVIN_V5.md)
3. All P0 divergences addressed
4. VERDICT.md updated to PASS

**Until then:** ❌ NO SCELLEMENT

---

## Gate 4: PROOF REQUIREMENT

**Rule:** Every change must provide proof:
- Path:line references for claims
- Before/after code snippets
- Test results (lint, typecheck minimum)
- Rollback plan documented

**Proof Pack Template:**
```markdown
## Change Proof

**Files Modified:** (list with line numbers)
**Before:** (code snippet or state)
**After:** (code snippet or state)
**Tests:** (lint, typecheck, build status)
**Rollback:** (exact commands to revert)
**Risk:** (assessment + mitigation)
```

**Enforcement:**
- PR description must include proof section
- Reviewer validates proof accuracy
- No "trust me" merges

---

## Gate 5: MINIMAL CHANGE DISCIPLINE

**Rule:** Changes must be **surgical**, not **sweeping**.

**Allowed:**
- Single file, focused fix
- 1-3 files, tightly related
- Additive changes (no removal unless proven dead)

**Forbidden:**
- "While we're here" refactors
- Multi-concern PRs
- Large-scale renames without arbitration
- Architectural pivots

**Enforcement:**
- Diff size review (<200 lines preferred)
- Multi-file changes require justification
- Reviewer checks for scope creep

---

## Gate 6: 4-RING COMPLIANCE

**Rule:** Changes MUST respect 4-ring architecture:
- Ring 1 (Core): NO imports (self-contained)
- Ring 2 (Engines): ONLY import Ring 1
- Ring 3 (Services): Import Ring 1 + Ring 2
- Ring 4 (OS/UI): Import all rings

**Enforcement:**
- Check imports in modified files
- Reject if inner ring imports outer ring
- Exception: cognitiveLayoutIntegrations.ts (documented bridge)

**Verification Command:**
```bash
# Example: Check if engine imports service (violation)
$ grep -rn "from.*services" src/engines/
# Expected: 0 results
```

---

## Gate 7: NO NEW SILENCE UI

**Rule:** New code MUST NOT introduce silent failures.

**Required:**
- All catch blocks must log errors (console.error minimum)
- All async operations have timeout/fallback
- All user actions have feedback (success/error/loading)

**Forbidden:**
- Empty catch blocks `} catch { }`
- Swallowed errors without logs
- Silent state updates
- Infinite loaders

**Enforcement:**
- Review catch blocks in diff
- Check for console.error or toast
- Verify fallback UI exists

---

## Gate 8: FREEZE PATTERN RESPECT

**Rule:** Frozen patterns MUST be preserved:

**FREEZE (No Changes):**
- 4-Ring architecture
- secureInvoke wrapper pattern
- Design system tokens
- Cognitive Layout (Helios/Nexus)
- AppRoutes.tsx routing pattern

**MONITOR (Changes Allowed, But Tracked):**
- Hook depth (document if >15)
- Effect cascades (document if >3 levels)
- Store granularity (profile before split)
- Provider count (hard limit: 10)
- Tab count (soft limit: 8)

**Enforcement:**
- Check if change affects frozen pattern
- Require arbitration entry if so
- Monitor metrics for tracked patterns

---

## Gate 9: DOCUMENTATION SYNC

**Rule:** Code changes MUST update corresponding docs.

**Affected Docs:**
- `09_MANIFEST.json` (counts, structure)
- `README.md` (status, metrics)
- `50-issues-register.md` (if issue resolved)
- Component-specific docs (if exists)

**Enforcement:**
- Reviewer checks doc updates
- Manifest counts must reflect reality
- Issues register must be current

---

## Gate 10: ROLLBACK READINESS

**Rule:** Every change must be **trivially rollback-able**.

**Requirements:**
- Rollback plan in PR description
- No data migrations (UI only)
- No irreversible deletions (use _deprecated/)
- Commit message clear for revert

**Enforcement:**
- Reviewer validates rollback plan
- Test rollback if high risk
- Keep deprecation path open

---

## Gate 11: ACCEPTED EXCEPTIONS

**Rule:** Some non-conformities are **governed exceptions** (monitored, not fixed).

**NC-UI-SILENCE-EXEMPT-001: 6 Silent Catches (P2)**

**Authority:** P1-2_REARBITRAGE_PROOF.md (2026-02-08)

**Allowed Exception (6 files):**
1. `src/stores/panelsStore.ts:646` - localStorage.removeItem
2. `src/stores/useVisionStore.ts:292` - device permission
3. `src/stores/useVisionStore.ts:522` - device permission
4. `src/stores/usePerformanceStore.ts:279` - optimization apply
5. `src/stores/effectsStore.ts:483` - localStorage.removeItem
6. `src/engines/aiPredictiveEngine.ts:533` - network latency

**Why Accepted:**
- Non-user-facing operations (browser APIs)
- Safe fallback behavior (defaults, no-op)
- Inline comments document context
- Zero UX impact measured

**Rule for New Silent Catches:**
- ❌ FORBIDDEN without arbitration update
- Must reference UI_ARBITRATION_LOG.md decision
- Must justify why exception is needed
- Must document trigger-to-fix conditions

**Enforcement:**
- Manual diff review (catch blocks)
- Check if new catch is in exception list
- If not in list → require console.error + justification
- Quarterly review of exception validity

**Trigger to Remove Exception:**
- User-facing action found silent
- User complaints received
- P0 incident caused by silence
- Context changes (API behavior)

---

## Gate 12: NO_HUMAN_NAME_AUTHORITY

**Rule:** Authority attribution MUST use system labels only (no person names).

**Authority:** GOVERNANCE_RULES.md (GOV-NO-HUMAN-IDENTITY-ATTRIBUTION)

**Forbidden:**
- ❌ "Authority: Kevin Thibault"
- ❌ "Decision Maker: Kevin"
- ❌ "Owner: [person name]"
- ❌ "Approved by: [person]"

**Allowed:**
- ✅ "Authority: TITANE∞ Governance"
- ✅ "Authority: UI_ARBITRATION_LOG.md"
- ✅ "Authority: Protocol vΩ.UI.HYGIENE"
- ✅ "Decision Maker: Governance Board"
- ✅ "Owner: TITANE∞ Project"

**Rationale:**
- Prevent governance drift (decisions outlive individuals)
- Avoid identity confusion (institutional authority)
- Enable continuity (future agents need clear references)
- Constitutional stability (self-referential frameworks)

**Enforcement:**
- Scan docs for "Authority:" / "Decision:" lines
- Check for human names (case-by-case)
- Require system label replacement

**Scan Command:**
```bash
# Check for human names in authority
grep -rn "Authority:" docs/ui-carto-copilot/ | grep -v "TITANE\|Protocol\|Governance\|Decision Log"
# Expected: 0 results
```

**Remediation:**
- Replace human name with system label
- Update all authority references in affected docs
- See GOVERNANCE_RULES.md for examples

---

## Gate 13: ANTI_REGRESSION_SCANS_REQUIRED

**Rule:** Before major UI changes, run anti-regression scans and log results.

**Authority:** ANTI_REGRESSION_SCANS.md

**Required Scans (4):**
1. **NO_EMPTY_OR_SILENT_CATCH** - Detect silent error handlers
2. **NO_DIRECT_INVOKE_BYPASS** - Detect unwrapped IPC calls
3. **NO_IPC_FETCH** - Detect forbidden fetch("ipc://")
4. **NO_HUMAN_NAME_AUTHORITY** - Detect human name attributions

**When to Run:**
- Before major UI changes (new routes, pages, stores)
- Weekly maintenance (recommended)
- Pre-release verification

**Not Required For:**
- Minor bug fixes (localized)
- Documentation updates
- Test additions
- Console.log cleanup

**Enforcement:**
- Run all 4 scans before major changes
- Log results in `VERIFICATION/SCAN_RESULTS.md`
- Address P0 violations before merge
- Document P1/P2 violations or add to exceptions

**Scan Commands:**
```bash
# A) Silent catch scan
rg -n "} catch" src --type ts | wc -l
# Expected: <= 6 (NC-UI-SILENCE-EXEMPT-001)

# B) Direct invoke scan
rg -n "invoke\(" src --type ts | grep -v "secureInvoke\|tauriClient" | wc -l
# Expected: <= 5 (NC-001)

# C) IPC fetch scan
rg -n 'ipc://' src --type ts | wc -l
# Expected: 0

# D) Human name authority scan
grep -rn "Authority:" docs/ui-carto-copilot/ | grep -v "TITANE\|Protocol\|Governance"
# Expected: 0
```

**Results Format:**
- Document in VERIFICATION/SCAN_RESULTS.md
- Include timestamp, scan status (PASS/FAIL), violations
- Link to exception IDs (NC-*) if applicable

---

## Gate 14: CHANGE_CONTROL_REQUIRED

**Rule:** ALL UI architectural changes MUST use CHANGE_CONTROL_TEMPLATE.md.

**Authority:** CHANGE_CONTROL_TEMPLATE.md

**Scope:**
- New routes/pages
- New navigation sections/tabs
- New stores (Zustand)
- New IPC patterns
- Layout/router changes
- Design system changes

**Not Required:**
- Bug fixes (proven, localized)
- Documentation updates
- Test additions
- Minor style tweaks

**Enforcement:**
- Copy CHANGE_CONTROL_TEMPLATE.md
- Fill all 10 sections (mandatory)
- Attach to PR description or commit
- Reviewer validates completeness

**Template Sections (10):**
1. Change Summary
2. Ring Impact
3. Authorized By (arbitration reference)
4. Scope Boundaries
5. Risks (P0/P1/P2)
6. Proof Plan (path:line)
7. Tests / Gates to Run
8. Rollback Plan
9. Freeze Exemption
10. Registry / Logs to Update

**Verification:**
- Check all 10 sections filled (no TBD/TODO)
- Verify arbitration reference (section 3)
- Confirm rollback plan executable (section 8)
- Validate registry updates (section 10)

**Without Change Control:**
- ❌ No merge allowed for architectural changes
- ❌ PR blocked until template provided
- ❌ Exception only for emergency P0 (post-facto within 24h)

---

## Manual Review Checklist

For reviewers:

```markdown
- [ ] Gate 1: Arbitration reference cited?
- [ ] Gate 2: Layout/nav unchanged OR justified?
- [ ] Gate 3: No premature "SCELLÉ" terms?
- [ ] Gate 4: Proof pack provided?
- [ ] Gate 5: Change is minimal/surgical?
- [ ] Gate 6: 4-ring compliance verified?
- [ ] Gate 7: No new silent UI (check exceptions)?
- [ ] Gate 8: Frozen patterns respected?
- [ ] Gate 9: Docs updated?
- [ ] Gate 10: Rollback plan documented?
- [ ] Gate 11: New exceptions justified?
- [ ] Gate 12: No human name authority?
- [ ] Gate 13: Anti-regression scans run (if major)?
- [ ] Gate 14: Change control template used (if architectural)?
```

**All 14 gates must PASS for merge.**

---

## Automated Gates (Future)

These gates are **manual review only** for now.

**Possible Automation:**
- Grep for "SCELLÉ" in docs → CI fail
- Import checker (4-ring violations) → CI warn
- Empty catch detector → CI fail
- Manifest sync validator → CI fail

**Not Implemented Yet:** Manual enforcement in PR review.

---

## Exemptions

### Emergency P0 Fixes
- Bypass gates 1-5 if production blocked
- Must retroactively document within 24h
- Create arbitration entry post-fix

### System-Approved Override
- System authority may override any gate
- Requires written justification in PR/issue
- Documents reason for exception

---

## Enforcement Responsibility

**Primary:** PR Reviewer (human or Copilot)  
**Secondary:** GitHub Actions (when automated)  
**Escalation:** Kevin Thibault (governance questions)

---

## Freeze Status

**Active:** ✅ YES  
**Effective Date:** 2026-02-07  
**Review Trigger:** Kevin V5 delta OR Sprint N+6 OR P0 incident

---

**These gates are not bureaucracy. They are discipline.**

**They exist to prevent:**
- Accidental regressions
- Scope creep
- Silent complexity growth
- Architectural drift
- "Quick fix" cascades

**Status:** 🔒 **GATES ACTIVE**
