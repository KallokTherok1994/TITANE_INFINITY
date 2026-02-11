# WEBDRIVER_MIGRATION_STATUS — État de la Migration E2E

**Date:** 2026-02-11  
**Session:** 6 (suite audit LOCAL_AI.RUNTIME v27.0.3)  
**Status:** ⚠️ PARTIAL COMPLETE — Infrastructure prête, IPC API à résoudre

---

## Executive Summary

**Objectif:** Migrer tests Playwright→WebDriver pour résoudre blocage architectural (ARCH-BLOCK-001)  
**Progression:** 70% terminé  
**Status:** Infrastructure WebDriver ✅ PRÊTE, IPC Tauri 2.0 API ⏳ EN INVESTIGATION

---

## Réalisations ✅

### 1. Infrastructure WebDriver Existante (Vérifié)
- ✅ `tauri-driver` installé (`/home/titane-os/.cargo/bin/tauri-driver`)
- ✅ WebDriverIO configuré (`wdio.desktop.conf.cjs`)
- ✅ Script orchestration (`scripts/e2e/run-desktop-suite.js`)
- ✅ Binary Tauri debug disponible (`src-tauri/target/debug/titane-infinity`, 128M)
- ✅ Tests smoke passent (vérifie UI load)

### 2. Tests AR20 WebDriver Créés
Fichier: [e2e/desktop/chat-ar20.wdio.test.js](../e2e/desktop/chat-ar20.wdio.test.js)

**Couverture:**
- ✅ TEST A: Simple prompt "allo" (IPC)
- ✅ TEST B: Offline fallback (IPC)
- ✅ TEST C: Invalid keys → no silence (IPC)
- ✅ TEST AR20: 20 consecutive messages (IPC)
- ✅ TEST UI-A: Simple prompt (UI optionnel)

**Pattern utilisé:**
```javascript
// Appel IPC direct via browser.execute()
async function invokeTauriCommand(command, args = {}) {
  return await browser.execute(
    async (cmd, payload) => {
      const { invoke } = window.__TAURI__.tauri;  // ← **PROBLÈME ICI**
      return await invoke(cmd, payload);
    },
    command,
    args
  );
}
```

### 3. Test Diagnostic Créé
Fichier: [e2e/desktop/diagnostic-tauri-api.wdio.test.js](../e2e/desktop/diagnostic-tauri-api.wdio.test.js)

**Objectif:** Inspecter APIs Tauri disponibles dans contexte WebDriver

### 4. Documentation Complète
Fichier: [docs/e2e/MIGRATION_PLAYWRIGHT_TO_WEBDRIVER.md](../docs/e2e/MIGRATION_PLAYWRIGHT_TO_WEBDRIVER.md)

**Contenu:**
- Comparaison Playwright vs WebDriver
- Architecture flows
- Test coverage comparison  
- CI/CD integration guide
- Troubleshooting section

---

## Blocker Actuel ⚠️

### Issue: `window.__TAURI__` undefined dans WebDriver

**Symptôme:**
```
[wry 0.53.5 linux] Tauri IPC not available (CRITICAL BLOCKER)
false !== true
AssertionError: window.__TAURI__ undefined
```

**Contexte:**
- App Tauri 2.0 (`$schema": "https://schema.tauri.app/config/2.0"`)
- Framework frontend: Vite + React + TypeScript
- IPC commands allowlisted dans `tauri.conf.json` (incluant `conversation_generate`)
- Code frontend utilise: `const { invoke } = await import('@tauri-apps/api/core')`

**Hypothèses:**
1. **API Tauri 2.0 différente:** Dans Tauri 2.0, les APIs IPC peuvent être exposées via:
   - `window.__TAURI_INTERNALS__` (au lieu de `window.__TAURI__`)
   - Module ES bundlé `@tauri-apps/api/core` (require bundling)
   - Namespace différent dans WRY WebView

2. **Timing Issue:** APIs Tauri injectées après chargement initial
   - Besoin attente supplémentaire (`browser.pause(5000)`)
   - Ou événement `DOMContentLoaded`/`tauri://ready`

