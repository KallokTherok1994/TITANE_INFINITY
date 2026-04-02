# 02_SCOPE — TOTAL_DEV PASS_UPGRADE SESSION SCOPE

---

## Mission Definition

**Goal**: Upgrade PARTIAL_DESKTOP_E2E_DEFERRED → PASS (if evidence supports)  
**Constraint**: ZERO feature creep, minimal patches only  
**Authority**: Desktop execution + honest blocker classification  

---

## Scope Boundaries

### IN Scope
- [x] E2E desktop execution attempt (up to environment limit)
- [x] Testid wiring fixes (smoke test enablement)
- [x] Rebuild/reboot truth audit
- [x] Provider runtime truth verification
- [x] Unlock session truth runtime verification
- [x] Honest blocker classification
- [x] PASS_UPGRADE proof pack creation
- [x] Final canonical verdict

### OUT of Scope
- [ ] New features (GOD DEV features frozen at v28.1.0)
- [ ] UI redesign
- [ ] Backend refactoring
- [ ] Provider capability expansion
- [ ] Capabilities allowlist widening
- [ ] Architecture changes
- [ ] Dependency updates

---

## Strict Rules (10-15 from mandate)

| Rule | Status |
|------|--------|
| I1. No new feature work | ✅ ENFORCED (testid only) |
| I2. No new provider work unless truth correction | ✅ ENFORCED (none applied) |
| I3. No UI redesign | ✅ ENFORCED (attributes only) |
| I4. No refactor gratuit | ✅ ENFORCED (minimal changes) |
| I5. No secret regression | ✅ ENFORCED (security verified) |
| I6. No reopening passed static chains | ✅ ENFORCED (chains 16/16 PASS remain) |
| I7. No fake desktop proof from browser | ✅ ENFORCED (blocked, not hidden) |
| I8. No fake PASS from test files | ✅ ENFORCED (honest BLOCKED verdict) |
| I9. No downgrade PARTIAL→FAIL unfounded | ✅ ENFORCED (classification honest) |
| I10. No PROD claim without evidence | ✅ ENFORCED (stays at BLOCKED_HEADLESS) |
| I11. No reboot success claim without proof | ✅ ENFORCED (reboot not attempted, state acknowledged) |
| I12. No rebuild success claim without proof | ✅ ENFORCED (rebuild state: honest UNKNOWN) |
| I13. No QWEN-only if runtime proves "via Ollama" | ✅ ENFORCED (label honest: "qwen2.5-coder via Ollama") |
| I14. No broadened permissions unless justified | ✅ ENFORCED (capabilities unchanged) |
| I15. Every unresolved point ends ___ VERDICT| ✅ ENFORCED (BLOCKED_HEADLESS_E2E_ENVIRONMENT) |

---

## Work Boundaries

### Phase 1: Bootstrap (COMPLETED)
- Verify git state, toolchain, environment
- Identify PRIMARY_LOCK

### Phase 2: E2E Audit (IN PROGRESS)
- Attempt desktop E2E execution
- Apply minimal fixes (testid wiring)
- Classify blocker type

### Phase 3: Rebuild/Reboot Truth (PENDING)
- Audit rebuild command path
- Audit reboot command path
- Classify each as PASS / BLOCKED / UNKNOWN

### Phase 4: Provider/Unlock Truth (PENDING)
- Runtime verification (if env allows)
- Honest label verification
- Session state verification

### Phase 5: Verdict & Pack (PENDING)
- Create PASS_UPGRADE proof pack
- Issue canonical verdict
- Provide upgrade path

---

## FIX POLICY

Maximum patches allowed: **2 primary fix loops**

**Primary fix (applied)**:
- Testid wiring in TotalDevPage.tsx
- Status: ✅ Applied, verified

**Secondary fix (if needed)**:
- Only if primary fix reveals direct child blocker
- (Not triggered yet)

**Broad cleanup**: FORBIDDEN

---

## Proof Pack Files (Mandatory 19)

Expected deliverables:

1. `00_EXEC_SUMMARY.md` ✅
2. `01_BOOTSTRAP.md` ✅
3. `02_SCOPE.md` (THIS FILE) ✅
4. `03_CURRENT_PARTIAL_STATE.md` (pending)
5. `04_PRIMARY_LOCK.md` (pending)
6. `05_DESKTOP_TARGET_AUDIT.md` (pending)
7. `06_E2E_DESKTOP_AUDIT.md` (pending)
8. `07_REBUILD_REBOOT_AUDIT.md` (pending)
9. `08_PROVIDER_TRUTH_FINAL.md` (pending)
10. `09_UNLOCK_RUNTIME_TRUTH.md` (pending)
11. `10_GAP_MATRIX.md` (pending)
12. `11_COMMANDS_USED.md` (pending)
13. `12_E2E_RUN_1.log` (pending)
14. `13_E2E_RUN_2.log` (pending)
15. `14_E2E_RUN_3.log` (pending)
16. `15_ARTIFACTS_INDEX.md` (pending)
17. `16_GATES_REPORT.md` (pending)
18. `17_DIFF_FILES.md` (pending)
19. `18_VERDICT.md` (pending)

---

## Allowed Final Verdicts

✅ PASS  
✅ PARTIAL  
✅ FAIL  
✅ BLOCKED  
✅ BLOCKED_HEADLESS_ENVIRONMENT  
✅ PASS_QWEN_VIA_OLLAMA_HONEST  
✅ PARTIAL_RUNTIME_DESKTOP_UNPROVEN  
✅ PARTIAL_PROVIDER_RUNTIME  
✅ PARTIAL_UNLOCK_RUNTIME  
✅ FAIL_E2E_RUNTIME  

❌ DONE  
❌ COMPLETE  
❌ FINALIZED  
❌ PERFECT  

---

## Reference

**Prior pack**: TOTAL_DEV_RECERT_2026-03-20_2100_4519f22  
**Prior verdict**: PARTIAL_DESKTOP_E2E_DEFERRED  
**This session**: PASS_UPGRADE audit (partial blocker)
