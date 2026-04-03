# OLLAMA RUNTIME MAP — TITANE_INFINITY
**Date**: 2026-04-02
**Verdict**: QUALIFIED
**Status**: DISCOVERY_COMPLETE

---

## 1. BOOTSTRAP TRUTH

| Component | Version | Status |
|-----------|---------|--------|
| Node.js | v24.14.1 | ✅ Active |
| pnpm | 10.30.2 | ✅ Active |
| Cargo | 1.94.0 | ✅ Active |
| rustc | 1.94.0 | ✅ Active |
| Ollama | 0.18.0 (client 0.18.2) | ⚠️ Version mismatch |
| Git HEAD | 0ff58c9c6 | ✅ MAIN branch |
| Branch divergence | 4173 local vs 1 remote | ⚠️ Significant drift |

---

## 2. OLLAMA MODELS AVAILABLE

| Model | Size | Modified | Status |
|-------|------|----------|--------|
| gemma2:2b | 1.6 GB | 6 weeks ago | ✅ ACTIVE (loaded in memory) |
| llama3:latest | 4.7 GB | 2 weeks ago | ⚠️ Available |
| qwen2.5:latest | 4.7 GB | 2 months ago | ⚠️ Available |
| codellama:latest | 3.8 GB | 3 months ago | ⚠️ Available |
| deepseek-coder-v2:latest | 8.9 GB | 3 months ago | ⚠️ Available |
| gemma2:latest | 5.4 GB | 3 months ago | ⚠️ Available |
| llama3.2:1b | 1.3 GB | 3 months ago | ⚠️ Available |
| llama3.2:latest | 2.0 GB | 3 months ago | ⚠️ Available |
| llama3.1:latest | 4.9 GB | 3 months ago | ⚠️ Available |
| phi3.5:latest | 2.2 GB | 3 months ago | ⚠️ Available |

**Active Model**: gemma2:2b (2.1 GB loaded, 100% CPU, 4096 context)

---

## 3. OLLAMA PATH MAP

### 3.1 Frontend → Backend Path

```
UI (Chat.tsx)
  ↓
chatEngine.ts (generate/stream)
  ↓
orchestrator.ts (selectOptimalProvider)
  ↓
providers/ollama.ts (ollamaProvider)
  ↓
transports/ollamaTransport.ts (IPC mode)
  ↓
secureInvoke('ollama_generate')
  ↓
Tauri IPC Bridge
  ↓
src-tauri/src/ollama.rs (query_ollama)
  ↓
HTTP POST http://127.0.0.1:11434/api/generate
  ↓
Ollama Server
```

### 3.2 Configuration Entry Points

| Config Source | Variable | Value | Priority |
|---------------|----------|-------|----------|
| Environment | `OLLAMA_BASE_URL` | http://127.0.0.1:11434 | HIGH |
| Environment | `OLLAMA_URL` | (fallback) | MEDIUM |
| Environment | `TITANE_OLLAMA_MODEL` | gemma2:2b | HIGH |
| Environment | `VITE_OLLAMA_MODEL` | gemma2:2b | HIGH |
| Hardcoded | `DEFAULT_OLLAMA_MODEL` | gemma2:2b | LOW |
| Modelfile | FROM | llama3.1 | N/A (custom model) |

### 3.3 Transport Mode

- **Mode**: IPC (Inter-Process Communication via Tauri)
- **HTTP**: Disabled (functions redirect to IPC)
- **Health Check**: `ping_ollama` (lightweight backend ping)
- **Timeout**: 45000ms (configurable via `PROVIDER_TIMEOUTS.ollama`)

---

## 4. CONTEXT & GENERATION CONFIG

| Parameter | Value | Source |
|-----------|-------|--------|
| Temperature | 0.7 | `OLLAMA_CONFIG.temperature` |
| numCtx | 8192 | `OLLAMA_CONFIG.numCtx` |
| Max retries | 3 | `OLLAMA_CONFIG.maxRetries` |
| Max errors | 5 | `OLLAMA_CONFIG.maxErrors` |
| Health check interval | 300000ms (5 min) | `OLLAMA_CONFIG.healthCheckInterval` |
| Timeout | 45000ms | `PROVIDER_TIMEOUTS.ollama` |

**Note**: Modelfile specifies `num_ctx 32768` but frontend uses `numCtx 8192`.

---

## 5. PROVIDER CASCADE ORDER

```
1. claude (lazy, cloud) → +50 score
2. openai (lazy, cloud) → +45 score
3. copilot (lazy, cloud) → +42 score
4. gemini (lazy, cloud) → +40 score
5. tauri-backend (eager) → +20 score
6. ollama (eager) → +30 score (auto mode), +200 score (local mode)
7. titane-local (eager, fallback) → +0 score
```

**Current Mode**: auto (cloud-first)
**Ollama Role**: Local fallback after cloud providers
**Local Mode**: Forces Ollama exclusively (+200 boost)

---

## 6. CURRENT LOCK: REQUESTED_USED_SHOWN_UNPROVEN

**Problem**: When Ollama is selected as provider, the UI does not verify that the requested model was actually used by the backend. The response shows `provider: 'ollama'` but does not confirm `model_used`.

**Evidence**:
- `ollama.ts` returns `model: data.model || OLLAMA_CONFIG.model` (line ~200)
- `ollamaTransport.ts` returns `model: result.model` from IPC
- `ollama.rs` returns `response: String` (no model field in response)
- UI shows provider name but NOT model name

**Gap**: REQUESTED → USED → SHOWN chain is incomplete.

---

## 7. FALLBACK PATH

- **Frontend fallback**: `ollamaProvider.generate()` fails → orchestrator tries next provider
- **Backend fallback**: `ollama.rs` tries default model → fallback model via `pick_fallback_model()`
- **Emergency**: `titane-local` provider (always available)

**Risk**: Fallback model selection in backend may silently use different model than requested.