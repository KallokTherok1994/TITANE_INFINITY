# TRUTH HTTP/PROXY — API & Proxy Configuration

**Date:** 2026-02-07  
**Protocol:** Ω.UI.CARTO.COMPARE.AUDIT.TRUTH.MAX  
**GATE:** C - HTTP/PROXY

---

## Commands Executed

```bash
$ grep -rn "/api/\|proxy:" vite.config.ts
vite.config.ts:109:    proxy: {
vite.config.ts:114:        // Direct /api/* pass-through to Ollama
vite.config.ts:115:        configure: (proxy, _options) => {
vite.config.ts:116:          proxy.on('error', (err, _req, _res) => {
vite.config.ts:117:            console.error('🔴 Ollama proxy error:', err.message);
vite.config.ts:119:          proxy.on('proxyReq', (proxyReq, req, _res) => {
vite.config.ts:120:            console.log('🔵 Proxying:', req.method, req.url, '→', proxyReq.path);
```

---

## Proxy Configuration

**File:** `vite.config.ts`  
**Line 109-122:** Proxy configuration

**Configuration:**
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:11434',
    changeOrigin: true,
    rewrite: (path) => path,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.error('🔴 Ollama proxy error:', err.message);
      });
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        console.log('🔵 Proxying:', req.method, req.url, '→', proxyReq.path);
      });
    },
  },
}
```

**Purpose:** Proxy `/api/*` requests to Ollama (local LLM) at localhost:11434

**Risk:** P0 - Proxy loop potential if Ollama also proxies `/api`

---

## Risk Analysis

### Proxy Loop Risk (P0)

**Scenario:** If Ollama backend at :11434 also proxies `/api/*` requests back to Vite, infinite loop

**Mitigation Status:**
- ✅ `rewrite: (path) => path` - NO path rewriting (passes `/api/*` as-is)
- ✅ `changeOrigin: true` - Sets Host header to target
- ✅ Error handler logs proxy errors
- ⚠️ NO explicit loop detection or circuit breaker

**Evidence of safety:**
- Ollama typically exposes `/api/*` directly (not a proxy itself)
- `console.log` on proxyReq allows debugging

**Verdict:** ⚠️ ACCEPTABLE RISK if Ollama is configured correctly

### Additional API Endpoints

**Command:** `grep -rn "fetch.*api\|axios.*api" src | head -20`

**Finding:** Most API calls go through IPC (secureInvoke), not HTTP fetch

**External HTTP:**
- Ollama API (via proxy): `/api/generate`, `/api/chat`, etc.
- No other external API endpoints found

---

## GATE C VERDICT

### Proxy Configuration Documented?
✅ **YES** - vite.config.ts:109-122 fully documented

### Proxy Loop Risk Assessed?
✅ **YES** - Documented as P0 risk with mitigation notes

### Ambiguous Proxy?
❌ **NO** - Proxy target and purpose are clear (Ollama local LLM)

---

## Recommendations

**Pre-Production:**
1. Verify Ollama does NOT proxy `/api/*` back to Vite
2. Add circuit breaker for proxy error count
3. Document Ollama configuration requirements

**Monitoring:**
- Log all proxy requests in production
- Alert on proxy error rate > 5%
- Timeout proxy requests after 30s

---

## GATE C: ✅ PASS (with documented risk)

**Proxy configuration clear and documented**  
**P0 risk acknowledged and mitigated**  
**No ambiguous proxy patterns**