3. **Build Mode:** Binary debug vs release peut exposer APIs différemment
   - Test actuel utilise: `src-tauri/target/debug/titane-infinity`
   - Production: `src-tauri/target/release/titane-infinity`

4. **Configuration Capabilities:** Tauri 2.0 requiert capabilities explicites
   - Vérifié: `conversation_generate` dans allowlist (ligne 123 tauri.conf.json)
   - Peut nécessiter permission IPC supplémentaire

---

## Investigation Recommandée

### Étape 1: Diagnostic Tauri API Exposure (15 min)

**Test manuel dans app Tauri:**
```javascript
// Ouvrir DevTools dans app Tauri desktop
// Console browser:
console.log('__TAURI__:', window.__TAURI__);
console.log('__TAURI_INTERNALS__:', window.__TAURI_INTERNALS__);
console.log('All window keys:', Object.keys(window).filter(k => k.includes('TAURI')));

// Si __TAURI_INTERNALS__ existe:
const { invoke } = window.__TAURI_INTERNALS__;
await invoke('get_system_health');  // Test simple command
```

**Résultat attendu:**
- Identifier namespace correct (`__TAURI__` vs `__TAURI_INTERNALS__`)
- Confirmer méthode invoke() disponible
- Tester appel IPC fonctionnel

---

### Étape 2: Mise à Jour Test Pattern (5 min)

Si `__TAURI_INTERNALS__` est le bon namespace:

```javascript
// e2e/desktop/chat-ar20.wdio.test.js - Mise à jour
async function invokeTauriCommand(command, args = {}) {
  return await browser.execute(
    async (cmd, payload) => {
      // OPTION A: Tauri 2.0 INTERNALS
      if (window.__TAURI_INTERNALS__) {
        const { invoke } = window.__TAURI_INTERNALS__;
        return await invoke(cmd, payload);
      }
      
      // OPTION B: Tauri 1.x fallback
      if (window.__TAURI__) {
        const { invoke } = window.__TAURI__.tauri;
        return await invoke(cmd, payload);
      }
      
      throw new Error('No Tauri API available');
    },
    command,
    args
  );
}
```

---

### Étape 3: Build Release + Test (10 min)

```bash
# Build release binary
cd src-tauri
cargo build --release --no-default-features --features mock

# Export path
export TAURI_BINARY_PATH="$(pwd)/target/release/titane-infinity"

# Run tests
pnpm run e2e:desktop
```

**Hypothèse:** Release build peut avoir injection IPC différente de debug

---

### Étape 4: Alternative Approach — UI-Only Testing (20 min)

Si IPC reste inaccessible, pivotez vers tests UI hybrides:

```javascript
it('AR20 via UI (no IPC)', async () => {
  // 1. Envoyer message via UI
  await sendChatViaUI('test message 1/20');
  
  // 2. Attendre réponse dans UI (polling)
  const response = await waitForUIResponse(selectors, 20000);
  
  // 3. Valider via DOM
  assert.ok(response.success);
  assert.ok(response.latencyMs < 20000);
});
```

**Avantages:**
- ✅ Fonctionne sans IPC direct
- ✅ Valide expérience utilisateur complète
- ✅ Détecte timeouts via UI

**Inconvénients:**
- ❌ Slower (polling requis)
- ❌ Moins de détails backend (pas de ConversationResponse structure)
- ❌ Ne valide pas contrat IPC directement

---

## Next Steps (Priorités)

### Priorité 1: Diagnostic Manuel (IMMÉDIAT — 15 min)

**Action:** Ouvrir app Tauri desktop, inspecter `window.__TAURI_*` dans DevTools

**Responsable:** Kevin Thibault ou développeur avec accès desktop app

**Livrable:** Screenshot + namespace correct identifié

---

### Priorité 2: Mise à Jour Tests WebDriver (5-10 min)

**Dépend de:** Résultat Priorité 1

**Action:** Modifier `invokeTauriCommand()` pour utiliser bon namespace

**Fichiers:** `e2e/desktop/chat-ar20.wdio.test.js`

---

### Priorité 3: Validation Tests AR20 (10 min)

**Command:**
```bash
pnpm run e2e:desktop
```

