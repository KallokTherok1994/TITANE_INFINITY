# 15_CURRENT_LOCKS.md
## TITANE∞ TOTAL SYSTEM AUDIT — Current Causal Locks

**Generated:** 2026-03-20 13:24 UTC  
**Mode:** AUDIT → REPAIR  

---

## LOCK PRIORITIZATION METHODOLOGY

**Criteria:**
1. **User Impact:** Does it cause silent failure or confusion?
2. **Truth Integrity:** Does it violate the "no lying UI" invariant?
3. **Cascading Effect:** Does fixing it unblock other issues?
4. **Patch Scope:** Can it be fixed minimally and safely?
5. **Proof Difficulty:** Can we verify the fix with existing tests?

**Risk Levels:**
- **P0:** Silent failures, truth violations, blocking gates
- **P1:** Functional degradation, user-visible inconsistency
- **P2:** Optimization, cleanup, tech debt

---

## LOCK #1: PROVIDER_DISPLAY_TRUTH (P0) 🔴

### Description
**UI shows user preference, not actual provider used**

The chat UI displays the provider the user *selected*, but not the provider the backend *actually used*. The backend returns `ProviderDecisionMeta` with the real provider, fallback chain, latency, and decision rationale, but the UI ignores this metadata.

### Impact
- **User Confusion:** User thinks Ollama ran but Gemini was used (offline fallback)
- **Trust Violation:** UI lies about what happened
- **Debugging:** Impossible to diagnose provider issues from UI alone
- **Silent Failures:** Provider errors hidden from user

### Domain
- Frontend: Chat UI / Provider display
- Backend: Already truthful (returns ProviderDecisionMeta)
- Severity: CRITICAL (violates I3: "UI visible != vérité runtime")

### Files Involved
1. `src/ui/pages/Chat.tsx` - Chat UI (displays preference)
2. `src/hooks/useChat.ts` - Chat hook (receives ProviderDecisionMeta)
3. `src/types/providerDecisionMeta.ts` - Truth contract type
4. `src-tauri/src/chat_engine/providers.rs` - Backend (already truthful)

### Current State
- ✅ Backend returns ProviderDecisionMeta in every response
- ❌ UI does not read/display this metadata
- ❌ localStorage `omega-chat-preferred-provider` shown instead of actual
- ❌ No visual indication when fallback occurs

### Root Cause
UI displays user setting, not response metadata. Likely: initial implementation didn't add metadata display.

### Minimal Patch Scope
**Scope:** Frontend only (backend already correct)  
**Changes:** 2-3 files  
**Lines:** ~50-100 lines  
**Risk:** LOW (additive only, no backend change)

**Patch Plan:**
1. Read `providerDecisionMeta` from chat response in `useChat.ts`
2. Store actual provider in chat state
3. Display actual provider badge in Chat.tsx UI
4. Add fallback indicator if `providerUsed !== providerPreferred`
5. Optional: Display latency + decision reason in dev/admin mode

### Verification Strategy
**Tests Available:**
- `tests/e2e/provider-flow.test.ts` (already exists, modify to assert metadata)
- Manual: Set provider to Ollama (offline) → verify Gemini badge shown

**Gates:**
- G_NO_LYING_UI: FAIL → PASS
- G_UI_RUNTIME_CHAIN_TRUTH: FAIL → PASS

**x3 Stability:** Run provider-flow test x3 with different provider configs

### Rollback
```bash
git restore -- src/ui/pages/Chat.tsx src/hooks/useChat.ts src/types/
```

**Rollback Proof:** Rollback renders UI to preference-display state (current)

### Priority Rationale
- **P0** because:
  - Violates constitutional invariant I3 (no lying UI)
  - User-facing trust issue
  - Easy to fix (backend already done)
  - High confidence (well-scoped, low risk)
  - Unblocks diagnostic workflows

**Decision:** This is MAIN_LOCK #1

---

## LOCK #2: CONVERSATION_ID_DUAL_KEYS (P0) 🔴

### Description
**Two localStorage keys for conversation ID with fallback logic**

The system uses two keys:
- `titane_active_conversation_id` (primary, newer)
- `omega-chat-conversation-id` (legacy, fallback)

Fallback logic exists in Chat.tsx but not uniformly applied everywhere.

### Impact
- **Data Fragmentation:** Different pages may load different conversation IDs
- **Memory Sync Failure:** Memory updates saved to one key, chat reads from other
- **User Confusion:** User thinks they're in conversation X, but memory from Y is loaded
- **Tech Debt:** Indefinite fallback maintenance

### Domain
- Storage layer (localStorage)
- Conversation persistence
- Memory injection chain

