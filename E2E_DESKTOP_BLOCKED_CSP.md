# E2E Desktop Tests — BLOCKED BY CSP (Ollama)

**Date:** 2026-02-08  
**Status:** ⚠️ BLOCKED — Requires Tauri Rebuild with CSP Fix

## Executive Summary

Les tests E2E desktop (`pnpm run e2e:desktop`) passent **5/5 tests** d'un point de vue WebDriver (aucune exception levée), mais échouent la validation finale (`after` hook) car **aucun prompt n'obtient de réponse valide** après Q1.

**Root Cause:** Content Security Policy (CSP) de Tauri bloque les connexions fetch à `http://127.0.0.1:11434` (Ollama).

**Impact:** Les tests de certification AI TITANE∞ ne peuvent pas être validés en mode E2E desktop, bloquant la qualification FULL_UI.

---

## Technical Analysis

### Test Results (Latest Run: 2026-02-08T19:21:18)

| Test Scenario | WebDriver Status | Semantic Validation | Blocker |
|--------------|------------------|---------------------|---------|
| boot-smoke | ✅ PASS | ✅ PASS | - |
| always respond (20 prompts) | ✅ PASS | ❌ FAIL | Q1 error, Q2-Q20 timeout |
| offline autonomy (5 prompts) | ✅ PASS | ❌ FAIL | All timeout |
| ui matrix (5 pages) | ✅ PASS | ❌ INCOMPLETE | Partial data |
| memory + metacognition | ✅ PASS | ❌ FAIL | No responses |
| error handling (3 scenarios) | ✅ PASS | ❌ INCOMPLETE | Partial data |
| **after all** hook | ❌ FAIL | ❌ FAIL | Validation logic |

**Final Error:**
```
AUTO_UI_FULL blocked: MEMORY_METACOG_INCOMPLETE, ALWAYS_RESPOND, OFFLINE, MEMORY_METACOG
```

### Ollama Connectivity

**Ollama Service:** ✅ Running (PID 2311)  
**Direct curl test:** ✅ Success (`http://127.0.0.1:11434/api/tags` returns models)  
**Tauri E2E fetch:** ❌ Blocked by CSP  

**Error Message:**
```
A1: Erreur lors de l'appel à Ollama : Fetch is aborted. Vérifiez qu'Ollama est actif sur http://127.0.0.1:11434
```

This is NOT a network error — it's a **CSP violation** causing fetch to abort before reaching Ollama.

### CSP Configuration

**File:** `src-tauri/tauri.conf.json`  
**Line:** 66  

**Current `connect-src`:**
```
connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420
```

**Missing:** `http://127.0.0.1:11434` (Ollama endpoint)

**Fixed `connect-src` (already applied to source):**
```
connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420 http://127.0.0.1:11434
```

---

## Solution

### 1. CSP Fix Applied ✅

[src-tauri/tauri.conf.json](src-tauri/tauri.conf.json#L66) has been updated to include `http://127.0.0.1:11434` in `connect-src`.

### 2. Rebuild Required ⚠️

CSP configuration is **compiled into Tauri binary**, so changes require rebuild:

```bash
# Option A: Full build (production)
pnpm run build:tauri  # ❌ BLOCKED BY CRITICAL RULE (no build without authorization)

# Option B: Dev mode (no CSP enforcement)
pnpm run dev:tauri    # ✅ Works but E2E tests require binary
```

### 3. Authorization Request

**Request to Kevin Thibault:**
> Autorisation de builder Tauri (`pnpm run build:tauri`) pour intégrer la correction CSP et permettre les tests E2E desktop de se connecter à Ollama.
>
> **Justification:**
> - E2E tests passent techniquement (5/5 WebDriver) mais échouent sémantiquement (0 réponses AI valides)
> - CSP bloque Ollama malgré que le service tourne
> - Fix CSP appliqué au source, mais nécessite recompilation
> - Aucun déploiement prévu — build uniquement pour tests E2E locaux

**Alternative:**
Si build interdit, considérer :
- Mode dev E2E (si faisable avec `tauri-driver`)
- Mock Ollama avec proxy local autorisé par CSP
- Skip E2E desktop tests, valider uniquement tests unitaires

---

## Validation After Rebuild

Une fois rebuild autorisé et exécuté :

```bash
# 1. Cleanup previous test artifacts
pkill -f "tauri-driver" || true
pkill -f "WebKitWebDriver" || true
rm -f /tmp/e2e_desktop_run.log

# 2. Run E2E tests
pnpm run e2e:desktop > /tmp/e2e_desktop_run.log 2>&1

# 3. Check results
tail -n 80 /tmp/e2e_desktop_run.log
tail -n 50 reports/titane-ai-cert/auto-ui/mode-full/ALWAYS_RESPOND.md
```

**Expected Outcome:**
- Q1-Q20 all receive valid AI responses
- Verdict: PASS in ALWAYS_RESPOND.md
- `after` hook status: READY_FOR_QUALIFY

---

## Risk Assessment

**Security Impact:** ✅ LOW  
- CSP already allows `http://127.0.0.1:1420` (Tauri dev server)
- Adding `11434` (Ollama) follows same localhost pattern
- No external endpoints added

**Breaking Change:** ❌ NO  
- CSP change only affects production builds
- Dev mode already has CSP disabled (`"csp": null`)
- No frontend/backend code changes required

**Deployment Impact:** ⚠️ MEDIUM  
- Requires rebuild to apply CSP fix
- Existing AppImage/DEB builds will NOT include fix
- Need new build after CSP update

---

## Recommendations

1. **Immediate:** Get authorization for `pnpm run build:tauri` to validate CSP fix
2. **Short-term:** Integrate CSP fix into next stable release build
3. **Long-term:** Document Ollama CSP requirement in deployment checklist
4. **Testing:** Add CSP validation to pre-E2E smoke tests

---

## Files Modified

- ✅ [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json#L66) — CSP `connect-src` updated
- 📝 [e2e/desktop/ai-verification.full.e2e.js](e2e/desktop/ai-verification.full.e2e.js) — Session handling + JS execution (previously applied)

---

## Next Steps

1. **Wait for authorization** to build Tauri with CSP fix
2. **Execute build:** `pnpm run build:tauri` (if authorized)
3. **Re-run E2E tests:** `pnpm run e2e:desktop`
4. **Validate certification:** Check ALWAYS_RESPOND.md for PASS verdict
5. **Update governance:** Document CSP requirement in deployment docs

---

**Contact:** @kevinthibault (authorization required)  
**Priority:** 🔴 HIGH — Blocks AI certification FULL_UI qualification
