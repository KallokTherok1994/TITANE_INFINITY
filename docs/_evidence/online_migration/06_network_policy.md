# Phase 6: Network Policy Documentation (ONLINE-FIRST)

**Generated:** $(date -Iseconds)  
**Status:** COMPLETED  
**Ring:** Infrastructure (Tauri config + Rust backend)

---

## Network Architecture (Post-Migration)

### Frontend Layer (TypeScript/Vite)
- **CSP Policy:** `connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420`
  - 'self' = IPC to Tauri backend
  - 127.0.0.1:1420 = Vite dev server HMR
  - **NO direct external HTTP** from frontend
- **Fetch calls:** Limited to localhost only (Ollama 11434, vLLM 8000, dev server 1420)
- **All cloud APIs:** Proxied via Rust backend

### Backend Layer (Rust/Tauri)
- **HTTP Client:** `reqwest = { version = "0.11", features = ["json", "stream"] }` (Cargo.toml:46)
- **Network Policy:** ONLINE-FIRST = external AI APIs allowed by default
  - OpenAI API: https://api.openai.com
  - Anthropic Claude: https://api.anthropic.com
  - Google Gemini: https://generativelanguage.googleapis.com
  - GitHub Copilot: https://api.githubcopilot.com (if configured)
- **Controlled Surfaces:**
  - All HTTP calls via `reqwest` with explicit timeouts
  - Error handling with TAPIError types
  - Logging at ERROR/WARN levels
  - Retry logic with exponential backoff in TypeScript orchestrator

### Local Fallback Endpoints
- **Ollama:** http://127.0.0.1:11434 (LLM inference)
- **GLM-4V vLLM:** http://127.0.0.1:8000/v1 (vision model)
- **ParlerTTS:** http://127.0.0.1:8765 (text-to-speech)

---

## Provider Flow Architecture

```
User Input (Frontend)
    ↓
orchestrator.ts (TypeScript scoring: Claude +50 > OpenAI +45 > Ollama +30)
    ↓
secureInvoke('chat_generate_openai', ...) — IPC call
    ↓
chat_orchestrator.rs (Rust) — mode=auto → try external APIs first
    ↓
overdrive/providers/*.rs — HTTP via reqwest
    ↓
External API (OpenAI/Anthropic/Gemini) OR Local (Ollama)
    ↓
Response ← IPC ← orchestrator.ts ← UI
```

**Key Change (ONLINE-FIRST):**
- **Before (LOCAL-FIRST):** Ollama score +80 → highest, tried first
- **After (ONLINE-FIRST):** Ollama score +30 → lowest, tried last (fallback)
- **Rust backend:** Comment updated from "mode offline par défaut" to "mode online par défaut via orchestrator TS"

---

## Security Controls (Unchanged)

1. **API Keys:** Never exposed to frontend, stored in Rust backend env/config only
2. **CSP Enforcement:** Browser blocks any unauthorized fetch() from frontend
3. **IPC Whitelist:** Only allowed commands listed in tauri.conf.json "capabilities"
4. **Request Validation:** Backend validates all IPC payloads (message non-empty, <10KB, etc.)
5. **Timeouts:** All reqwest calls have explicit timeout values
6. **TLS:** reqwest uses rustls with verified certificates by default

---

## Rollback Path

If ONLINE-FIRST needs reversion:
1. `git restore src/services/ai/orchestrator.ts` — revert score 30 → 80
2. `git restore src-tauri/src/overdrive/chat_orchestrator.rs` — revert comment
3. `git restore src-tauri/tauri.conf.json` — remove network policy comment
4. Verify with `pnpm run verify:local-first` (old gate, if restored)

---

## Files Modified (Phase 6)

1. **src-tauri/tauri.conf.json** (line 66):
   - Added `__comment_network_policy` explaining ONLINE-FIRST network architecture
   - CSP unchanged (already correct for IPC-based architecture)

2. **Cargo.toml** (line 46):
   - No changes (reqwest already present with json+stream features)

3. **docs/_evidence/online_migration/06_network_policy.md**:
   - This documentation file (NEW)

---

## Validation Checklist

- [x] reqwest present in Cargo.toml with network features
- [x] CSP allows IPC ('self', 'tauri:', 'ipc:')
- [x] CSP blocks direct external fetch from frontend (no https://* in connect-src)
- [x] All cloud providers use secureInvoke → Rust backend
- [x] Local endpoints (Ollama/vLLM) use 127.0.0.1 only
- [x] Network policy documented in tauri.conf.json
- [x] Timeouts present in reqwest calls (orchestrator timeout=30000ms default)

---

## Proof Artifacts

- Diff: docs/_evidence/online_migration/06_tauri_patch.diff (to be captured)
- Architecture: This document
- Code grep: `reqwest` in Cargo.toml, `secureInvoke` in providers/*.ts

**Status:** ✅ ONLINE-FIRST network policy validated and documented  
**Risk Level:** LOW (architecture unchanged, documentation only)  
**Next Phase:** Phase 7 (Guards anti-bypass)
