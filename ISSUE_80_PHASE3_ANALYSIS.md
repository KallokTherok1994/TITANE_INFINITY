# Issue #80 Phase 3: Three.js WebGL Performance Tests

**Date**: 2026-01-03  
**Milestone**: Test Coverage 99.3% → 100%  
**Status**: Phase 3 Analysis Complete — WebGL Tests Require Browser Environment

---

## 🎯 Objectif Phase 3

Activer les tests Three.js/WebGL restants (11 tests) dans `floating.perf.test.ts`.

---

## 🔍 Analyse Tests Skipped

### État Final Tests

```
Tests:        2306 passed | 16 skipped (2322 total)
Test Files:   108 passed | 2 skipped (110 total)
Duration:     ~35s
```

### Fichiers Skipped Identifiés

1. **`titane_e2e.test.ts`** — 5 E2E tests (Vitest backend integration)
   - Condition: `skipIf(SKIP_E2E)` — require RUN_E2E_TESTS=1
   - Status: **Documenté** (Phase 1) — npm script `test:e2e:vitest` disponible
   - Guide: [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)

2. **`floating.perf.test.ts`** — 11 Three.js WebGL performance tests
   - Condition: `skipIf(!hasThreeJSRenderer)` — require WebGL context
   - Status: **Analysé** (Phase 3) — nécessite environnement browser
   - Tests: FPS stability, memory leaks, camera updates, material rendering

### Détails floating.perf.test.ts

```typescript
// Check if we can run WebGL tests
const canRunWebGLTests =
  typeof window !== 'undefined' && 
  typeof WebGLRenderingContext !== 'undefined';
```

**Problème**: Node.js (Vitest en mode node) n'a pas:
- ❌ `window` global
- ❌ `WebGLRenderingContext` API
- ❌ Canvas/WebGL rendering context

**Tests concernés (11)**:
1. ✅ FPS stability (60 FPS over 600 frames)
2. ✅ Frame drops (1000 frames)
3. ✅ Rapid skeleton updates
4. ✅ Memory leaks (mount/unmount cycles)
5. ✅ Resource disposal (Three.js cleanup)
6. ✅ Rapid resizes (100 cycles)
7. ✅ Extreme resize (50x50 → 3840x2160)
8. ✅ Camera position updates
9. ✅ FOV changes
10. ✅ Material updates (1000 iterations)
11. ✅ Long-term stability (3600 frames / 1 minute)

---

## ✅ Tests Three.js Déjà Actifs

### appearanceFloatingIntegration.test.ts — 19 tests ✅

```typescript
// Check if Three.js can load properly
try {
  THREE = await import('three');
  hasThreeJS = true;
} catch {
  hasThreeJS = false;
}
```

**Résultat**: ✅ **Three.js r182 disponible** → 19 tests passent!

**Tests activés**:
- Material initialization (default colors)
- Color palette application (neutral, pastel, vibrant, dark)
- Metalness/roughness based on formality/energy
- Style state transitions
- Integration with appearance subsystem

**Ces 19 tests sont déjà dans les 2306 passing tests!**

---

## 📊 Récapitulatif Coverage

### Tests Actifs (2306)
- ✅ **108 test files** passent (y compris appearanceFloatingIntegration.test.ts)
- ✅ **2306 tests individuels** passent
- ✅ **Coverage**: 99.3%

### Tests Skipped (16)
- ⏭️ **2 test files** skipped:
  1. `titane_e2e.test.ts` (5 tests) — require RUN_E2E_TESTS=1
  2. `floating.perf.test.ts` (11 tests) — require WebGL browser context

### Coverage Breakdown
- **SQLite Tests**: ✅ **30 tests actifs** (SQLiteVectorStore + UnifiedMemory.perf)
- **Three.js Tests**: ✅ **19 tests actifs** (appearanceFloatingIntegration)
- **E2E Tests (Vitest)**: ⏭️ **5 tests skipped** (backend integration)
- **Three.js WebGL Performance**: ⏭️ **11 tests skipped** (require browser)

---

## 🎯 Options pour Activer floating.perf.test.ts

### Option 1: Browser Mode (Playwright Component Testing)
✅ **Recommandé pour vrais tests WebGL**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
    },
  },
});
```

**Avantages**:
- Vrai WebGL context
- Tests performance réalistes
- Mesures FPS précises

**Inconvénients**:
- Lent (~5-10x plus lent)
- Nécessite Playwright installé
- Complexité CI/CD

### Option 2: Happy-DOM Environment
⚠️ **Limité — ne supporte pas WebGL complet**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
});
```

**Avantages**:
- Rapide (Node.js)
- `window` global disponible

**Inconvénients**:
- ❌ Pas de WebGL API réel
- ❌ Tests performance non représentatifs

### Option 3: Mock WebGL Context
⚠️ **Tests superficiels uniquement**

```typescript
// Mock WebGLRenderingContext
global.WebGLRenderingContext = class {
  /* mock methods */
} as any;
```

**Avantages**:
- Rapide
- Tests unitaires structure code

**Inconvénients**:
- ❌ Pas de mesures performance réelles
- ❌ Ne teste pas vraiment Three.js rendering

---

## 🚀 Recommandation Finale

### Coverage 100% Réaliste vs Symbolique

**Option A: Coverage 99.3% (Réaliste)**
- Garder E2E et WebGL tests skipped par défaut
- ✅ Tous les tests "units" activés (2306)
- ✅ npm scripts disponibles: `test:e2e:vitest` (E2E manual)
- ✅ Guide complet: [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)

**Option B: Coverage 100% (Symbolique)**
- Activer browser mode Playwright pour floating.perf.test.ts
- Activer RUN_E2E_TESTS=1 pour titane_e2e.test.ts
- ⚠️ Tests **10x plus lents** (~5-6 minutes au lieu de 35s)
- ⚠️ Complexité CI/CD (browsers, timeouts)

### Décision Technique

**Issue #77** visait: "99.3% → 100% test coverage"

**Réalité découverte**:
- ✅ **SQLite tests**: déjà actifs (30 tests dans 2306)
- ✅ **Three.js appearance tests**: déjà actifs (19 tests dans 2306)
- ⏭️ **E2E backend tests**: require RUN_E2E_TESTS=1 (5 tests)
- ⏭️ **Three.js WebGL perf tests**: require browser mode (11 tests)

**Proposition**:
- **Default**: 99.3% coverage (2306/2322) — rapide, stable, complet pour développement
- **Optional**: 100% coverage via flags — pour validation pré-production
  - `RUN_E2E_TESTS=1 npm test` → E2E backend tests
  - Browser mode → WebGL performance tests (CI/pre-release)

---

## ✅ Livrables Phase 3

1. ✅ Analyse complète tests skipped (2 fichiers, 16 tests)
2. ✅ Identification Three.js tests actifs (19 tests appearance)
3. ✅ Options techniques pour 100% coverage
4. ✅ Recommandation architecturale (99.3% default + flags optionnels)

---

## 📈 Prochaines Étapes

**Décision Utilisateur**: Choisir entre:

1. **Issue #80 Complete (99.3% coverage actuel)**
   - Marquer Issue #80 comme résolu
   - Documentation complète (3 phases)
   - Tests coverage acceptable pour production

2. **Issue #80 Extended (100% coverage symbolique)**
   - Activer browser mode pour floating.perf.test.ts
   - Intégrer npm script pour E2E + WebGL
   - Trade-off: +16 tests vs +400% temps exécution

---

**Status**: ⏸️ **En attente décision utilisateur** — Phase 3 analyse complète
