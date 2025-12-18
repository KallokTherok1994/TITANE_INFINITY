# 🧪 PHASE 2 - TESTING & COVERAGE PLAN

**Date**: 2025-12-16  
**Mode**: YOLO AUTO  
**Status**: STARTING

---

## 🎯 OBJECTIVES

### Primary Goals:

1. **Increase test coverage** to 80%+ (from current ~60%)
2. **Fix pre-existing test failures** (5 Rust, 308 Frontend)
3. **Add tests for Phase 1 consolidated code**
4. **Improve test quality** (edge cases, error handling)

### Success Metrics:

- [ ] Rust coverage: 70%+ (currently ~60%)
- [ ] Frontend coverage: 80%+ (currently ~40%)
- [ ] All ControlPanel tests passing (5 failures → 0)
- [ ] React hook errors fixed (308 failures → <50)
- [ ] 100% coverage on newly consolidated components

---

## 📊 CURRENT STATE ANALYSIS

### Rust Tests (src-tauri)

```
✅ PASSING: 4,279 tests (99.9%)
❌ FAILING: 5 tests (ControlPanel)
⏸️  IGNORED: 7 tests

Failed Tests:
1. test_cp_install_update - Platform install logic
2. test_cp_toggle_singularity - Safe mode assertion
3. test_cp_get_system_info - Version string mismatch
4. test_cp_run_system_diagnostic - French text assertion
5. test_cp_get_memory_stats - Memory calculation
```

### Frontend Tests (src/)

```
✅ PASSING: 1,998 tests (86.6%)
❌ FAILING: 308 tests (React hooks)
⏸️  SKIPPED: 13 tests

Main Issue: "Cannot read properties of null (reading 'useCallback')"
Root Cause: React rendering context not properly set up in tests
```

---

## 🔧 PHASE 2 STRATEGY

### Step 1: Coverage Analysis (30min)

- [ ] Run cargo tarpaulin for Rust coverage
- [ ] Run vitest --coverage for Frontend
- [ ] Identify untested critical paths
- [ ] Map Phase 1 consolidated files needing tests

### Step 2: Quick Wins - Fix ControlPanel (1h)

- [ ] Fix version string mismatch (test_cp_get_system_info)
- [ ] Fix French text assertion (test_cp_run_system_diagnostic)
- [ ] Fix memory stats calculation (test_cp_get_memory_stats)
- [ ] Update install/toggle tests for safe mode
- **Impact**: 5 failures → 0 (100% Rust tests passing)

### Step 3: Fix React Hook Errors (2h)

- [ ] Investigate rendering context setup
- [ ] Add proper React test providers
- [ ] Fix usePanelState hook tests
- [ ] Fix GovernancePanel tests
- **Impact**: 308 failures → <50 (95%+ Frontend passing)

### Step 4: Test Consolidated Code (2h)

- [ ] ChatWindow.tsx tests (OMEGA v15)
- [ ] ChatInput.tsx tests (anti-spam)
- [ ] AIChatBubble.tsx tests (v∞.25)
- [ ] useTTS.ts tests (simple TTS)
- **Impact**: 100% coverage on Phase 1 changes

### Step 5: Coverage Boost (1.5h)

- [ ] Add edge case tests
- [ ] Add error handling tests
- [ ] Add integration tests
- **Target**: 80%+ overall coverage

---

## 📈 ESTIMATED IMPACT

| Metric                 | Current | Target | Improvement |
| ---------------------- | ------- | ------ | ----------- |
| Rust Coverage          | ~60%    | 70%+   | +10%        |
| Frontend Coverage      | ~40%    | 80%+   | +40%        |
| Rust Tests Passing     | 99.9%   | 100%   | +0.1%       |
| Frontend Tests Passing | 86.6%   | 95%+   | +8.4%       |
| Phase 1 Code Coverage  | 0%      | 100%   | +100%       |

**Total Time Estimate**: 7 hours MODE YOLO  
**Priority**: HIGH (tests validate all changes)

---

## 🚀 EXECUTION ORDER

1. ✅ Create this plan
2. ⏭️ Analyze coverage (cargo tarpaulin + vitest --coverage)
3. ⏭️ Fix ControlPanel tests (quick wins)
4. ⏭️ Fix React hook setup
5. ⏭️ Add Phase 1 consolidated code tests
6. ⏭️ Boost overall coverage
7. ⏭️ Validate & commit
8. ⏭️ Tag v25.0.0-phase2

---

**STATUS**: Plan complete - Ready to execute  
**MODE**: YOLO AUTO - Proceeding without confirmation
