# Phase A Findings — Ollama Transport Violation

**Date**: 2025-02-18T13:50:00Z  
**Status**: ✅ COMPLETE  
**Verdict**: READY FOR PHASE B PATCH

---

## 1. Violation Summary

| Field | Value |
|-------|-------|
| **File** | `src/services/ai/providers/ollama.ts` |
| **Lines** | 39–40 |
| **Violation** | Direct localhost:11434 reference in source code |
| **Pattern** | `endpoint: 'http://127.0.0.1:11434'` (line 39) |
| **Pattern** | `host: '127.0.0.1'` (line 40) |
| **Guard** | `pnpm run guard:ollama-proxy` |
| **Current State** | EXIT_CODE=1 (FAIL) |
| **Canonical Path** | `src/services/ai/transports/ollamaTransport.ts` |

---

## 2. Root Cause Analysis

### Issue Origin
- **DEFAULT_OLLAMA_CONFIG** (line 35–50) contains a hardcoded direct endpoint reference
- This is a **configuration object that is never actively used** in current code paths
- The transport layer already abstracts all connectivity via:
  - **Dev Mode**: HTTP proxy (`/api/ollama` via Vite)
  - **Prod Mode**: IPC invoke (Tauri, not direct endpoint)

### Why This Violates Constitutional Guards
- Constitutional guard enforces Ring architecture: no direct localhost calls in `src/` layer
- Source code should never reference direct network endpoints
- Transport layer provides single point of truth for all Ollama connections
- Violation presence = potential maintenance liability (code duplication, inconsistency)

### Current Impact
- Config object **NOT ACTIVELY USED** in live code path:
  - `ollamaCheckHealth()` → uses transport abstraction (ollamaTransport.ts)
  - `ollamaGenerate()` → uses transport abstraction (ollamaTransport.ts)
  - UI/Services → import `ollamaCheckHealth`, `ollamaGenerate` from transport
- **Result**: Guard violation is "dormant but present" — fixes itself with minimal patch

---

## 3. FILES_ALLOWED for Patch Scope

**ALLOWED modifications:**
- `src/services/ai/providers/ollama.ts` — Remove direct endpoint references from DEFAULT_OLLAMA_CONFIG

**FORBIDDEN modifications:**
- `src/` — No other files may be modified
- `src-tauri/` — No backend changes
- `pnpm-lock.yaml` — NO CHANGES
- `package.json` — NO CHANGES
- Tests — NO TEST CHANGES
- Guards — NO GUARD SCRIPT CHANGES

---

## 4. Exact Violation Scope

### DEFAULT_OLLAMA_CONFIG Block (Lines 35–50)

**Current (VIOLATING):**
```typescript
export const DEFAULT_OLLAMA_CONFIG = {
  endpoint: 'http://127.0.0.1:11434',  ← LINE 39: VIOLATION
  host: '127.0.0.1',                    ← LINE 40: VIOLATION
  port: 11434,
  model: 'gemma2:2b',
  // ... rest unchanged
} as const;
```

**Patch Target:** Remove lines 39–40 (direct endpoint and host references)

**Rationale:**
1. Transport layer already provides endpoint abstraction
2. Config object is **NOT ACTIVELY USED** for connectivity
3. Minimal change — only removes unused/duplicate configuration
4. No API breaking change (endpoint property never accessed in current code)

### Downstream Usage (All Safe)

```typescript
// Lines 57–87: getOllamaConfig()
// - Uses DEFAULT_OLLAMA_CONFIG as base
// - After patch: no longer propagates direct endpoint
// - Still returns model, port, timeout settings (all safe)
// - Transport layer uses /api/ollama or IPC (ignores endpoint property)

// Lines 25–26: Already imports canonical transport
import { ollamaCheckHealth, ollamaGenerate } from '../transports/ollamaTransport';

// Lines 123–165: initializeOllama()
// - Calls ollamaCheckHealth() from transport
// - No direct endpoint reference

// Lines 208+: Chat/generate functions
// - Call ollamaGenerate() from transport
// - No direct endpoint reference
```

---

## 5. MINIMAL PATCH Description

### Changes Required

**File:** `src/services/ai/providers/ollama.ts`

**Modification Type:** DELETE lines 39–40 from DEFAULT_OLLAMA_CONFIG

**Before:**
```typescript
export const DEFAULT_OLLAMA_CONFIG = {
  endpoint: 'http://127.0.0.1:11434',  ← DELETE
  host: '127.0.0.1',                    ← DELETE
  port: 11434,
  model: 'gemma2:2b',
  // ...
} as const;
```

**After:**
```typescript
export const DEFAULT_OLLAMA_CONFIG = {
  port: 11434,
  model: 'gemma2:2b',
  // ...
} as const;
```

### Scope Confirmation
- **Lines Changed**: 2 (delete 39–40)
- **Files Modified**: 1 (ollama.ts ONLY)
- **API Impact**: NONE (endpoint property never accessed externally)
- **Test Impact**: NONE (existing tests do not reference deleted properties)

---

## 6. Guard Re-verification Plan

**Post-Patch Verification:**
```bash
# MUST EXIT_CODE=0 (PASS)
pnpm run guard:ollama-proxy

# Expected scan results:
# - NO match for 'localhost:11434' in src/
# - NO match for '127.0.0.1:11434' in src/
# - PASS: All scans complete, no violations detected
```

**Regression Check:**
- Transport layer (`ollamaTransport.ts`) remains UNCHANGED
- Import paths remain UNCHANGED
- No cascading failures expected

---

## 7. Rollback Plan (if needed)

If guard still fails post-patch:
```bash
# Restore original ollama.ts
git restore src/services/ai/providers/ollama.ts

# Re-run guard verification
pnpm run guard:ollama-proxy

# Expected: Back to existing FAIL state (same as current P10.3)
```

---

## 8. Consent and Approval

- **Patch Strategy**: OPTION A (remove direct endpoint from config entirely)
- **Scope**: MINIMAL (2 lines delete, 1 file modified)
- **Risk**: LOW (endpoint never used in current code)
- **Dependencies**: NONE (transport layer independent)
- **Approval Status**: ✅ AUTHORIZED via `GO_FIX_OLLAMA_SRC_TRANSPORT__TITANE_INFINITY`

---

## 9. Next Step: Phase B Execution

**Phase B Activity**: Apply minimal patch
1. Delete lines 39–40 from DEFAULT_OLLAMA_CONFIG
2. Create 05_PATCH_DIFF.txt with exact git diff
3. Verify file syntax (TypeScript check)
4. Document git diff for proof pack

**Expected Outcome**:
- ✅ Patch applied cleanly
- ✅ No syntax errors
- ✅ Guard re-run ready

---

## Appendix A: Guard Script Reference

**Location**: `scripts/guard/guard-ollama-proxy.sh`
**Invoked via**: `pnpm run guard:ollama-proxy`
**Purpose**: Scan src/ for direct localhost:11434 references (constitutional check)
**Current Result**: EXIT_CODE=1 (violation detected at ollama.ts:39)
**Post-Patch Expected**: EXIT_CODE=0 (no violations detected)

---

**END OF PHASE A FINDINGS**