### Files Involved
1. `src/pages/Memory.tsx` - Uses `titane_active_conversation_id`
2. `src/ui/pages/Chat.tsx` - Uses fallback logic
3. `src/services/conversation/conversationStorage.ts` - Persistence
4. Any other file reading conversation ID

### Current State
- ⚠️ Fallback logic exists (partial mitigation)
- ❌ Not uniformly applied
- ❌ Legacy key never deprecated/migrated
- ❌ Risk of split-brain conversation state

### Root Cause
Refactor renamed key but didn't migrate existing installations. Fallback added but not completed.

### Minimal Patch Scope
**Scope:** Frontend storage + migration  
**Changes:** 5-8 files  
**Lines:** ~100-150 lines  
**Risk:** MEDIUM (data migration, must not lose conversations)

**Patch Plan:**
1. Create migration utility: copy `omega-chat-conversation-id` → `titane_active_conversation_id` if missing
2. Run migration on app boot (once)
3. Update all references to read from `titane_active_conversation_id` only
4. Deprecate `omega-chat-conversation-id` (keep for 1 version, then delete)
5. Add migration test

### Verification Strategy
**Tests:**
- Create test with old key → verify migration runs → verify new key exists
- Verify memory loading works after migration
- x3 runs with different starting states (no key, old key, both keys)

**Gates:**
- G_SOURCE_OF_TRUTH_CLARIFIED: FAIL → PASS
- G_MEMORY_CHAIN_TRUTH: PARTIAL → PASS

### Rollback
```bash
git restore -- src/pages/Memory.tsx src/ui/pages/Chat.tsx src/services/conversation/
```

**Rollback Proof:** Removes migration, restores fallback logic

### Priority Rationale
- **P0** because:
  - Risk of data loss/fragmentation
  - Blocks memory chain verification
  - Cascades to other memory issues
  - Medium complexity but bounded

**Decision:** This is LOCK #2

---

## LOCK #3: SYSTEM_HEALTH_POLLING (P0) 🔴

### Description
**No backend-to-frontend sync for system health/engine state**

Frontend stores (`useSystemStore`, `SingularityState.engines`) display system health, but:
- No polling mechanism
- No IPC events for state changes
- Stale data after boot
- Admin/DevPage shows guesses, not truth

### Impact
- **False Healthy States:** UI shows "healthy" but backend engine degraded
- **Diagnostic Failure:** DevPage/AdminPage cannot be trusted
- **Silent Failures:** User doesn't know memory engine crashed
- **Ops Blindness:** Cannot monitor system in production

### Domain
- System monitoring
- Admin/DevPage diagnostics
- Backend engine state

### Files Involved
1. `src/stores/systemStore.ts` - Frontend health store
2. `src/core/state/SingularityState.ts` - Orchestration state
3. `src-tauri/src/singularity/` - Backend health truth
4. `src/pages/DevPage.tsx` - Admin diagnostics UI
5. Need new IPC command: `get_system_health`

### Current State
- ❌ No backend health IPC command
- ❌ Frontend stores have hardcoded or guessed state
- ❌ No polling loop
- ❌ Admin page unreliable

### Root Cause
System health was designed as frontend-only initially. Backend health not exposed via IPC.

### Minimal Patch Scope
**Scope:** Frontend + Backend IPC  
**Changes:** 6-10 files  
**Lines:** ~200-300 lines  
**Risk:** MEDIUM (new IPC command, polling loop, state sync)

**Patch Plan:**
1. **Backend:** Create `get_system_health` IPC command
   - Returns: engine states, memory stats, provider availability, errors
   - File: `src-tauri/src/singularity/commands.rs` (new)
2. **Frontend:** Create health polling service
   - Poll every 5-10 seconds
   - Update `useSystemStore` from backend response
   - File: `src/services/systemHealthPoller.ts` (new)
3. **UI:** Wire DevPage to poll on mount
4. **Test:** Verify polling works, stale data replaced

### Verification Strategy
**Tests:**
- Start app → verify initial health fetch
- Simulate backend engine failure → verify UI reflects within 10s
- Stop polling → verify no memory leak
- x3 runs with different engine states

**Gates:**
- G_DIAGNOSTICS_HEALTH_TRUTH: FAIL → PASS
- G_UI_RUNTIME_CHAIN_TRUTH: PARTIAL → QUALIFIED

### Rollback
```bash
git restore -- src/stores/systemStore.ts src/pages/DevPage.tsx src/services/
git restore -- src-tauri/src/singularity/commands.rs
```

**Rollback Proof:** Removes IPC command and polling, reverts to static state

### Priority Rationale
- **P0** because:
  - Diagnostic integrity critical for ops
  - Violates I7 (no fake health)
  - Blocks admin workflows
  - Higher complexity but necessary

