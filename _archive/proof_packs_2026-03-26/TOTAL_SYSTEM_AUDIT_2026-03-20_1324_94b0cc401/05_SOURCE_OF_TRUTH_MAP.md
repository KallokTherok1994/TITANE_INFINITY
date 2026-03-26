# 05_SOURCE_OF_TRUTH_MAP.md
## TITANE∞ TOTAL SYSTEM AUDIT — Source of Truth Analysis

**Generated:** 2026-03-20 13:24 UTC  
**Mode:** AUDIT

---

## CRITICAL CONFLICTS IDENTIFIED

### 🔴 CRITICAL: Provider Selection Truth

**Domain:** Active AI Provider  
**Conflict Type:** UI Display ≠ Backend Reality  
**Severity:** CRITICAL (Silent lying UI)

**Sources:**
1. **UI Source:** `localStorage['omega-chat-preferred-provider']`
   - File: `src/ui/pages/Chat.tsx`
   - Type: User preference (not truth)
   - Values: `'auto' | 'gemini' | 'ollama' | 'local' | 'openai' | 'anthropic'`

2. **Backend Source:** `ProviderBridge` actual decision
   - File: `src-tauri/src/chat_engine/providers.rs:4426`
   - Type: Runtime truth (what actually ran)
   - Returns: `ProviderDecisionMeta` with actual provider used

3. **Truth Contract:** `ProviderDecisionMeta`
   - File: `src/types/providerDecisionMeta.ts`
   - Purpose: Backend tells UI what really happened
   - **STATUS:** ❌ RETURNED BUT NOT DISPLAYED

**Drift Observed:**
- User selects "ollama" in UI
- Backend falls back to "gemini" (ollama unavailable)
- UI still shows "ollama" selected
- No visual indication of actual provider used

**Canonical Source Decision:** `ProviderDecisionMeta` from backend  
**Required Fix:** Display actual provider from response metadata in UI

---

### 🔴 CRITICAL: Conversation ID Dual Keys

**Domain:** Active Conversation Identity  
**Conflict Type:** Competing Storage Keys  
**Severity:** CRITICAL (Data fragmentation)

**Sources:**
1. **Primary Key:** `localStorage['titane_active_conversation_id']`
   - File: `src/pages/Memory.tsx`
   - Usage: Memory page, new conversations
   - Status: PRIMARY (newer)

2. **Legacy Key:** `localStorage['omega-chat-conversation-id']`
   - File: `src/ui/pages/Chat.tsx`
   - Usage: Chat page with fallback logic
   - Status: LEGACY (older)

**Fallback Logic Present:** YES
```typescript
const id = localStorage.getItem('titane_active_conversation_id') 
       || localStorage.getItem('omega-chat-conversation-id')
```

**Drift Risk:**
- Two pages may load different conversation IDs
- Memory updates may not sync to chat
- Conversation history fragmentation

**Canonical Source Decision:** `titane_active_conversation_id` (PRIMARY)  
**Required Fix:** Migrate all references, deprecate `omega-chat-conversation-id`

---

### 🔴 CRITICAL: System Health / Engine State Schema Conflict

**Domain:** System Diagnostics & Engine Health  
**Conflict Type:** Duplicate State with Different Schemas  
**Severity:** CRITICAL (Truth ambiguity)

**Sources:**
1. **Frontend Store:** `useSystemStore`
   - File: `src/stores/systemStore.ts`
   - Schema: SystemStatus type
   - Purpose: UI display of system health

2. **Singularity State:** `SingularityState.engines`
   - File: `src/core/state/SingularityState.ts`
   - Schema: Different engine structure
   - Purpose: Global orchestration state

3. **Backend Engines:** Rust module actual state
   - Files: `src-tauri/src/{omega, memory_os, singularity}/`
   - Schema: Rust structs
   - Purpose: Actual runtime engine state

**Schema Conflicts:**
- `useSystemStore` uses `SystemStatus` type
- `SingularityState` uses custom `engines` object
- No synchronization mechanism between them
- **No polling** from backend to frontend

**Drift Observed:**
- UI may show "healthy" while backend engine is degraded
- No real-time updates without manual refresh
- Admin/DevPage diagnostics may show stale data

**Canonical Source Decision:** Backend Rust engine state  
**Required Fix:** 
- Single source of truth: backend
- Polling mechanism or IPC events for state sync
- Deprecate frontend-only state

---

### 🔴 CRITICAL: Memory State Fragmentation

**Domain:** Memory System State (STM/MTM/LTM)  
**Conflict Type:** Multiple Concurrent Sources  
**Severity:** CRITICAL (Cache incoherence)

**Sources:**
1. **Frontend Store:** `useMemoryEngineStore`
   - File: `src/stores/useMemoryEngineStore.ts`
   - Purpose: UI state for memory controls
   - Scope: UI only, not synced

2. **Conversation Storage:** `conversationStorage`
   - File: `src/services/conversation/conversationStorage.ts`
   - Purpose: Persistence layer
   - Storage: localStorage + backend calls

