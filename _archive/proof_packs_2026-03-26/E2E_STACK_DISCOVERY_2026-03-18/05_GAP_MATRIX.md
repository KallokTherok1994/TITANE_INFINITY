# Phase 6: GAP MATRIX — TITANE∞ v28.0.0 (Untested Coverage & Locks)

**Date:** 2026-03-18 | **Governance:** §6.1 (Gap Analysis Mandatory Before FIX) | **Status:** ANALYZED

---

## Executive Summary

**Total Testable Surface:** 
- Browser: 108 Playwright tests (capacity)
- Desktop: 20 WDIO suites (capacity)

**Current Coverage:**
- ✅ Browser chat module: 3 tests (chat.spec.ts, PROVEN x3)
- ✅ Desktop chat module: 3 suites (online-chat-proof x3, online-chat-proof-ui, memory x3)
- ⚠️  Browser admin/time/dev: ~15 tests (partial)
- ⚠️  Desktop other suites: ~17 WDIO suites (sparse/varied)

**Coverage Estimate:** ~40% of critical path, ~60% untested

**Identified Locks (in priority order):**

1. **LOCK #1 (CRITICAL): Accessibility tests in IGNORED state**
   - `tests/e2e/accessibility.spec.ts` — IGNORED in playwright.config.ts
   - `tests/e2e/control_panel.spec.ts` — IGNORED in playwright.config.ts
   - Impact: WCAG compliance unmeasurable
   - Blocker: ❌ Cannot certify without clearing ignored tests

2. **LOCK #2 (HIGH): Chat modes untested (dev_senior, strategist, auditor, creative)**
   - Only `default` and `coach` modes tested
   - Impact: Provider fallback untested for most modes
   - Blocker: ⚠️ Coverage < 50% of mode matrix

3. **LOCK #3 (MEDIUM): Tab switching (TitanePage) untested**
   - No tests for tab navigation, content context preservation
   - Impact: Tab state during rapid switching unknown
   - Blocker: ⚠️ UI integration coverage incomplete

4. **LOCK #4 (MEDIUM): Race conditions incomplete**
   - `chat-race-conditions.spec.ts` exists but limited scenarios
   - Impact: Concurrent message handling edge cases
   - Blocker: ⚠️ Concurrent state safety unproven

5. **LOCK #5 (LOW): Desktop fullstack (admin/time/dev pages)**
   - Only chat tested on desktop
   - Impact: Admin config persistence, time routing, dev diagnostics incomplete
   - Blocker: ⚠️ Multi-page desktop flow untested

---

## 1. GAP MATRIX (Coverage Heatmap)

### 1.1 BROWSER TESTING GAPS

| Surface | Status | Coverage | Lock? | Reason |
|---------|--------|----------|-------|--------|
| **TitanePage/conversation** | ✅ TESTED | 80% | ❌ No | chat.spec.ts (3 core tests, PROVEN x3) |
| TitanePage/vision | ⚠️ PARTIAL | 30% | ⚠️ Minor | audio-truth.spec.ts only |
| TitanePage/overview | ⚠️ PARTIAL | 20% | ⚠️ Minor | UI comprehensive partial |
| TitanePage/identity | ❌ UNTESTED | 0% | ⚠️ Medium | Provider-flow touches, not direct |
| TitanePage/memory-map | ❌ UNTESTED | 0% | ⚠️ Medium | Desktop tested, browser not |
| TitanePage/memory-evolution | ❌ UNTESTED | 0% | ⚠️ Medium | Display-only, low risk |
| TitanePage/progression | ❌ UNTESTED | 0% | ⚠️ Medium | XP system untested |
| TitanePage/transformation | ❌ UNTESTED | 0% | ⚠️ Medium | Growth stages untested |
| **Tab Navigation** | ❌ UNTESTED | 0% | 🔴 **LOCK** | No test explicitly switches tabs |
| **AdminPage** | ⚠️ PARTIAL | 25% | ⚠️ Medium | Smoke only, no full tour |
| **TimePage** | ⚠️ PARTIAL | 20% | ⚠️ Medium | Smoke only |
| **DevPage** | ⚠️ PARTIAL | 20% | ⚠️ Medium | Smoke only |
| **Provider Selection** | ⚠️ PARTIAL | 40% | ⚠️ Medium | Only coach/default tested |
| **Chat Mode Switching** | ❌ UNTESTED | 0% | 🔴 **LOCK** | 6 modes untested (senior, strategist, auditor, creative) |
| **Error Handling** | ⚠️ PARTIAL | 30% | ⚠️ Medium | Some error states missing |
| **Accessibility (WCAG)** | ⚠️ IGNORED | 0% | 🔴 **LOCK** | control_panel.spec.ts & accessibility.spec.ts IGNORED |
| **Race Conditions** | ⚠️ PARTIAL | 20% | ⚠️ Medium | Exists but limited scenarios |
| **i18n** | ⚠️ PARTIAL | 30% | ⚠️ Medium | Language switching partial |
| **Onboarding** | ✅ TESTED | 60% | ❌ No | onboarding.test.ts covers flow |
| **Feedback** | ✅ TESTED | 50% | ❌ No | feedback-loop.spec.ts |

