# PATCH — Ollama Proxy Routing (Frontend)

**Date:** 2026-02-09  
**File:** `src/services/ai/providers/ollama.ts`  
**Scope:** Minimal routing fix (<= 15 lines modified)

---

## Before

```ts
const isDevelopment = import.meta.env.DEV;
const OLLAMA_BASE_URL = isDevelopment
  ? '/api/ollama'
  : typeof runtimeConfig.ollamaUrl === 'string' &&
      runtimeConfig.ollamaUrl.trim().length > 0
    ? runtimeConfig.ollamaUrl.trim()
    : 'http://127.0.0.1:11434';

const getOllamaURL = (endpoint: string): string => {
  return isDevelopment
    ? `${OLLAMA_BASE_URL}${endpoint}`
    : `${OLLAMA_BASE_URL}/api${endpoint}`;
};
```

---

## After

```ts
const OLLAMA_API_BASE = '/api/ollama';
const OLLAMA_BASE_URL = OLLAMA_API_BASE;

const getOllamaURL = (endpoint: string): string => {
  return `${OLLAMA_API_BASE}${endpoint}`;
};
```

---

## Change Summary

- **Lines modified:** 10 (within limit)
- **Behavior:** Always route frontend calls through `/api/ollama` proxy
- **No direct HTTP:** Removed `http://127.0.0.1:11434` usage entirely

---

## Justification

- **Dev:** Vite proxy handles `/api/ollama`
- **Prod/E2E:** Tauri backend proxy handles `/api/ollama`
- **Security:** No direct WebView access to local service
- **Reliability:** Avoids CSP/CORS/permission issues

---

**GATE_P:** ✅ PASS — Minimal patch, <= 15 lines, routing fixed
