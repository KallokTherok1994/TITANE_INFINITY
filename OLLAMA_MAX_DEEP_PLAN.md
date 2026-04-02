# OLLAMA_MAX DEEP PLAN — TITANE_INFINITY
**Date**: 2026-04-02
**Lock**: REQUESTED_USED_SHOWN_UNPROVEN
**Phase**: ACT — One Lock Implementation

---

## REAL STATE

Ollama is operational with gemma2:2b loaded. The full path from UI to Ollama HTTP API is proven. The gap is that when a request is made for a specific model, the response does not confirm which model actually produced the output.

## CURRENT REAL LOCK

**REQUESTED_USED_SHOWN_UNPROVEN**

The chain `REQUESTED → USED → SHOWN` is broken at the backend level. The `ollama.rs` function `query_ollama()` returns only `Result<String, String>` — the model name that actually responded is not propagated back through the IPC bridge.

## WHY THIS LOCK FIRST

1. **Foundation**: Without proving model identity, all downstream optimizations (context, metrics, structured outputs) are built on unverified assumptions
2. **Minimal scope**: Only 4 files touched, no architectural changes
3. **Immediate value**: Users can trust that their model selection is honored
4. **Rollback simplicity**: Add one field, propagate, display — reversible in 2 minutes

---

## FILES LIKELY TOUCHED

| File | Change | Risk |
|------|--------|------|
| `src-tauri/src/ollama.rs` | Add `model` field to response struct, return actual model used | LOW |
| `src/services/ai/transports/ollamaTransport.ts` | Propagate `model` from IPC result | LOW |
| `src/services/ai/providers/ollama.ts` | Verify model matches request, log mismatch | LOW |
| `src/ui/pages/Chat.tsx` | Display `model_used` in response metadata | LOW |

---

## PATCH PLAN

### Step 1: Backend (ollama.rs)

Current signature:
```rust
pub async fn query_ollama(prompt: String) -> Result<String, String>
```

Change to return model info:
```rust
pub struct OllamaResult {
    pub response: String,
    pub model: String,
}

pub async fn query_ollama(prompt: String) -> Result<OllamaResult, String>
```

Update `send_generate()` to return model:
```rust
async fn send_generate(client: &Client, model: &str, prompt: &str) 
    -> Result<(String, String), (StatusCode, String)> {
    // ... existing code ...
    Ok((parsed.response, model.to_string()))
}
```

Update `query_ollama()` to return struct:
```rust
let (response, used_model) = send_generate(...).await?;
Ok(OllamaResult { response, model: used_model })
```

### Step 2: Transport (ollamaTransport.ts)

Current:
```typescript
return {
  content: result.content,
  model: result.model,  // May be undefined
  latency_ms: result.latency_ms,
};
```

Change: Ensure IPC result includes model field from backend.

### Step 3: Provider (ollama.ts)

Current:
```typescript
model: data.model || OLLAMA_CONFIG.model,
```

Change: Add mismatch detection:
```typescript
const actualModel = data.model || OLLAMA_CONFIG.model;
if (actualModel !== OLLAMA_CONFIG.model) {
  logger.info(`Model fallback: requested ${OLLAMA_CONFIG.model}, used ${actualModel}`);
}
```

### Step 4: UI (Chat.tsx)

Add model display in response metadata:
```typescript
metadata: {
  provider: response.provider,
  model_used: response.model,
  fallback_used: response.model !== requestedModel,
}
```

---

## PROOFS MISSING

- [ ] Backend returns actual model name in response
- [ ] Transport propagates model through IPC
- [ ] Provider detects and logs model mismatch
- [ ] UI displays model_used field
- [ ] Metrics capture: model_used, fallback_used, total_duration, eval_count

---

## NEXT ACTION <=30 min

1. Patch `ollama.rs` to return model in response struct
2. Update IPC handler to include model field
3. Test with `cargo check` and `cargo test`
4. Verify metrics propagation through transport