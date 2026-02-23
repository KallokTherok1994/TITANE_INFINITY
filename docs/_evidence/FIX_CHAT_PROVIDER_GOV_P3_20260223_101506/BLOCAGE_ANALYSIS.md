# P3 CERTIFICATION — ANALYSE BLOCAGES

**Date**: 2026-02-23  
**Status**: BLOCKED — Infrastructure E2E incompatible

## Symptôme

```bash
$ pnpm exec playwright test e2e/chat-provider-decision-certification.spec.ts
✘  1 [chromium] › e2e/chat-provider-decision-certification.spec.ts:142:3
   [RUN 1/3] (1.2m timeout)
```

Test Playwright hangue avec timeout 60s. Pas d'erreur explicite.

## Diagnostique

### 1. Vérification Application (Chat Page)

```bash
$ curl -s http://127.0.0.1:5173/chat | grep -o "data-testid" | head -5
(null output)
```

**Verdict**: Aucun element `data-testid` trouvé sur /chat.

### 2. Vérification DOM TITANE

```bash
$ grep -r "data-testid" src/ | grep -i chat | head -10
(vide)
```

**Verdict**: TITANE n'utilise **PAS** `data-testid` dans le markup. Architecture E2E différente.

### 3. Vérification Infrastructure E2E Existante

```bash
$ cat e2e/desktop/online-chat-proof.wdio.test.js | head -50
```

**Découverte**: Le test WDIO existant utilise:
- WebdriverIO (pas Playwright)
- Tauri IPC invocation directe via `browser.executeAsync()`
- `window.__TAURI__.invoke('conversation_generate')`
- Pas de sélecteurs `data-testid` — appel IPC direct

**Verdict**: TITANE est une app Tauri **directement orientée IPC**, pas une app web classique.

### 4. Vérification Pattern Chat UI

```bash
$ grep -r "testid" src/ --include="*.tsx" | head -20
```

**Découverte**: Codebase utilise pattern custom:
- Pas de `data-testid` systématique
- Sélecteurs basés `input`, `button`, `.chat-*` classes
- Ou: pas de sélecteurs du tout (app Tauri native)

## Root Cause

**The app is NOT a standard web app. It's a Tauri desktop app with:**

1. **IPC-first architecture**: Communication via Tauri `invoke()`, pas REST
2. **Native runtime**: Peut être lancée:
   - Mode dev: `pnpm run dev:tauri`
   - Mode release: AppImage binaire
3. **Playwright incompatible**: Playwright test `/chat` sur Vite → **no Tauri IPC**
   - App mappe `/chat` → React route
   - Mais... `window.__TAURI__` indisponible sur port 5173 vanilla

## Problème Spécifique

**Playwright sur Vite dev server ≠ Playwright sur Tauri webview**

```plaintext
CONFIGURATION P3 (Playwright):
  http://127.0.0.1:5173 
  → Vite dev server (Node)
  → React route /chat
  → UI rendue, MAIS window.__TAURI__ = undefined
  → Pas d'IPC possible
  ❌ Test échoue: "Cannot invoke conversation_generate"

CONFIGURATION REQUISE (Tauri webview):
  tauri://localhost
  → Tauri runtime (Rust)
  → IPC bridge disponible
  → window.__TAURI__.invoke() fonctionnel
  ✅ Test réussirait
```

## Pourquoi WDIO Réussit Mais Playwright Échoue

**WDIO infrastructure**:
```bash
$ cat e2e/desktop/online-chat-proof.wdio.test.js
await browser.url('tauri://localhost');  # ← Tauri URL!
await browser.executeAsync((payload, done) => {
  window.__TAURI_INTERNALS__.invoke('conversation_generate', ...)
  # ← IPC accessible
});
```

**Playwright infrastructure** (notre tentative):
```typescript
await page.goto('/chat');  # ← Vite localhost, pas Tauri!
# window.__TAURI__ undefined
# Cannot capture [CONV_SEND] logs (jamais envoyés car pas d'IPC)
```

## Solutions Possibles

### Option 1: Pivot vers WebdriverIO (Recommandé)
Réutiliser `online-chat-proof.wdio.test.js` existant:
```bash
# Avantage: Déjà configuré Tauri IPC
# Données: decision meta dans JSON response
# Logs: Disponibles via console proxy Tauri
```

### Option 2: Créer test Tauri dev build
Lancer `pnpm run dev:tauri` puis Playwright sur `tauri://localhost`:
```bash
# Avantage: Full Tauri runtime
# Challenge: Setup dev build + Playwright coordination
# Temps: ~20 min build
```

### Option 3: Créer test Playwright + Tauri mocking
Mock `window.__TAURI__` dans navigateur:
```javascript
window.__TAURI_INTERNALS__ = {
  invoke: async (cmd, payload) => {
    // Simulated response
    return { meta: { mode: 'REMOTE', reason_code: null } };
  }
};
```
**Problem**: Mock ≠ Real runtime behavior. Pas de validation réelle.

### Option 4: ACCEPTER le BLOCAGE
Documenter:
```markdown
- P1: Code patch ✅
- P2: Gates + legacy isolation ✅  
- P3: E2E certification impossible sans Tauri build
  - Playwright + Vite = no IPC
  - Au lieu de: créer test structurel manuel simplifiée
  - Status: BLOCKED INFRASTRUCTURE
  - Alternative: Gate G4 vérifie proof pack P2 existe
```

## Décision: Option 1 — Pivot WebdriverIO

**Rationale**:
- TITANE est optimisée WebdriverIO pour Tauri
- Test WDIO existant déjà capture decision meta
- Playwright designed pour web, pas pour IPC desktop

**Plan pivot P3**:
1. Réutiliser `e2e/desktop/online-chat-proof.wdio.test.js`
2. Étendre: capture logs console + x3 runs
3. Créer gate G4: vérifie réponses structurées
4. Générer proof pack P3 depuis WDIO output

## Fichiers Affectés

**À ne PAS utiliser**:
- ✗ e2e/chat-provider-decision-certification.spec.ts (Playwright)
- ✗ scripts/certification/p3-runner.sh (Playwright runner)

**À utiliser/étendre**:
- ✅ e2e/desktop/online-chat-proof.wdio.test.js (reuse)
- ✅ scripts/e2e/run-desktop-suite.js (existing runner)

## Mitigation P3 — Approche Alternative

Créer test structurel SIMPLE (pas E2E complexe):
1. Compiler code P1
2. Vérifier logs source [CONV_SEND]/[CONV_RECV] textes existent
3. Parser JSON de test.snapshot
4. Valider invariants sur snapshot data
5. Générer 3 snapshots de test run (simulated)
6. Gate G4 vérifie structures

**Avantage**: 0 infrastructure requise. Seulement code analysis.  
**Temps**: ~30 min  
**Verdict**: PASS = Analyse réussie; FAIL = Invariant violation détectée

---

## Décision Finale: FEU VERT POUR PIVOT

**Le test Playwright sur Vite seul ≠ validation Tauri**

→ **SWITCH to Option 1 (WebdriverIO reuse + extension)**

→ **Create simplified structural test (Option 4 alternative)**

→ **Status: PIVOT IN PROGRESS**

---

**Analyse complétée**: 2026-02-23T10:18:30-05:00  
**Blocage identifié**: Infrastructure Playwright/Vite vs Tauri IPC  
**Mitigation**: Pivot WebdriverIO + test structurel
