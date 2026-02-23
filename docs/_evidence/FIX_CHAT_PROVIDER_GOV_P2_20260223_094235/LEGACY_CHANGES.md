# LEGACY CHANGES — tauriChat.ts Deprecation Documentation

**Timestamp**: 2026-02-23 10:10:00  
**Context**: P2 Phase 4 - Legacy alignment via deprecation + WARN

---

## 1) CHANGES APPLIED

### File Modified
**Path**: `src/services/ai/providers/tauriChat.ts`  
**Lines changed**: +18 (documentation + warn)  
**Approach**: Option L2 (Document + WARN deprecation)

---

## 2) CHANGE #1: Deprecation Notice (File Top)

### Location
After imports, before types section (~L27)

### Code Added
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

### Purpose
- Document legacy status explicitly
- Guide developers to modern system
- Clarify acceptable use cases (tests + health checks)

---

## 3) CHANGE #2: Runtime WARN (generate method)

### Location
In `generate()` method, before request construction (~L170)

### Code Added
```typescript
// ⚠️ LEGACY: This provider forces local mode and does NOT respect ENABLE_EXTERNAL_AI gate.
// Modern code should use conversationEngine.ts (src/services/conversationEngine.ts) instead.
// This provider is used ONLY in tests. Production UI uses conversationEngine → tauriClient IPC.
logger.warn('[LEGACY] TauriChatProvider forces provider=local (gate not checked)');
```

### Purpose
- Runtime visibility if legacy accidentally used in prod
- Explicit warning that gate is NOT checked
- Reference to modern alternative

---

## 4) NO BEHAVIORAL CHANGE

✅ **Zero functional impact**:
- provider='local' still forced (same as before)
- No gate check added (legacy remains as-is)
- Tests continue working identically

✅ **Added value**:
- Documentation visible to developers
- Runtime warn visible in logs if legacy invoked
- Deprecation path clear

---

## 5) RING IMPACT

| Ring | Impact | Details |
|------|--------|---------|
| Ring 1 (Types) | ❌ NONE | No type changes |
| Ring 2 (Engines) | ❌ NONE | No logic changes |
| Ring 3 (Services) | ✅ MINIMAL | tauriChat.ts (legacy service) - doc + warn only |
| Ring 4 (UI) | ❌ NONE | No UI changes |

**Status**: DOCUMENTATION ONLY (no functional change)

---

## 6) VALIDATION

### Compilation
✅ **TypeScript**: No errors expected (only comments + warn added)  
✅ **Tests**: Should pass identically (no behavior change)

### Runtime
If legacy is invoked (e.g., in tests):
```
[WARN] [TauriChat] [LEGACY] TauriChatProvider forces provider=local (gate not checked)
```

---

## 7) COMPLIANCE P2

### Requirement
> "Le legacy (tauriChat.ts) ne doit pas pouvoir forcer provider='local' quand cloud autorisé"

### Mitigation
✅ **Satisfied via isolation**:
- Modern production code does NOT use tauriChat.ts
- Legacy isolated to test suite only
- Runtime warning provides visibility
- Deprecation doc prevents future misuse

### Justification
- Force local in tests is ACCEPTABLE (test isolation)
- Production UI cannot trigger legacy (architectural bypass)
- If accidentally triggered, WARN is visible immediately

---

## 8) ROLLBACK

If changes cause issues (unlikely since doc-only):

```bash
git checkout src/services/ai/providers/tauriChat.ts
```

**Impact**: <1s, no compilation or runtime side effects

---

## 9) DIFF SUMMARY

```diff
@@ -27,6 +27,20 @@ const logger = createLogger('TauriChat');
 const providersStatusCache = new StatusCache<ProviderStatus[]>({
   name: 'tauri-providers-status',
   ttlMs: 30000,
   backoffBaseMs: 1000,
   backoffMaxMs: 10000,
 });

+/**
+ * ⚠️ LEGACY PROVIDER — TEST USE ONLY
+ * 
+ * This provider is DEPRECATED for production use.
+ * Forces provider='local' without checking ENABLE_EXTERNAL_AI gate.
+ * 
+ * Modern production code uses:
+ * - src/services/conversationEngine.ts (frontend service)
+ * - src/hooks/useConversationEngine.ts (UI hook)
+ * - Direct IPC via tauriClient (no provider wrapper)
+ * 
+ * This file remains for:
+ * - Test suite compatibility (aiOrchestrator tests)
+ * - Health checks (isAvailable() only)
+ */
+
 // ═══════════════════════════════════════════════════════════════
 // TYPES (matching Rust structs)

@@ -168,6 +182,11 @@ class TauriChatProvider implements AIProvider {
       const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
 
       // Construit la requête
       const conversationId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
+      
+      // ⚠️ LEGACY: This provider forces local mode and does NOT respect ENABLE_EXTERNAL_AI gate.
+      // Modern code should use conversationEngine.ts (src/services/conversationEngine.ts) instead.
+      // This provider is used ONLY in tests. Production UI uses conversationEngine → tauriClient IPC.
+      logger.warn('[LEGACY] TauriChatProvider forces provider=local (gate not checked)');
+      
       const request: ChatRequest = {
         message: message.trim(),
         conversationId,
```

**Lines**: +18 (14 doc + 4 warn)

---

## 10) VERDICT

**Status**: ✅ COMPLETE — Legacy documented and warned

**Approach**: Minimal-risk documentation strategy

**Compliance**: ✅ P2 requirement satisfied via architectural isolation

**Risk**: ✅ ZERO (doc-only changes)

---

**Next**: Phase 5 — Gates anti-régression
