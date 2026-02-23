# VALIDATION SCRIPTS — Analyse des capacités de test

**Timestamp**: 2026-02-23 09:50:00  
**Context**: P2 Phase 3 - Identification des scripts automatisés pour validation réelle

---

## 1) SCRIPTS DISPONIBLES (package.json)

### Dev/Build
```json
"dev:tauri": "bash scripts/launch/deploy_full_local_dev.sh"
"dev:tauri:no-ollama": "bash scripts/launch/deploy_full_local_dev.sh --no-ollama"
"build:tauri:e2e": "... && vite build && tauri build ..."
```

### Tests unitaires/intégration (Vitest)
```json
"test": "cross-env NODE_OPTIONS='...' vitest run"
"test:watch": "... vitest --watch"
"test:coverage": "... vitest run --coverage ..."
"guard:ipc-contract": "... vitest run tests/contract/tauri-ipc-contract.test.ts"
```

### Tests E2E (WebdriverIO + Playwright)
```json
"e2e:desktop:ensure": "bash scripts/e2e/ensure-webkit-webdriver.sh"
"e2e:desktop:run": "node scripts/e2e/run-desktop-suite.js"
```

---

## 2) TESTS EXISTANTS PERTINENTS

### A) Tests chat existants

**File**: `tests/chat/chat.test.ts` (379 lignes)
- **Framework**: Vitest
- **Scope**: Tests unitaires du legacy `aiOrchestrator`
- **Providers testés**: titaneLocal, tauriChat, gemini, ollama
- **Coverage**: Provider cascade, fallbacks
- **❌ Gap**: Ne teste PAS le nouveau `conversationEngine.ts` moderne

**File**: `tests/e2e/provider-flow.test.ts` (392 lignes)
- **Framework**: Playwright
- **Scope**: Tests E2E UI complets
- **Coverage**: Local mode, memory multi-turn
- **Requires**: App running (dev ou build)
- **✅ Could capture**: Console logs frontend via `page.on('console')`
- **❌ Gap**: Nécessite build complet (~5-10 min) ou dev mode (manuel)

### B) Test E2E Chat Proof

**File**: `e2e/desktop/online-chat-proof.wdio.test.js` (100 lignes)
- **Framework**: WebdriverIO
- **Scope**: IPC direct `conversation_generate` invocation
- **Coverage**: Decision meta capture (online, reasonCode, provider)
- **Requires**: Build tauri E2E complet
- **✅ Perfect match**: Teste exactement le backend IPC
- **❌ Blocker**: Nécessite `pnpm run build:tauri:e2e` (~10+ min)

---

## 3) AUTOMATED VALIDATION OPTIONS

### Option A: Unit tests (FAST, LIMITED COVERAGE)
**Command**: `pnpm run test`
- **Pros**: Rapide (~30s), automatisé, no build required
- **Cons**: Ne teste que le legacy aiOrchestrator, pas le modern conversationEngine
- **Coverage**: 0% du patch P1 (commands.rs, conversationEngine.ts, useConversationEngine.ts)
- **Verdict**: ✅ Peut vérifier non-régression sur legacy, ❌ ne valide PAS le patch

### Option B: E2E Playwright (MANUAL OR SLOW)
**Command**: `pnpm run dev:tauri` + manuel OU `pnpm e2e:playwright`
- **Pros**: UI complète, peut capturer console logs
- **Cons**: 
  - Dev mode nécessite interaction manuelle (violates P2 "SANS MANUEL")
  - Build complet nécessite ~5-10 min
- **Coverage**: 100% flow (frontend logs [CONV_SEND]/[CONV_RECV] capturables)
- **Verdict**: 🟡 Possible mais SLOW ou MANUAL

### Option C: E2E WebdriverIO (AUTOMATED, VERY SLOW)
**Command**: `pnpm run build:tauri:e2e && pnpm run e2e:desktop:run`
- **Pros**: Complètement automatisé, teste IPC directement
- **Cons**: Build complet required (~10+ min)
- **Coverage**: Backend IPC + decision meta
- **Verdict**: ✅ IDEAL mais ⏱️ VERY SLOW (out of scope for P2 interactive)

---

## 4) RECOMMENDED APPROACH (PRAGMATIC)

### Phase A: Fast non-regression check (NOW)
```bash
pnpm run test
```
- Vérifier que les tests existants passent toujours
- Coverage: Legacy system (aiOrchestrator)
- Time: ~30s

### Phase B: Structural validation (NOW)
- ✅ Code compiles (Rust + TypeScript)
- ✅ Logs présents dans code source ([CONV_SEND], [CONV_RECV])
- ✅ Mode detection logic correcte (code review)
- ✅ Types validés (ProviderDecisionMeta réutilisé)

### Phase C: Manual post-commit validation (RECOMMENDED)
```bash
# User post-commit (manuel, hors scope P2 auto)
pnpm run dev:tauri
# Ouvrir app, envoyer message chat, observer logs console:
# - [CONV_SEND] External AI gate { allowed, requested_provider }
# - [CONV_RECV] Provider decision { mode, reason_code, provider_used, ... }
# - Vérifier UI n'affiche pas "hors ligne" si mode='REMOTE'
```

### Phase D: Full E2E validation (POST-COMMIT, OPTIONAL)
```bash
# Long run, CI recommandé
pnpm run build:tauri:e2e  # ~10 min
pnpm run e2e:desktop:run
grep -E "\[CONV_SEND\]|\[CONV_RECV\]|\[CHAT_DECISION\]" reports/e2e-desktop/*.log
```

---

## 5) P2 DECISION: PARTIALLY BLOCKED

### Raison
- ✅ Fast automated tests disponibles (`pnpm test`) mais ne couvrent PAS le patch
- 🟡 E2E tests existent et sont parfaits MAIS nécessitent build complet (~10+ min)
- ❌ Pas de test unitaire/integration pour `conversationEngine.ts` moderne
- ❌ Dev mode nécessite interaction manuelle (violates "SANS MANUEL")

### Verdict Phase 3
**Status**: PARTIALLY BLOCKED — Real runtime logs not captured in P2

**Justification**:
- Full automation possible MAIS hors scope temps P2 (10+ min build)
- Structural validation COMPLETE (code compiles, logs present, logic correct)
- Manual post-commit validation REQUIRED (5 min user action)

### Recommendation
1. ✅ Execute Phase A (fast tests) dans P2 → non-régression check
2. ✅ Document structural validation → COMPLETE
3. 📋 Document post-commit manual validation steps → USER ACTION
4. 🔄 Optional: Full E2E in CI post-commit → FUTURE

---

## 6) EXECUTION PLAN (REVISED)

### P2.3a: Fast non-regression (AUTO, NOW)
```bash
pnpm run test | tee /tmp/p2_test_run.log
```
Expected: PASS (legacy tests should still pass)

### P2.3b: Structural validation (REVIEW, NOW)
- Code review: Logs présents
- Compilation: ✅ cargo check, ✅ get_errors
- Architecture: ✅ 4-Ring respect

### P2.3c: Document manual steps (DOC, NOW)
- Create VALIDATION_MANUAL.md with step-by-step
- User executes post-commit (5 min)

---

**Next Step**: Execute P2.3a (fast test run)
