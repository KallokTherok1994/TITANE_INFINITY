# CSP Patch — Ollama Local Access (E2E)

**Date:** 2026-02-08  
**File:** `src-tauri/tauri.conf.json`  
**Line:** 66  
**Scope:** Build/E2E uniquement (dev mode CSP=null déjà permissif)

---

## Patch Exact (GATE_1 Compliance)

### BEFORE (Current — BLOCKING)

```json
"security": {
  "csp": "default-src 'self' tauri: asset:; script-src 'self' 'unsafe-eval' 'unsafe-inline' asset: tauri:; style-src 'self' 'unsafe-inline' asset: tauri:; img-src 'self' asset: data: blob: https:; font-src 'self' asset: data:; connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420; media-src 'self' asset: blob: mediastream:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
```

### AFTER (Fixed — UNBLOCKING)

```json
"security": {
  "csp": "default-src 'self' tauri: asset:; script-src 'self' 'unsafe-eval' 'unsafe-inline' asset: tauri:; style-src 'self' 'unsafe-inline' asset: tauri:; img-src 'self' asset: data: blob: https:; font-src 'self' asset: data:; connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420 http://127.0.0.1:11434; media-src 'self' asset: blob: mediastream:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
```

---

## Diff Isolé (connect-src only)

```diff
- connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420;
+ connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420 http://127.0.0.1:11434;
```

**Single Addition:** `http://127.0.0.1:11434`

---

## Justification

**Endpoint:** Ollama local inference server  
**Protocol:** HTTP (localhost, non-encrypted OK for local)  
**Port:** 11434 (Ollama default)  
**Scope:** Local machine only (`127.0.0.1`)

**Alternatives Considered:**

| Option | Rejected? | Reason |
|--------|-----------|--------|
| `http://localhost:11434` | ❌ Keep | Browser alias for 127.0.0.1 |
| `http:` wildcard | ✅ Rejected | Too permissive |
| `http://127.0.0.1:*` | ✅ Rejected | Port wildcard unsafe |
| `http://*:11434` | ✅ Rejected | Host wildcard unsafe |

**Chosen:** Explicit `http://127.0.0.1:11434` — minimal, auditable, secure.

---

## GATE_1 Validation

**Checklist:**
- ✅ No wildcard `http:`
- ✅ No `*` in CSP
- ✅ No external domains added
- ✅ No other changes to CSP
- ✅ Only localhost endpoint added
- ✅ Port explicit (not wildcarded)
- ✅ Minimal scope expansion

**GATE_1:** ✅ PASS — CSP reste restrictive, ajout strictement minimal.

---

## Rollback Procedure

If CSP causes issues, revert line 66 to:

```json
"csp": "default-src 'self' tauri: asset:; script-src 'self' 'unsafe-eval' 'unsafe-inline' asset: tauri:; style-src 'self' 'unsafe-inline' asset: tauri:; img-src 'self' asset: data: blob: https:; font-src 'self' asset: data:; connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420; media-src 'self' asset: blob: mediastream:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
```

**Rebuild Required:** Yes (CSP compiled into binary)

---

## Impact Assessment

**Security:** ✅ MINIMAL  
- Already allowing `http://127.0.0.1:1420`
- New endpoint follows same pattern
- No external access granted

**Functionality:** ✅ CRITICAL  
- Unlocks E2E AI certification tests
- Allows Ollama communication from Tauri WebView
- Enables FULL_UI qualification

**Breaking Changes:** ❌ NONE  
- Dev mode unaffected (CSP=null)
- Production runtime unchanged (uses same CSP)
- No frontend/backend code changes

---

**Status:** ✅ Applied to source (requires rebuild to activate)  
**Next:** GATE_2 — Authorization gate for build
