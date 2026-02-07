# TITANE∞ — UI FREEZE GATES (Anti-Drift Rules)

**Authority:** ARCHITECTURAL_FREEZE_NOTICE.md  
**Date:** 2026-02-07  
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

## Gate 3: NO "SEALED" UNTIL KEVIN V5

**Rule:** FORBIDDEN to use these terms in docs/PR/commits until Gate F complete:
- "SEALED"
- "PRODUCTION READY"
- "COMPLETE" (in absolute sense)
- "APPROVED FOR PRODUCTION"

**Reason:** Kevin V5 delta comparison blocked (Gate F)

**Allowed Terms:**
- "V6 cartography updated"
- "Hygiene sprint complete"
- "Freeze active"
- "Delta pending"

**Enforcement:**
- Grep docs for forbidden terms
- PR review rejects premature "SEALED"
- README status must say "Delta pending"

**Gate F Unblock Conditions:**
1. Kevin V5 baseline imported to `docs/reference/kevin-v5/`
2. Delta comparison executed (DELTA_VS_KEVIN_V5.md)
3. All P0 divergences addressed
4. VERDICT.md updated to PASS

**Until then:** ❌ NO SEAL

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

## Manual Review Checklist

For reviewers:

```markdown
- [ ] Gate 1: Arbitration reference cited?
- [ ] Gate 2: Layout/nav unchanged OR justified?
- [ ] Gate 3: No premature "SEALED" terms?
- [ ] Gate 4: Proof pack provided?
- [ ] Gate 5: Change is minimal/surgical?
- [ ] Gate 6: 4-ring compliance verified?
- [ ] Gate 7: No new silent UI?
- [ ] Gate 8: Frozen patterns respected?
- [ ] Gate 9: Docs updated?
- [ ] Gate 10: Rollback plan documented?
```

**All 10 gates must PASS for merge.**

---

## Automated Gates (Future)

These gates are **manual review only** for now.

**Possible Automation:**
- Grep for "SEALED" in docs → CI fail
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

### Kevin-Approved Override
- Creator Kevin Thibault may override any gate
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