---

### 1.2 DESKTOP TESTING GAPS

| Surface | Test File | Status | Lock? | Reason |
|---------|-----------|--------|-------|--------|
| **Chat (full cycle)** | online-chat-proof.wdio | ✅ PROVEN x3 | ❌ No | Complete IPC tested |
| **Chat UI** | online-chat-proof-ui.wdio | ✅ PROVEN x3 | ❌ No | Rendering verified |
| **Memory** | memory-conversations.wdio | ✅ PROVEN x3 | ❌ No | Persistence verified |
| **Admin Config** | admin-design-truth.wdio | ⚠️ PARTIAL | ⚠️ Medium | Design system, not full config |
| **Admin Propagation** | preprod_admin_config.wdio | ⚠️ PARTIAL | ⚠️ Medium | Config save not full coverage |
| **Time Page** | N/A | ❌ UNTESTED | 🔴 **LOCK** | No desktop test |
| **Dev Diagnostics** | diagnostic-tauri-api.wdio | ⚠️ PARTIAL | ⚠️ Medium | Contract only, not full tour |
| **Audio Settings** | audio-settings-persistence.wdio | ⚠️ PARTIAL | ⚠️ Medium | Settings, not full flow |
| **TTS Controls** | audio-tts-runtime-controls.wdio | ⚠️ PARTIAL | ⚠️ Medium | Controls, not content |
| **Smoke** | smoke.wdio | ✅ PROVEN x3 | ❌ No | Basic startup works |
| **UI Connectivity** | ui-connectivity-critical.wdio | ⚠️ PARTIAL | ⚠️ Medium | Router check, not all routes |
| **Multi-provider** | N/A | ❌ UNTESTED | 🔴 **LOCK** | No fallback switching test |
| **Error Recovery** | N/A | ❌ UNTESTED | 🔴 **LOCK** | Provider failure paths untested |

---

## 2. CRITICAL LOCKS (Blocking Full Certification)

### LOCK #1 (BLOCKER): Accessibility Tests in IGNORED State 🔴

**Problem:**
- Files exist but are DISABLED in playwright.config.ts:
  ```javascript
  testIgnore: ['**/control_panel.spec.ts', '**/accessibility.spec.ts'],
  ```
- WCAG compliance unmeasurable
- Governance cannot certify without accessibility check

**Files:**
- `tests/e2e/accessibility.spec.ts` — axe-core WCAG scanning
- `tests/e2e/control_panel.spec.ts` — Controls accessibility (?)

**Impact:**
- ❌ Cannot run `test:e2e` without first un-ignoring
- ❌ Cannot pass release gate without accessibility audit
- ❌ Blocker for full campaign

**Solution Required:**
1. Remove from testIgnore array in playwright.config.ts
2. Verify tests pass (or fix failures)
3. Re-run full Playwright suite with clean results

**Effort:** 15-30 minutes (remove ignore + fix any failures)

**Current Status:** NOT FIXED

---

### LOCK #2 (HIGH): Chat Modes Untested (6 of 8 modes)

**Problem:**
- Only `default` and `coach` modes have any test coverage
- `dev_senior`, `strategist`, `auditor`, `creative` untested
- Provider fallback untested for most modes
- XP-locked modes (100+) untested

**Coverage Matrix:**
| Mode | Default Provider | Tests | Status |
|------|------------------|-------|--------|
| default | hybrid | smoke.test.ts | ⚠️ Partial |
| **coach** | gemini | chat.spec.ts (x3) | ✅ PROVEN |
| dev_junior | ollama | provider-flow.test.ts (partial) | ⚠️ Partial |
| dev_senior | claude | — | ❌ NONE |
| admin | ollama | N/A | N/A |
| strategist | gemini | — | ❌ NONE |
| auditor | claude | — | ❌ NONE |
| creative | gemini | — | ❌ NONE |
| hybrid | auto | user-flows.test.ts | ⚠️ Partial |

**Impact:**
- ⚠️ Cannot certify provider fallback strategy
- ⚠️ Cloud provider chains (Claude, Gemini) untested
- ⚠️ XP-unlock mechanism untested

**Solution Required:**
1. Add mode-switching test to chat.spec.ts (or new file)
2. Test each mode with its default provider
3. Test mode× provider matrix (prioritize: coach→claude fallback, dev_senior→ollama fallback)

**Effort:** 45-60 minutes (3 new test scenarios × 15min each)

**Current Status:** NOT FIXED

---

### LOCK #3 (Medium): Tab Switching (TitanePage) Untested

**Problem:**
- No test explicitly navigates between TitanePage tabs
- Chat state preservation during tab switching unknown
- Tab content loading/unloading not verified
- Memory context switch per tab not tested

