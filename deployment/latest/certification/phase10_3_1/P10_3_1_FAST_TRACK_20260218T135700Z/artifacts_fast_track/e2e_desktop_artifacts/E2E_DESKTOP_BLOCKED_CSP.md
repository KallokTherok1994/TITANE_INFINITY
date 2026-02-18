# E2E Desktop Tests — BLOCKED BY CSP (Ollama)

**Date:** 2026-02-08  
**Status:** ⚠️ BLOCKED → ✅ FIX IN PROGRESS (GATED)  
**Gate Protocol:** Ω.E2E.DESKTOP.CSP.UNBLOCK+GATED_BUILD+PROOF v1.0

---

## 0) ÉTAT & CAUSE (GATE_0)

### Symptôme Observé

**Test Run:** 2026-02-08T19:21:18.987Z  
**Test Status:** 5/5 passing (WebDriver) | 0/5 validated (semantic)

**Error Message:**
```
A1: Erreur lors de l'appel à Ollama : Fetch is aborted. Vérifiez qu'Ollama est actif sur http://127.0.0.1:11434
```

**Subsequent Prompts:** Q2-Q20 all marked `NOT_RUN` with error:
```
ERR: timeout waiting for response
```

### Cause Racine

**Content Security Policy (CSP)** dans Tauri bloque les connexions fetch vers Ollama.

**File:** `src-tauri/tauri.conf.json` (line 66)  
**Current CSP `connect-src`:**
```
connect-src 'self' tauri: asset: ipc: http://127.0.0.1:1420 ws://127.0.0.1:1420
```

**Missing:** `http://127.0.0.1:11434` (Ollama endpoint)

### Impact

| Component | Status | Impact |
|-----------|--------|--------|
| Ollama Service | ✅ Running (PID 2311) | Service OK |
| curl test | ✅ Success | Network OK |
| Tauri E2E fetch | ❌ CSP Blocked | **E2E FAIL** |
| AI Certification | ❌ 0/20 prompts valid | **BLOCKED** |
| FULL_UI Qualification | ❌ Cannot certify | **BLOCKED** |

### Diagnostic Détaillé

1. **Network Layer:** ✅ Ollama répond correctement à curl
2. **Application Layer:** ❌ Tauri WebView bloque via CSP
3. **Test Layer:** ⚠️ WebDriver tests "pass" mais validation sémantique échoue
4. **Certification Layer:** ❌ Aucun prompt ne reçoit de réponse AI valide

**Root Cause Confirmation:**  
CSP `connect-src` ne liste pas explicitement `http://127.0.0.1:11434`, causant un abort de toutes les requêtes fetch vers Ollama avant qu'elles n'atteignent le réseau.

---

## Test Results Matrix

| Test Scenario | WebDriver | Semantic | Blocker |
|--------------|-----------|----------|---------|
| boot-smoke | ✅ PASS | ✅ PASS | - |
| always respond (20) | ✅ PASS | ❌ FAIL | Q1 error, Q2-Q20 timeout |
| offline autonomy (5) | ✅ PASS | ❌ FAIL | All timeout |
| ui matrix (5) | ✅ PASS | ❌ INCOMPLETE | Partial data |
| memory + metacognition | ✅ PASS | ❌ FAIL | No responses |
| error handling (3) | ✅ PASS | ❌ INCOMPLETE | Partial data |

**Final Hook Error:**
```
Error: AUTO_UI_FULL blocked: MEMORY_METACOG_INCOMPLETE, ALWAYS_RESPOND, OFFLINE, MEMORY_METACOG
```

---

## Fix Proposé (Minimal, Strict)

**Ajout à CSP `connect-src` :**
```
http://127.0.0.1:11434
```

**Optionnel (recommandé) :**
```
http://localhost:11434
```

**Interdictions (GATE_1 compliance) :**
- ❌ Pas de wildcard `http:`
- ❌ Pas de `*`
- ❌ Pas d'autres domaines externes
- ❌ Pas d'élargissement scope CSP

**Security Impact:** ✅ LOW  
- CSP déjà permissive pour `http://127.0.0.1:1420` (Tauri dev)
- Ajout suit même pattern localhost
- Pas d'endpoints externes

---

## Authorization Gate (CRITICAL)

**Règle constitutionnelle :**
```
NE JAMAIS déployer via AppImage ou DEB sans autorisation explicite de Kevin Thibault
NE JAMAIS lancer `pnpm run build` sans demande explicite
```

**Solution implémentée :**
- Gate d'autorisation locale via artefact explicite
- Build E2E séparé du build production
- Pas de déploiement, uniquement test local

**Voir:** `E2E_BUILD_AUTH_GATE.md` pour détails complets.

---

## Validation After Fix

**Expected Outcome:**
- Q1-Q20 all receive valid AI responses
- Verdict: PASS in `ALWAYS_RESPOND.md`
- Status: `READY_FOR_QUALIFY` in `FINAL_DECISION.md`

**Proof Pack Location:**
```
reports/titane-ai-cert/auto-ui/mode-full/
├── ALWAYS_RESPOND.md
├── OFFLINE.md
├── UI_MATRIX.md
├── MEMORY_METACOG.md
├── ERROR_HANDLING.md
├── FINAL_DECISION.md
└── RUN_LEDGER.json
```

---

**GATE_0:** ✅ PASS — État et cause documentés exhaustivement.