3. **Backend Memory Manager:** `ChatMemoryManager`
   - File: `src-tauri/src/chat_engine/memory.rs:18062`
   - Purpose: Actual memory retrieval/injection
   - Scope: Runtime truth

4. **LocalStorage Keys (5 locations):**
   - `memory_core_knowledge`
   - `xp_state`
   - `singularity-state`
   - `titane_active_conversation_id`
   - `omega-chat-conversation-id`

**Cache Coherency:** ❌ NONE  
**Synchronization:** ❌ NO POLLING

**Drift Risk:**
- Frontend store shows outdated memory count
- Backend may have saved new memories not reflected in UI
- Memory controls (STM/MTM/LTM toggles) not verified against backend

**Canonical Source Decision:** Backend `ChatMemoryManager`  
**Required Fix:** 
- Backend becomes source of truth for memory state
- Frontend polls or subscribes to memory updates
- Consolidate localStorage keys

---

## MEDIUM CONFLICTS

### 🟠 Chat Mode Store Isolation

**Domain:** Active Chat Mode  
**Sources:**
- `useChatModeStore` (Zustand)
- `localStorage['titane_chat_mode_default']`
- Backend mode setting (not exposed)

**Issue:** Store independent from localStorage and backend  
**Files:** `src/stores/useChatModeStore.ts`, `src/modules/devSudo/devSudoVisionHandlers.ts`

**Canonical Source:** Backend (if exposed) or localStorage  
**Required Fix:** Sync store ↔ localStorage on mount

---

### 🟠 Persona State Drift

**Domain:** Active Persona/Identity  
**Sources:**
- `SingularityState.engines.persona`
- `src/core/ai/agents/persona_agent.ts`

**Issue:** Not synced in real-time  
**Files:** `src/core/state/SingularityState.ts`, `src/core/ai/agents/persona_agent.ts`

**Canonical Source:** persona_agent runtime state  
**Required Fix:** Persona state polling or event-driven updates

---

### 🟠 Audio Settings Store vs Service

**Domain:** Audio/TTS Settings  
**Sources:**
- `useTTSEngineStore`
- `audioService` actual state

**Issue:** Store state ≠ actual service state  
**Files:** `src/stores/useTTSEngineStore.ts`, `src/features/audio-center/services/audioService.ts`

**Canonical Source:** audioService  
**Required Fix:** Service-driven store updates

---

### 🟠 Vision Settings Store vs Config

**Domain:** Vision/Camera Settings  
**Sources:**
- `useVisionStore`
- `CameraPage.tsx` local config

**Issue:** Config not synced between store and page  
**Files:** `src/stores/useVisionStore.ts`, `src/pages/CameraPage.tsx`

**Canonical Source:** useVisionStore (shared)  
**Required Fix:** CameraPage reads from store, doesn't maintain local config

---

### 🟠 XP Dual Store

**Domain:** Experience/Progression State  
**Sources:**
- `XP_ENGINE` (core logic)
- `useAutomationXPStore` (UI store)

**Issue:** Two separate stores, unclear which is truth  
**Files:** `src/core/experience/XP_ENGINE.ts`, `src/stores/useAutomationXPStore.ts`

**Canonical Source:** XP_ENGINE  
**Required Fix:** useAutomationXPStore wraps XP_ENGINE, not independent

---

## SUMMARY

**Total Conflicts:** 10  
**Critical:** 4 (provider, conversation ID, system health, memory)  
**Medium:** 6 (chat mode, persona, audio, vision, XP, others)

**Main Lock Identified:** SOURCE_OF_TRUTH_DRIFT_PROVIDER  
**Impact:** Users cannot trust UI display of active provider  
**Risk:** Silent failures, confusion, distrust

---

## CANONICAL SOURCE DECISIONS

| Domain | Canonical Source | Status | Priority |
|--------|-----------------|--------|----------|
| **Active Provider** | `ProviderDecisionMeta` (backend response) | ❌ NOT DISPLAYED | **P0** |
| **Conversation ID** | `titane_active_conversation_id` | ⚠️ PARTIAL (fallback exists) | **P0** |
| **System Health** | Backend Rust engine state | ❌ NOT POLLED | **P0** |
| **Memory State** | `ChatMemoryManager` (backend) | ❌ NOT SYNCED | **P0** |
| **Chat Mode** | Backend or localStorage | ⚠️ STORE ISOLATED | P1 |
| **Persona** | persona_agent runtime | ⚠️ NOT SYNCED | P1 |
| **Audio Settings** | audioService | ⚠️ STORE DRIFT | P2 |
| **Vision Settings** | useVisionStore | ⚠️ PAGE DRIFT | P2 |
| **XP State** | XP_ENGINE | ⚠️ DUAL STORE | P2 |

---

## NEXT ACTION

**Proceed to:** `15_CURRENT_LOCKS.md` to prioritize fix order

**Recommended Fix Sequence:**
1. Display ProviderDecisionMeta in UI (provider truth)
2. Migrate conversation ID to single key
3. Implement backend state polling for health/memory
4. Consolidate localStorage keys
5. Fix secondary source conflicts

---

**VERDICT:** 4 CRITICAL source-of-truth conflicts identified. Main lock = provider display truth.