**Decision:** This is LOCK #3

---

## LOCK #4: MEMORY_STATE_SYNC (P1) 🟠

### Description
**Memory state (STM/MTM/LTM) not synced frontend ↔ backend**

Similar issue to health polling: `useMemoryEngineStore` shows memory counts/state, but doesn't poll backend `ChatMemoryManager` for truth.

### Impact
- **Stale Memory Counts:** UI shows 47 memories, backend has 52
- **Control Verification:** User toggles STM off, no confirmation from backend
- **Memory Page Unreliable:** Memory.tsx may show wrong data

### Domain
- Memory OS
- Memory UI controls
- Chat memory injection

### Files Involved
1. `src/stores/useMemoryEngineStore.ts`
2. `src-tauri/src/chat_engine/memory.rs`
3. `src/pages/Memory.tsx`
4. Need IPC: `get_memory_stats`

### Current State
- ❌ No memory stats IPC command
- ❌ Frontend store not synced
- ⚠️ Memory injection works (backend doesn't need frontend store)
- ❌ UI controls not verified

### Minimal Patch Scope
**Scope:** Similar to LOCK #3  
**Changes:** 5-8 files  
**Lines:** ~150-250 lines  
**Risk:** MEDIUM (new IPC, polling)

**Patch Plan:**
1. Backend: `get_memory_stats` IPC command (counts, config, health)
2. Frontend: Memory polling service (poll every 10s or on-demand)
3. UI: Wire Memory.tsx to poll on mount
4. Test: Verify counts match backend

### Priority Rationale
- **P1** (not P0) because:
  - Memory injection works (backend doesn't rely on frontend store)
  - UI display issue, not functional failure
  - Lower user impact than provider/health
  - Can defer after P0 locks

**Decision:** This is LOCK #4 (fix after #1-3)

---

## LOCK #5: CHAT_MODE_STORE_ISOLATION (P2) 🟡

### Description
**useChatModeStore independent from localStorage and backend**

Chat mode store (Zustand) not synced with `localStorage['titane_chat_mode_default']` or backend mode setting.

### Impact
- LOW: Mode changes work but may not persist correctly
- User sets mode, refreshes, mode resets

### Priority Rationale
- **P2** because:
  - Functional but suboptimal
  - Easy fix but lower impact
  - Defer to cleanup phase

**Decision:** This is LOCK #5 (cleanup)

---

## SUMMARY

| Lock | Priority | Domain | Impact | Complexity | Status |
|------|----------|--------|--------|------------|--------|
| **#1 Provider Display Truth** | **P0** 🔴 | Chat UI | CRITICAL | LOW | **MAIN LOCK** |
| **#2 Conversation ID Dual Keys** | **P0** 🔴 | Storage | CRITICAL | MEDIUM | SECONDARY |
| **#3 System Health Polling** | **P0** 🔴 | Admin/Diagnostics | CRITICAL | MEDIUM | TERTIARY |
| **#4 Memory State Sync** | P1 🟠 | Memory UI | MEDIUM | MEDIUM | DEFERRED |
| **#5 Chat Mode Store Isolation** | P2 🟡 | Chat Config | LOW | LOW | CLEANUP |

---

## MAIN_LOCK DECISION

**LOCK #1: PROVIDER_DISPLAY_TRUTH**

**Rationale:**
1. **Lowest Risk:** Frontend-only, backend already correct
2. **Highest Confidence:** Well-scoped, clear requirements
3. **Constitutional Violation:** Directly violates I3 (no lying UI)
4. **User-Facing:** Immediate trust/UX benefit
5. **Proof Simple:** Existing test can verify

**Next Action ≤30 MIN:**
1. Read current Chat.tsx provider display code
2. Read useChat.ts response handling
3. Design minimal UI patch (badge + fallback indicator)
4. Implement + test
5. Run provider-flow test x3
6. Update matrices
7. Produce verdict

---

## EXECUTION PLAN

**Phase 1 (This Session):**
- Fix LOCK #1 (Provider Display Truth)
- Verify with targeted test
- x3 stability
- Document in proof pack

**Phase 2 (Next Session):**
- Fix LOCK #2 (Conversation ID migration)
- Fix LOCK #3 (Health polling)
- Verify both
- x3 stability

**Phase 3 (Cleanup):**
- Fix LOCK #4 (Memory sync)
- Fix LOCK #5 (Chat mode store)
- Final verification
- System-wide x3

**Estimated Total Time:** 3-4 hours across sessions  
**This Session Target:** LOCK #1 resolved + proof pack

---

**VERDICT:** 5 causal locks identified. LOCK #1 (Provider Display Truth) selected as MAIN_LOCK for immediate repair.
