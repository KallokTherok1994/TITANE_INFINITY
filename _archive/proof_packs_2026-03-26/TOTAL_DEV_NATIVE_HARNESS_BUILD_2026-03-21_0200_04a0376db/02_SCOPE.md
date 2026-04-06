# Scope Definition

## Mission Scope
**Build native E2E harness for TOTAL_DEV component → upgrade verdict from PARTIAL_WEB_HARNESS_ONLY**

## Allowed Actions
- ✅ Harness-only changes (wdio tests, configs, scripts)
- ✅ Product discovery/inspection
- ❌ Product code changes (FROZEN unless harness blocker)
- ❌ Feature additions
- ❌ UI redesign

## Test Scope (Minimum Viable)
1. **Navigation:** Route to /total-dev via native window
2. **Visibility:** Header, lock badge, unlock panel render correctly
3. **Interaction:** Password input accessible and responsive
4. **Error Handling:** Wrong password doesn't unlock
5. **State:** Page maintains LOCKED state throughout

## Certification Requirement
**X3 STABLE RUNS** of critical path on native harness (required for PASS verdict)

## Constraints Enforced
- No bouncing/timeout changes without bounds
- No secret regressions
- No product feature creep
- Product frozen in git (verified at commit 04a0376db)

---
**SCOPE FROZEN:** This document defines immovable boundary for harness mission