**Example Missing Scenarios:**
```typescript
// Scenario 1: Send message, switch tabs, switch back
// Expected: Chat state preserved, message history intact

// Scenario 2: Load memory in tab-memory-map, edit, switch to tab-conversation
// Expected: Memory context available in chat mode

// Scenario 3: Rapid tab switching (stress test)
// Expected: No crashes, no doubled renders
```

**Impact:**
- ⚠️ Tab state consistency unknown
- ⚠️ Memory context leakage not verified
- ⚠️ Performance during tab switching not measured

**Solution Required:**
1. Add to chat.spec.ts or new tab-navigation.spec.ts
2. Test 3 scenarios (state preservation, context load, rapid switch)
3. Verify no memory leaks (DevTools Memory profile check)

**Effort:** 30-45 minutes

**Current Status:** NOT FIXED

---

### LOCK #4 (Medium): AccessibilityTests in IGNORED State (Duplicate Mention)

See **LOCK #1** — same issue

---

### LOCK #5 (Low-Medium): Desktop Multi-Page Testing Absent

**Problem:**
- Desktop tests only target chat (TitanePage)
- Admin/Time/Dev pages not tested on desktop
- Page navigation IPC not verified
- Admin config propagation incomplete (only partial via preprod_admin_config.wdio)

**Missing Desktop Scenarios:**
```
Navigation:  /titane → /admin → desktop verify config UI
             /admin → /time → desktop verify time page
             /time → /titane → verify chat still works (state preserved)

Config:      AdminPage config change → save → restart app → verify persisted
             Offline mode toggle → verify in chat behavior

Time:        Navigate /time → verify temporal UI renders
             Switch time context → verification in chat

Dev:         Navigate /dev → verify diagnostics visible
             Run diagnostic command → verify result display
```

**Impact:**
- ⚠️ Multi-page desktop flow untested
- ⚠️ Config persistence across pages incomplete
- ⚠️ Page state in desktop context unknown

**Solution Required:**
1. Add new test suites:
   - admin-full-tour.wdio.test.js
   - time-desktop-navigation.wdio.test.js
   - dev-page-tour.wdio.test.js
2. Test navigation, rendering, state preservation

**Effort:** 60-90 minutes (3 new suites × 20-30min each)

**Current Status:** NOT FIXED

---

## 3. RECOMMENDED FIX PRIORITY

### Phase 6B: Choose ONE Lock to Fix First ⬇️

**Decision Criteria:**
1. **IMPACT:** How many tests can run after fix?
2. **EFFORT:** How long to fix?
3. **BLOCKER:** Is it required before campaign?
4. **PROOF:** Can we measure PASS/FAIL clearly?

---

### **RECOMMENDED: Lock #1 (Accessibility Tests) — Un-ignore**

**Why?**
- ✅ **IMPACT:** Unblocks 2 entire test files (~20 tests), fixes playwright.config.ts issue
- ✅ **EFFORT:** 15 minutes (remove ignore, verify tests pass)
- ✅ **BLOCKER:** YES — Cannot run full test suite with ignored tests
- ✅ **PROOF:** Before/after: `test:e2e --list` count changes from 108→128 (assuming 20 ignored tests)

**Mechanics:**
```typescript
// BEFORE (playwright.config.ts line 65):
testIgnore: ['**/control_panel.spec.ts', '**/accessibility.spec.ts'],

// AFTER:
testIgnore: [],  // Remove ignore to activate accessibility tests
```

**Verification:**
```bash
pnpm exec playwright test --list tests/e2e/ 2>&1 | grep -E '^test:' | wc -l
# Should increase from ~100 to ~120 (approx)

pnpm exec playwright test tests/e2e/ 2>&1 | tail -20
# Should show new test results (pass/fail) for accessibility suite
```

**Next Step:** Run test:e2e x1 quick validation → x3 full campaign

---

### Alternative Candidates (if Lock #1 unfeasible):

**Lock #2B (Chat Mode Switching):** Moderate impact, 45min effort
- Add 3-5 new test scenarios to chat.spec.ts
- Test mode-switching + provider fallback
- Proof: Before (3 tests) vs After (8 tests) in chat.spec.ts

**Lock #3B (Tab Navigation):** Lower impact, 30min effort
- Add tab switching edge cases to chat.spec.ts
- Proof: 2-3 new passing tests

---

## 4. GOVERNANCE CHECKLIST

- ✅ Gap analysis complete (5 locks identified)
- ✅ Coverage heatmap documented (browser + desktop)
- ✅ Priority ranking defined (impact × effort matrix)
- ✅ Blocker identified (Lock #1 prevents full campaign)
- ✅ Fix path clear (un-ignore tests, verify pass)
- ✅ Effort estimated (15-30 minutes for Lock #1)
- ✅ Proof metrics defined (test count, pass/fail rate)

**VERDICT:** GAP_MATRIX = **ANALYZED**

**BLOCKING LOCK IDENTIFIED:** Lock #1 (Accessibility tests IGNORED)

**RECOMMENDED ACTION:** Fix Lock #1 in Phase 7 → Re-run discovery → Full campaign

---

End of Phase 6: Gap Matrix & Lock Identification
