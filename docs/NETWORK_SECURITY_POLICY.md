# TITANE∞ v27.5.0 — Network Security Policy

**Status:** ONLINE-FIRST Governed  
**Updated:** 2026-02-18  
**Location:** `src-tauri/tauri.conf.json` security settings  
**Governance:** Stop-the-line gates (verify:online-first + verify:network-guard)

---

## Network Architecture

### Frontend (TypeScript/Vite)

**CSP Policy:**
```
connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420
```

- `'self'` = IPC to Tauri backend only
- `127.0.0.1:1420` = Vite dev server HMR (development only)
- **NO direct external HTTP** from frontend (enforced by CSP)

**Allowed Local Fetch:**
- Ollama: http://127.0.0.1:11434 (LLM inference)
- GLM-4V vLLM: http://127.0.0.1:8000/v1 (vision model)
- ParlerTTS: http://127.0.0.1:8765 (text-to-speech)

**Cloud APIs:** All proxied via Rust backend `secureInvoke()` IPC

---

### Backend (Rust/Tauri)

**HTTP Client:** `reqwest 0.11` (Cargo.toml:46)

**External APIs Allowed (ONLINE-FIRST):**
- OpenAI API: https://api.openai.com
- Anthropic Claude: https://api.anthropic.com
- Google Gemini: https://generativelanguage.googleapis.com
- GitHub Copilot: https://api.githubcopilot.com

**Security Controls:**
- API keys never exposed to frontend (stored in backend only)
- All reqwest calls have explicit timeouts
- Error handling with `TAPIError` types
- Logging at ERROR/WARN levels
- Retry logic with exponential backoff (TypeScript orchestrator)
- TLS verification enabled by default (rustls)

---

## Provider Call Flow

```
User Input (Frontend)
    ↓ IPC
orchestrator.ts (Scoring: Claude +50 > OpenAI +45 > Gemini +40 > Ollama +30)
    ↓ secureInvoke('chat_generate_*', ...)
chat_orchestrator.rs (mode=auto → try clouds first, fallback to Ollama)
    ↓ reqwest HTTP
External API (OpenAI/Anthropic/Gemini) OR Local (Ollama)
    ↓
Response ← IPC ← UI
```

---

## Enforcement

**Gates (run on every commit):**
1. `verify:online-first` — Doctrine compliance (4 checks)
2. `verify:network-guard` — Anti-bypass (5 checks G1-G5)

**Whitelist Files (frontend fetch allowed):**
- src/services/ai/transports/ollamaTransport.ts
- src/services/ai/providers/glm46v.ts
- src/services/tts/parlerTTSBridge.ts
- src/utils/ollamaFallback.ts
- src/core/http/httpClient.ts (tauri-plugin-http wrapper)

**Blacklist:** Any direct fetch() to external HTTPS APIs (must use secureInvoke)

---

## Rollback

If ONLINE-FIRST needs reversion:
```bash
git restore .github/ README.md package.json src/ src-tauri/ scripts/
rm scripts/verify/enforce-online-first.sh scripts/guards/guard-network-policy.sh
```

See: docs/_evidence/online_migration/FINAL_VERDICT.md for complete rollback procedure.