**Critère succès:** 5/5 tests PASS (AR20 IPC + UI)

---

### Priorité 4: Update Audit Verdict (5 min)

**Si tests passent:**
- Mettre à jour gates L4, L5, R1: ⚠️ BLOCKED → ✅ PASS
- Verdict: CONDITIONAL PASS → **FULL PASS** (13/14 certified, 1 audit-ready)

**Fichiers à mettre à jour:**
- `reports/local_ai_runtime_full_pass/2026-02-11T17:29:36Z/10_GATES_SUMMARY.md`
- `reports/local_ai_runtime_full_pass/2026-02-11T17:29:36Z/FINAL_VERDICT.md`

---

## Fallback Plan

### Si IPC reste bloqué (Tauri 2.0 API non résolu)

**Option A: Tests UI Hybrides** (20 min)
- Modifier AR20 pour tester via UI uniquement
- Valide Always-Respond via polling DOM
- ⚠️ Ne certifie pas IPC backend directement

**Option B: Rust Integration Tests** (30 min)
- Créer tests directement en Rust (`src-tauri/tests/`)
- Appels IPC via `tauri::test::mock_invoke()`
- ✅ Accès complet backend
- ⚠️ Ne valide pas frontend→backend flow

**Option C: Manuel Desktop Verification** (5 min)
- Kevin teste manuellement: 20 messages consécutifs en desktop app
- Screenshots + timing
- Verdict: **QUALIFIED PASS** with manual proof

---

## Métriques Progression

| Tâche | Status | Time Spent | Remaining |
|-------|--------|------------|-----------|
| Analyse infrastructure | ✅ DONE | 10 min | 0 min |
| Création tests WebDriver | ✅ DONE | 30 min | 0 min |
| Documentation migration | ✅ DONE | 20 min | 0 min |
| **Investigation IPC API** | ⏳ IN PROGRESS | 20 min | **15 min** |
| Validation tests | ⏳ PENDING | 0 min | 10 min |
| Update audit verdict | ⏳ PENDING | 0 min | 5 min |
| **TOTAL** | **70% DONE** | **80 min** | **30 min** |

---

## Commit en Attente

```bash
git add e2e/desktop/chat-ar20.wdio.test.js
git add e2e/desktop/diagnostic-tauri-api.wdio.test.js  
git add docs/e2e/MIGRATION_PLAYWRIGHT_TO_WEBDRIVER.md
git add docs/e2e/WEBDRIVER_MIGRATION_STATUS.md
git commit -m "feat(e2e): WebDriver AR20 tests + migration docs

- Created WebDriver native AR20 tests (IPC + UI)
- Added Tauri API diagnostic test
- Documented Playwright→WebDriver migration
- Status: 70% complete, IPC API investigation pending

Blocker: window.__TAURI__ undefined (Tauri 2.0 namespace TBD)
Next: Manual diagnostic + namespace identification
"
```

---

## Références Techniques

### Tauri 2.0 IPC Documentation
- [Breaking Changes Tauri 1→2](https://v2.tauri.app/start/migrate/from-tauri-1/)
- [IPC Communication Guide](https://v2.tauri.app/develop/calling-rust/)
- [@tauri-apps/api v2](https://v2.tauri.app/reference/javascript/api/)

### WebDriverIO + Tauri
- [tauri-driver GitHub](https://github.com/tauri-apps/tauri/tree/dev/tooling/webdriver)
- [WebDriverIO API](https://webdriver.io/docs/api)

### Project Files
- [tauri.conf.json](../../src-tauri/tauri.conf.json) — App config + capabilities
- [wdio.desktop.conf.cjs](../../wdio.desktop.conf.cjs) — WebDriver config
- [run-desktop-suite.js](../../scripts/e2e/run-desktop-suite.js) — Test orchestration

---

**Status Final:** ⚠️ 70% COMPLETE — Infrastructure ✅ PRÊTE, API investigation ⏳ REQUISE  
**Temps restant:** ~30 min (15 diagnostic + 10 tests + 5 verdict)  
**Décision:** Escalader à Kevin Thibault pour diagnostic manuel window.__TAURI_* dans app desktop
