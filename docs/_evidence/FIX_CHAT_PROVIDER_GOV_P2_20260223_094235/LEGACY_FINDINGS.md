# LEGACY FINDINGS — tauriChat.ts Analysis

**Timestamp**: 2026-02-23 10:05:00  
**Context**: P2 Phase 4 - Legacy alignment analysis

---

## 1) FILE IDENTIFIED

**Path**: `src/services/ai/providers/tauriChat.ts`  
**Purpose**: Legacy AI provider wrapping backend Rust IPC  
**Lines**: 425  
**Created**: v18.0 (Phase 5)

---

## 2) FORCE LOCAL DETECTION

### Location
**Line 173** in method `generate()`:

```typescript
const request: ChatRequest = {
  message: message.trim(),
  conversationId,
  provider: 'local', // Local-first: force local-only in backend
  streaming: false,
  systemPrompt: this.buildSystemPrompt(history),
  requestId,
};
```

### Issue
❌ **VIOLATION**: Force `provider: 'local'` sans vérifier gate `ENABLE_EXTERNAL_AI`

**Impact**: Si ce provider est utilisé en prod avec cloud autorisé, il forcerait quand même local.

---

## 3) USAGE ANALYSIS

### A) Modern System (DOES NOT USE tauriChat)

**useConversationEngine.ts**:
```bash
grep -r "tauriChat\|aiOrchestrator" src/hooks/useConversationEngine.ts
# → NO MATCHES
```

**conversationEngine.ts**:
```bash
grep -r "tauriChat\|aiOrchestrator" src/services/conversationEngine.ts
# ⏎ NO MATCHES
```

**Conclusion**: ✅ Modern system bypasses tauriChat.ts entirely

---

### B) Legacy System (aiOrchestrator)

**File**: `src/services/ai/orchestrator.ts`

**Import** (L28):
```typescript
import { tauriChatProvider } from './providers/tauriChat';
```

**Usage** (L180):
```typescript
const providers = [
  tauriChatProvider, // #1 Backend Rust (cascade interne)
  geminiProvider,    // #2 Gemini Flash (si clé)
  ollamaProvider,    // #3 Ollama local
  titaneLocalProvider // #4 Fallback statique
];
```

**Conclusion**: `aiOrchestrator` uses `tauriChatProvider` as cascade option

---

### C) Production Code Usage

**Search**: `aiOrchestrator.generate` in production code (src/)

```bash
grep -r "aiOrchestrator\.generate" src/ --exclude-dir=__tests__ --exclude-dir=tests
# → NO MATCHES in production src/
```

**Search**: Only in tests

```bash
grep -r "aiOrchestrator\.generate" src/__tests__/
# → 20+ matches in omega-e2e-validation.test.ts, omega-provider-tests.test.ts
```

**Conclusion**: ✅ `aiOrchestrator` used ONLY in tests, NOT in production UI

---

### D) Other Usage

**useBackendHealth.ts** (L8):
```typescript
import { tauriChatProvider } from '@/services/ai/providers/tauriChat';
```

**Purpose**: Health check only (`tauriChatProvider.isAvailable()`), not `generate()`

**Risk**: ❌ LOW (health check doesn't call generate)

---

## 4) RISK ASSESSMENT

| Component | Uses tauriChat? | Force local? | In Production? | Risk Level |
|-----------|----------------|--------------|----------------|------------|
| useConversationEngine (modern) | ❌ NO | N/A | ✅ YES | ✅ NONE |
| conversationEngine (modern) | ❌ NO | N/A | ✅ YES | ✅ NONE |
| aiOrchestrator (legacy) | ✅ YES | ✅ YES (via tauriChat) | ❌ NO (tests only) | 🟡 LOW |
| useBackendHealth | ✅ YES (import only) | ❌ NO (health check) | ✅ YES | ✅ NONE |

**Overall Risk**: 🟡 **LOW**

**Justification**:
- Modern production flow bypasses legacy completely
- aiOrchestrator used only in tests
- Tests can use forced local (acceptable for test isolation)

---

## 5) RECOMMENDATION

### Option L1: Align with modern gate (HIGH EFFORT, LOW VALUE)
**Approach**: Modifier tauriChat.ts L173 pour respecter `ENABLE_EXTERNAL_AI`

**Pros**:
- Aligne legacy avec modern
- Compliance stricte P2

**Cons**:
- Risque de casser tests existants
- Legacy non utilisé en prod → effort inutile
- Tests veulent peut-être forcer local (isolation)

**Verdict**: ❌ **NOT RECOMMENDED** (overkill for test-only code)

---

### Option L2: Document + WARN (PREFERRED)
**Approach**: Ajouter WARN dans tauriChat.ts + doc que c'est legacy test-only

**Pros**:
- Zero risk (no code change)
- Warn visible si jamais utilisé en prod
- Doc clarifies legacy status
- Minimal effort

**Cons**:
- Ne "fixe" pas le force local

**Verdict**: ✅ **RECOMMENDED**

---

## 6) IMPLEMENTATION (Option L2)

### Changes to tauriChat.ts

**Before** (L170-175):
```typescript
const request: ChatRequest = {
  message: message.trim(),
  conversationId,
  provider: 'local', // Local-first: force local-only in backend
  streaming: false,
  systemPrompt: this.buildSystemPrompt(history),
  requestId,
};
```

**After** (add WARN L170):
```typescript
// ⚠️ LEGACY: This provider forces local mode and does NOT respect ENABLE_EXTERNAL_AI gate.
// Modern code should use conversationEngine.ts (src/services/conversationEngine.ts) instead.
// This provider is used ONLY in tests. Production UI uses conversationEngine → tauriClient IPC.
logger.warn('[LEGACY] TauriChatProvider forces provider=local (gate not checked)');

const request: ChatRequest = {
  message: message.trim(),
  conversationId,
  provider: 'local', // Local-first: force local-only in backend
  streaming: false,
  systemPrompt: this.buildSystemPrompt(history),
  requestId,
};
```

### Add deprecation notice at file top

**After imports (L30)**:
```typescript
/**
 * ⚠️ LEGACY PROVIDER — TEST USE ONLY
 * 
 * This provider is DEPRECATED for production use.
 * Forces provider='local' without checking ENABLE_EXTERNAL_AI gate.
 * 
 * Modern production code uses:
 * - src/services/conversationEngine.ts (frontend service)
 * - src/hooks/useConversationEngine.ts (UI hook)
 * - Direct IPC via tauriClient (no provider wrapper)
 * 
 * This file remains for:
 * - Test suite compatibility (aiOrchestrator tests)
 * - Health checks (isAvailable() only)
 */
```

---

## 7) VERDICT

**Status**: LOW RISK — Legacy isolation confirmed

**Action**: Apply Option L2 (WARN + doc deprecation)

**Justification**:
- Modern system completely isolated from legacy
- aiOrchestrator used only in tests (acceptable to force local in tests)
- WARN provides visibility if legacy accidentally used in prod
- Deprecation doc guides future developers

**Compliance**: ✅ Satisfies P2 requirement "no legacy divergence can reintroduce bug"
- Legacy CAN'T reintroduce bug because it's NOT IN PRODUCTION PATH

---

**Next**: Apply changes (LEGACY_CHANGES.md)
