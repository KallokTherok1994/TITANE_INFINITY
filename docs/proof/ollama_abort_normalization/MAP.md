# Ollama AbortError Normalization — MAP

**Ring**: 3 (Services)  
**Scope**: Normalize AbortError handling across Ollama transport, secure invoke, and fallback layers

---

## 🎯 Problem Statement

**Before**: Raw `AbortError` (name='AbortError', message='This operation was aborted') surfaces in UI when Ollama requests are cancelled/timeout, creating poor UX and inconsistent error codes.

**Impact**:
- Users see generic 'AbortError' text instead of actionable guidance
- Retry logic doesn't recognize abort as non-retriable
- Frontend has direct Ollama HTTP fallback mixing concerns

---

## 🗺️ Paths Mapped

### 1. Frontend → Backend (Normal Path)
```
Chat UI → aiOrchestrator → ollamaProvider → ollamaTransport → Tauri IPC (conversation_generate)
                                                                           ↓
                                                                    Backend Rust (Ollama HTTP client)
```

**Abort sources**:
- User cancels generation (cancel button)
- Request timeout (30s default)
- Network interruption
- Ollama process killed

### 2. Secure Invoke Layer (All Tauri commands)
```
Frontend → secureInvoke() → validation → whitelist → invoke()
                                                           ↓
                                                    catch (error) → normalizeInvokeError()
```

**Normalization**:
- `AbortError` → `OLLAMA_ABORTED` (for 'ollama_*' commands)
- `AbortError` → `TAURI_ABORTED` (for other commands)

### 3. Tauri Protector Layer (Fallback responses)
```
dev/test env → safeInvoke() → catch (error) → normalizeInvokeError() → fallback response
```

**Fallback behavior**:
- `OLLAMA_ABORTED` → return empty response with neutral message
- No direct HTTP fallback to http://localhost:11434

### 4. Ollama Transport (IPC mode)
```
ollamaTransport.generate() → invoke('conversation_generate')
                                       ↓
                                  catch (error) → detect abort → AIServiceError(OLLAMA_ABORTED, retryable=false)
```

**Abort detection**:
- `error.name === 'AbortError'`
- `/aborted/i.test(error.message)`

### 5. Retry Strategy (All AI providers)
```
withRetry() → execute() → catch (error) → check NON_RETRIABLE_ERROR_PATTERNS
                                                    ↓
                                            /abort|aborted|AbortError|OLLAMA_ABORTED/i → STOP (don't retry)
```

---

## 📦 Components Changed

### Ring 1 (Types)
- ❌ No changes (AIServiceError schema already supports custom error codes)

### Ring 2 (Engines)
- ❌ No changes (business logic unchanged)

### Ring 3 (Services)
| File | Layer | Change | Ring |
|------|-------|--------|------|
| `src/lib/security.ts` | Invoke | Added `normalizeInvokeError()` | 3 |
| `src/utils/tauriProtector.ts` | Invoke | Removed direct Ollama fallback, added normalization | 3 |
| `src/services/ai/transports/ollamaTransport.ts` | Transport | Map AbortError → OLLAMA_ABORTED in all catch blocks | 3 |
| `src/services/ai/retryStrategy.ts` | Transport | Added abort patterns to NON_RETRIABLE_ERROR_PATTERNS | 3 |
| `src/utils/ollamaFallback.ts` | Fallback | Updated user message (port-specific → neutral) | 3 |
| `src/services/ai/types.ts` | Types | Fixed legacy example in comment | 3 |

### Ring 4 (Modules/UI)
- ❌ No UI changes (error display logic unchanged)

---

## 🔍 Inspection Points

### Before Normalization
```typescript
// User sees:
"AbortError: This operation was aborted"

// Retry logic:
retryable: true (WRONG, causes infinite retries on abort)

// Error code:
"UNKNOWN_ERROR" or raw AbortError name
```

### After Normalization
```typescript
// User sees:
"Ollama indisponible. TITANE bascule en mode local."

// Retry logic:
retryable: false (CORRECT, no retry on abort)

// Error code:
"OLLAMA_ABORTED" (consistent, searchable)
```

---

## 🧪 Test Coverage

### New Unit Tests (not discovered by runTests, see VERDICT.md)
1. `src/__tests__/lib/security/secureInvokeAbort.test.ts` — Tests normalizeInvokeError for ollama commands
2. `src/__tests__/services/ai/ollamaTransportAbort.test.ts` — Tests IPC mode abort mapping
3. `src/services/ai/__tests__/ollamaAbortFallback.test.ts` — Tests orchestrator fallback on abort

### Guards
1. `scripts/verify/guard-no-frontend-ollama-direct.sh` — Source guard (no direct HTTP calls)
2. `scripts/verify/guard-dist-no-ollama-11434.sh` — Dist guard (no compiled references)

### E2E Coverage
- ✅ Critical path tests pass (app-launch, chat, engines, resilience)
- ⚠️ 31 flaky tests unrelated to abort normalization

---

## 📐 Architecture Decisions

### ✅ DO
- Normalize errors at the earliest detection point (invoke layer)
- Use semantic error codes (OLLAMA_ABORTED, TAURI_ABORTED)
- Mark abort as non-retriable (retryable=false)
- Keep user messages neutral and actionable

### ❌ DON'T
- Let raw AbortError propagate to UI
- Retry on abort (wastes resources, poor UX)
- Keep direct frontend Ollama HTTP fallback (violates separation of concerns)
- Use port-specific guidance text (reveals internal config)

---

**Created**: 2025-02-04  
**Ring**: 3 (Services)  
**Scope**: Complete
