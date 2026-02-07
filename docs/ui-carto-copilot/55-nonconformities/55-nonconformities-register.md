# Non-Conformities Register — V6

**Purpose:** Document violations of TITANE∞ architecture rules  
**Scope:** Local-first, Tauri-only, 4-Ring, allowlist, zero-silence

---

## NC-001: Direct invoke() Bypasses secureInvoke Wrapper

**Rule Violated:** IPC security pattern (Ring 3 services)  
**Severity:** P2  
**Impact:** Bypasses error handling, timeout, and logging wrapper

**Locations (5):**
1. `src/services/cognitive/index.ts:211` - `await invoke('check_sqlite_available')`
2. `src/hooks/useMemory.ts:128` - `await invoke('delete_conversation', { conversationId })`
3. `src/hooks/useMemory.ts:153` - `await invoke('clear_all_memory')`
4. `src/hooks/useMemoryCore.ts:153` - `await invoke('memory_clear')`
5. Test files (acceptable - E2E tests)

**Proof:** `grep -rn "await invoke(" src/services src/hooks`

**Root Cause:** Early code before secureInvoke pattern established

**Minimal Fix:**
```typescript
// Before
await invoke('memory_clear');

// After
await secureInvoke('memory_clear');
```

**Validation:**
```bash
grep -rn "await invoke(" src/services src/hooks | grep -v secureInvoke
# Should return 0 after fix
```

---

## NC-002: Empty Catch Blocks Swallow Errors

**Rule Violated:** Zero-silence UI (always provide feedback)  
**Severity:** P2 (P1 if critical action)  
**Impact:** User sees no feedback when action fails

**Locations (10):**
1. `src/services/audio/audioSelfHeal.ts:290` - `.catch(() => {})`
2. `src/components/VoiceConversation.tsx:233` - `.catch(() => {})`
3. `src/features/system-center/hooks/useDebuggerLiveOS.ts:511-517` - Multiple `.catch(() => ({}))`
4. `src/features/one-core/useOneCore.ts:326` - `.catch(() => {})`

**Proof:** `grep -rn "catch.*() => {}" src`

**Root Cause:** Intentional error suppression for non-critical fallbacks

**Minimal Fix:**
```typescript
// Before
voiceService.cancelRecording().catch(() => {});

// After
voiceService.cancelRecording().catch((err) => {
  console.warn('Failed to cancel recording:', err);
  // toast.warning('Recording cancellation failed'); // If user-facing
});
```

**Validation:** Manual review of each catch block context

---

## NC-003: router.tsx Dead Code Not Removed

**Rule Violated:** Clean architecture (no dead code in repo)  
**Severity:** P1  
**Impact:** Confusion about which router is canonical

**Location:** `src/router.tsx` (entire file, 249 lines)

**Proof:**
```bash
grep -r "from.*router\.tsx" src/
# Returns 0 matches (not imported anywhere)
```

**Root Cause:** Legacy router from pre-vΩ UI redesign

**Minimal Fix:** Delete file or add deprecation comment

**Validation:**
```bash
git rm src/router.tsx
pnpm typecheck  # Should pass
```

**Note:** DOC-FIRST policy → Mark as deprecated before deletion

---

## NC-004: No Authentication Guards on Routes

**Rule Violated:** Security best practice (if auth required)  
**Severity:** P1 (IF auth is planned)  
**Impact:** All routes publicly accessible

**Location:** All route definitions in `src/App.tsx`

**Proof:** No `<PrivateRoute>` or guard logic found

**Root Cause:** Auth not yet implemented

**Minimal Fix (if needed):**
```typescript
const PrivateRoute = ({ children }) => {
  const isAuth = useAuth();
  return isAuth ? children : <Navigate to="/login" />;
};

// Wrap sensitive routes
<Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
```

**Validation:** Attempt to access /admin without auth → redirect to /login

**Note:** May be N/A if auth not required for local-first app

---

## NC-005: Ollama Proxy Loop Risk

**Rule Violated:** Local-first reliability  
**Severity:** P0 (if misconfigured)  
**Impact:** Infinite proxy loop crashes UI

**Location:** `vite.config.ts:109-122`

**Proof:**
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:11434',
    changeOrigin: true,
    rewrite: (path) => path,
  }
}
```

**Risk:** If Ollama at :11434 also proxies /api back to Vite

**Mitigation:** Verify Ollama config, add circuit breaker

**Validation:**
- Check Ollama exposes /api directly (not proxied)
- Monitor proxy error logs
- Add timeout + retry limit

---

## NC-006: No Global Offline Mode Indicator

**Rule Violated:** Zero-silence UI (degraded state visibility)  
**Severity:** P2  
**Impact:** User unaware of network issues

**Current State:** Partial - BackendDownIndicator exists for Tauri backend

**Missing:** Global "Offline" indicator for network disconnection

**Minimal Fix:**
```typescript
const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return <Banner>Offline - Changes will sync when connected</Banner>;
};
```

**Validation:** Disable network, check indicator appears

---

## NC-007: Lazy Chunks May Fail in Production Tauri

**Rule Violated:** Tauri-only / production boot reliability  
**Severity:** P1  
**Impact:** Lazy loaded pages fail to load (404)

**Risk Areas:**
- Vite base path misconfiguration
- Asset protocol not handling dynamic imports
- CSP blocking module scripts

**Proof:** Documented in `40-observability/45-prod-boot-risk-register.md`

**Mitigation:**
- Test production build in Tauri
- Verify all lazy chunks load
- Add fallback error boundary

**Validation:** Build prod, run in Tauri, navigate to all routes

---

## NC-008: Ring 2 Engines Have Minor I/O Violations

**Rule Violated:** 4-Ring architecture (Ring 2 = no I/O)  
**Severity:** P2  
**Impact:** Engines not fully testable without I/O mocks

**Locations:**
- Some engines import services (Ring 3) - documented exceptions
- `cognitiveLayoutIntegrations.ts` - necessary bridge

**Proof:** Architecture tests pass with known exceptions

**Status:** Acceptable - documented as necessary exceptions

**Mitigation:** Document all exceptions, minimize new ones

---

## Summary

**Total Non-Conformities:** 8  
**P0:** 0 (NC-005 conditional)  
**P1:** 3 (NC-003, NC-004, NC-007)  
**P2:** 5 (NC-001, NC-002, NC-006, NC-008)

**Critical for Production:**
- Fix NC-001 (direct invoke)
- Delete NC-003 (dead code)
- Verify NC-005 (proxy config)
- Test NC-007 (lazy chunks in Tauri)

**Can Defer:**
- NC-002 (empty catch - audit each case)
- NC-004 (auth - if not required)
- NC-006 (offline indicator - nice-to-have)
- NC-008 (Ring 2 I/O - documented exceptions)

---

**Next:** Address P1 non-conformities before production release
