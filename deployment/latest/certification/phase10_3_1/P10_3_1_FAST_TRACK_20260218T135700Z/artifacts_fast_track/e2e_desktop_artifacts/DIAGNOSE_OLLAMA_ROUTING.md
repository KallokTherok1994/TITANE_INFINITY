# DIAGNOSE — Ollama Routing (Proxy Bypass)

**Date:** 2026-02-09  
**Protocol:** Ω.E2E.AUTO.UNBLOCK+SEAL.OLLAMA_PROXY v2.0

---

## 1) Code Evidence (Frontend Routing)

**File:** `src/services/ai/providers/ollama.ts`  
**Observed logic:**
```ts
const isDevelopment = import.meta.env.DEV;
const OLLAMA_BASE_URL = isDevelopment
  ? '/api/ollama'
  : typeof runtimeConfig.ollamaUrl === 'string' &&
      runtimeConfig.ollamaUrl.trim().length > 0
    ? runtimeConfig.ollamaUrl.trim()
    : 'http://127.0.0.1:11434';
```

**Finding:** In production/E2E builds (`import.meta.env.DEV === false`), the frontend attempts a **direct** call to `http://127.0.0.1:11434` instead of the proxy `/api/ollama`.

---

## 2) Log Evidence (Fetch Aborted)

**File:** `reports/e2e-desktop/GATE_4_FAIL_ANALYSIS.md`  
**Excerpt:**
```
Erreur lors de l'appel à Ollama : Fetch is aborted.
Vérifiez qu'Ollama est actif sur http://127.0.0.1:11434
```

**Finding:** The frontend fetch is **aborted** when targeting `http://127.0.0.1:11434` in E2E/production mode.

---

## 3) Proxy Evidence (Backend OK)

**Observed in E2E logs (previous run):**
```
🔵 Proxying: GET /api/ollama/tags → /api/ollama/tags
```

**Finding:** The Tauri backend proxy is working; the frontend simply **does not use it** in production/E2E.

---

## Root Cause (Proved)

**Cause:** Frontend routing uses a direct Ollama URL in production/E2E and bypasses the proxy.  
**Impact:** Requests are blocked/aborted in the WebView context, causing E2E failures.

---

## GATE_D

**Status:** ✅ PASS — Proxy-bypass cause proven with code + logs.
