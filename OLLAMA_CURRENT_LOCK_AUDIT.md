# OLLAMA CURRENT LOCK AUDIT — TITANE_INFINITY
**Date**: 2026-04-02
**Phase**: ACT — One Lock Implementation

---

## LOCK SELECTION: REQUESTED_USED_SHOWN_UNPROVEN

### Why This Lock First

1. **Impact**: Without proving REQUESTED → USED → SHOWN, no other Ollama optimization can be trusted
2. **Scope**: Minimal — touches only response metadata propagation
3. **Risk**: P1 — affects user trust in provider/model selection
4. **Rollback**: Simple — add one field to IPC response, propagate to UI

### Current State Analysis

#### Chain Breakpoint #1: Backend (ollama.rs)
```rust
// Current: Returns only response text, no model confirmation
pub async fn query_ollama(prompt: String) -> Result<String, String>
// Problem: When fallback model is used, caller doesn't know which model responded
```

#### Chain Breakpoint #2: Transport (ollamaTransport.ts)
```typescript
// Current: Returns model from IPC result, but ollama.rs doesn't provide it
return {
  content: result.content,
  model: result.model,  // ← This is undefined from backend
  latency_ms: result.latency_ms,
};
```

#### Chain Breakpoint #3: Provider (ollama.ts)
```typescript
// Current: Falls back to config model if backend doesn't provide model
return {
  content,
  model: data.model || OLLAMA_CONFIG.model,  // ← May be wrong if fallback occurred
  ...
};
```

#### Chain Breakpoint #4: UI (Chat.tsx)
```typescript
// Current: Shows provider name but NOT model name
metadata: { provider: response.provider }
// Missing: model_used field
```

### Required Changes (Minimal Patch)

1. **ollama.rs**: Add `model` field to response struct
2. **ollamaTransport.ts**: Propagate model from IPC result
3. **ollama.ts**: Verify model matches request, log mismatch
4. **Chat.tsx**: Display model name in response metadata

### Proof Required

- [ ] Request model X → Backend uses model X → UI shows model X
- [ ] Request model X (not available) → Backend falls back to model Y → UI shows model Y with fallback flag
- [ ] Metrics captured: model_used, fallback_used, total_duration, eval_count

---

## OTHER LOCKS (NOT SELECTED)

| Lock | Status | Reason |
|------|--------|--------|
| CONTEXT_POLICY_UNCLEAR | HOLD | numCtx 8192 vs Modelfile 32768 mismatch, but not blocking |
| PRELOAD_KEEPALIVE_UNPROVEN | HOLD | No preload/keep_alive logic exists |
| STRUCTURED_OUTPUTS_UNPROVEN | HOLD | Not implemented, not blocking |
| TOOLS_PATH_UNPROVEN | HOLD | Not implemented, not blocking |
| EMBEDDINGS_PATH_UNPROVEN | HOLD | Not implemented, not blocking |
| VISION_PATH_UNPROVEN | HOLD | Not implemented, not blocking |
| METRICS_NOT_CAPTURED | PARTIAL | Some metrics exist, missing model_used tracking |
| FALLBACK_MASKING_RISK | RELATED | Addressed by REQUESTED_USED_SHOWN_UNPROVEN fix |