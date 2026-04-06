# 11_VERDICT_PROVIDER_LOCK

## PROVIDER LOCK #1 — VERDICT

### REAL_STATE (before LOCK1-REPAIR)

- `sendMessage` in `chat.ts` read `backendResponse.metadata?.provider` for `ChatResponse.provider`
- `backendResponse.metadata` in `conversation_generate` OMEGA format contains cognitive fields only — no `provider` field
- Result: `chatServiceResponse.provider` = `'tauri-backend'` always
- `chatServiceResponse.metadata.provider_used` = not set
- LOCK1 badge in `MessageBubble` showed `'tauri-backend'` always
- Real truth (`backendResponse.meta.provider_used`) was silently dropped at R3 boundary

### PATCH_APPLIED

**File:** `src/services/api/chat.ts` — `sendMessage()` return block  
**Symbol:** OMEGA direct format response construction  
**Lines added:** +12  
**Reason:** Read `backendResponse.meta.provider_used` as canonical truth source

```typescript
// BEFORE (broken):
provider: backendResponse.metadata?.provider || 'tauri-backend',
// metadata spread without provider_used

// AFTER (repaired):
const metaObj = backendResponse.meta as Record<string, unknown> | undefined;
const actualProvider: string =
  (typeof metaObj?.provider_used === 'string' && metaObj.provider_used) ||
  (typeof backendResponse.metadata?.provider === 'string' && backendResponse.metadata.provider) ||
  'tauri-backend';
// provider: actualProvider
// metadata.provider_used: actualProvider
// metadata.provider_meta: backendResponse.meta
```

**File:** `src/services/api/chat.test.ts`  
**Lines added:** +120  
**Reason:** Runtime proof tests RP1–RP4

### PROOFS

```
Command: pnpm exec vitest run src/services/api/chat.test.ts
x3 runs: 5/5 PASS × 3 = 15/15 total

RP1: preferred=ollama, meta.provider_used=gemini → response.provider=gemini ✅
RP2: meta.provider_used=ollama → response.provider=ollama ✅
RP3: no meta → response.provider=tauri-backend (no invention) ✅
RP4: CRITICAL preferred=ollama, backend used gemini → metadata.provider_used=gemini ✅
```

**tsc --noEmit:** 0 errors  
**detect_recurrence:** PASS (entries=451)  
**verify_instructions:** PASS=20/0

### GATES

| Gate | Result |
|------|--------|
| G_BOOT_TRUTH | PASS |
| G_SOURCE_OF_TRUTH_CLARIFIED | PASS |
| G_UI_RUNTIME_CHAIN_TRUTH | PASS |
| G_NO_LYING_UI | PASS |
| G_PROVIDER_ROUTER_TRUTH | PASS |
| G_TESTS_X3 | PASS |
| G_ROLLBACK_READY | PASS |

### STATUS

**PASS** (PROVEN_RUNTIME — 4 runtime tests including critical mismatch scenario)

### NEXT_LOCK

LOCK #1 is now closed (PROVEN_RUNTIME). Remaining deferred work:
- LOCK4: MEMORY_STATE_SYNC (P1)
- LOCK5: CHAT_MODE_STORE_ISOLATION (P2)
- G4: Multi-turn certification (PARTIAL)
