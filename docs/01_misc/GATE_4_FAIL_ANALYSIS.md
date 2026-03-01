# E2E CSP Unblock — GATE_4 FAIL Analysis

**Date:** 2026-02-08  
**Status:** ❌ GATE_4 FAIL — CSP Fix Insufficient

---

## Build Success ✅

**Tauri Binary:** `src-tauri/target/release/titane-infinity`  
**Build Time:** 8m 29s  
**CSP Updated:** ✅ `connect-src` includes `http://127.0.0.1:11434`

---

## E2E Test Results ❌

**Status:** RUNNING (in progress)  
**Boot Smoke:** ✅ PASS  
**AI Verification:** ❌ FAIL — Persistent "Fetch is aborted" errors

**Error Count:** 50+ occurrences in 60 seconds  
**Error Pattern:**
```
Erreur lors de l'appel à Ollama : Fetch is aborted. 
Vérifiez qu'Ollama est actif sur http://127.0.0.1:11434
```

---

## Root Cause Analysis (Updated)

### Initial Hypothesis (INCORRECT)
> CSP `connect-src` blocks fetch to `http://127.0.0.1:11434`

**Test:** CSP updated to include endpoint  
**Result:** ❌ Error persists — Hypothesis invalidated

### Actual Root Cause (CONFIRMED)

**Frontend Code Logic Issue:**

**File:** `src/services/ai/providers/ollama.ts` (lines 32-37)  
```typescript
const isDevelopment = import.meta.env.DEV;
const OLLAMA_BASE_URL = isDevelopment
  ? '/api/ollama' // Proxy Vite (dev mode)
  : 'http://127.0.0.1:11434'; // Direct URL (production)
```

**Problem:**
1. **Dev mode** (`isDevelopment=true`): Frontend uses `/api/ollama` → Vite proxy → Works
2. **Production build** (`isDevelopment=false`): Frontend uses `http://127.0.0.1:11434` → **CSP blocks or Tauri restricts external HTTP**
3. **E2E tests**: Use production build → Same behavior as production

**Evidence:**
- Tauri backend proxy **IS working**: `🔵 Proxying: GET /api/ollama/tags` visible in logs
- Frontend **IS NOT using proxy**: Error message shows direct `http://127.0.0.1:11434` access attempt
- Backend can reach Ollama (proxy succeeds)
- Frontend cannot reach Ollama (fetch aborts)

**Architectural Issue:**
Frontend should **always** use proxy endpoint `/api/ollama`, not direct HTTP URLs, even in production. Tauri backend provides secure proxying.

---

## GATE_4 Verdict

**Status:** ❌ FAIL  
**Blocker:** Frontend production build uses direct HTTP URL instead of Tauri proxy  
**CSP Fix:** ✅ Applied but **insufficient** (real issue is URL routing logic)

---

## Next Steps (Required for UNBLOCK)

### Option A: Frontend Proxy Mode (RECOMMENDED)

**Change `ollama.ts` to always use proxy:**

```typescript
// Current (BROKEN in production):
const OLLAMA_BASE_URL = isDevelopment
  ? '/api/ollama'
  : 'http://127.0.0.1:11434';

// Fixed (works everywhere):
const OLLAMA_BASE_URL = '/api/ollama'; // Always proxy via Tauri backend
```

**Rationale:**
- Tauri backend already has `/api/ollama` proxy working
- Avoids CSP/CORS issues entirely
- Consistent behavior dev/prod
- More secure (no direct external HTTP from WebView)

### Option B: CSP Further Expansion (NOT RECOMMENDED)

Add more permissive CSP to allow fetch API:
```json
"connect-src": "... http://127.0.0.1:11434 http://localhost:11434"
```

**Issues with Option B:**
- Already tried, doesn't work
- May hit other Tauri security restrictions
- Less secure than proxy approach

---

## Implementation Plan

### Step 1: Fix Frontend Ollama URL Logic

**File:** `src/services/ai/providers/ollama.ts`  
**Change:** Line 32-37

```diff
- const isDevelopment = import.meta.env.DEV;
- const OLLAMA_BASE_URL = isDevelopment
-   ? '/api/ollama'
-   : typeof runtimeConfig.ollamaUrl === 'string' &&
-       runtimeConfig.ollamaUrl.trim().length > 0
-     ? runtimeConfig.ollamaUrl.trim()
-     : 'http://127.0.0.1:11434';
+ // Always use Tauri proxy endpoint (works in dev AND production)
+ const OLLAMA_BASE_URL =
+   typeof runtimeConfig.ollamaUrl === 'string' &&
+   runtimeConfig.ollamaUrl.trim().length > 0
+     ? runtimeConfig.ollamaUrl.trim()
+     : '/api/ollama';
```

**Effect:**
- Dev mode: Uses `/api/ollama` (no change)
- Production: Uses `/api/ollama` instead of `http://127.0.0.1:11434` (FIX)
- Custom URL: Respects `runtimeConfig.ollamaUrl` if configured

### Step 2: Verify Tauri Backend Proxy

**Confirm backend has `/api/ollama` → `http://127.0.0.1:11434` mapping:**

```bash
grep -r "api/ollama" src-tauri/src/ | grep -E "route|proxy|forward"
```

**Expected:** Backend route handler that forwards `/api/ollama/*` to Ollama

### Step 3: Rebuild + Retest

```bash
# Rebuild Tauri with fixed frontend code
pnpm run build:tauri:e2e

# Retest E2E
pnpm run e2e:desktop
```

**Expected Outcome:**
- ✅ No more "Fetch is aborted" errors
- ✅ Proxy logs show `/api/ollama/*` requests
- ✅ Q1-Q20 all receive AI responses

---

## Alternative: Verify Tauri IPC for Ollama

**If proxy approach fails**, consider using Tauri IPC commands instead of HTTP:

```typescript
// Instead of fetch('/api/ollama/...')
const response = await invoke('ollama_generate', { prompt, model });
```

This bypasses WebView network restrictions entirely.

---

## GATE_5 Status

**Cannot proceed:** GATE_4 must PASS before checking proof pack.

---

## Timeline

**CSP Fix:** ✅ 8m 29s (build complete)  
**CSP Test:** ❌ FAIL (errors persist)  
**Root Cause:** ✅ Identified (URL routing logic issue)  
**Fix Required:** Frontend code change + rebuild  
**Estimated Time:** 10-15 minutes (code change + rebuild + retest)

---

**BLOCKER:** Frontend production build must use Tauri proxy `/api/ollama` instead of direct HTTP `http://127.0.0.1:11434`

**NEXT:** Implement Option A (Frontend Proxy Mode) → Rebuild → Retest
