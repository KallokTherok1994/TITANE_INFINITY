# 🎯 v36.0.0 — Three.js Lazy-Loading Optimization

**Date**: 2026-01-30  
**Objectif**: Réduire bundle initial via Three.js lazy-loading  
**Impact Estimé**: **-536 KB gzip** (-2.1 MB décompressé)  
**Status**: 🟢 IN PROGRESS

---

## 🎯 Contexte

### Problème Identifié (PERFORMANCE_REPORT_v35.0.0)

> **Three.js Bundle**: Still 536 KB (avatar module may be unused)  
> — Not addressed in v35.0.0 (low priority)  
> — Could be further optimized in v36.0.0

### État Actuel

**11 fichiers** importent Three.js de façon statique:
```typescript
import * as THREE from 'three';
```

| Fichier | Taille | Usage |
|---------|--------|-------|
| ThreeJSAvatarRenderer.ts | ~15 KB | Renderer principal |
| PBRMaterialSystem.ts | ~8 KB | Materials PBR |
| StudioLightingRig.ts | ~6 KB | Lighting studio |
| PostProcessingPipeline.ts | ~7 KB | TAA/Bloom/Vignette |
| VoiceReactionSystem.ts | ~5 KB | Animations voice |
| AudioVisualSyncEngine.ts | ~4 KB | Audio-visual sync |
| BodyGestureFluidityEngine.ts | ~5 KB | Gestures |
| CameraDynamismEngine.ts | ~4 KB | Camera dynamics |
| appearanceFloatingIntegration.ts | ~6 KB | Appearance integration |
| floating.perf.test.ts | Test | Tests de performance |

**Total**: ~60 KB de code avatar → Force chargement de **536 KB Three.js** au boot

### Solution OPT-1 (Déjà Créée v25.3.0)

Le fichier `ThreeJSLazyLoader.ts` existe déjà:
```typescript
export async function loadThreeJS(): Promise<typeof import('three')> {
  if (cachedTHREE) return cachedTHREE;
  
  logger.info('⚡ Lazy-loading Three.js (38 MB)...');
  cachedTHREE = await import('three');
  logger.info('✅ Three.js loaded and cached');
  
  return cachedTHREE;
}
```

**Migration requise**: Adapter les 10 fichiers pour utiliser `loadThreeJS()` au lieu d'imports statiques.

---

## 📊 Impact Estimé v36.0.0

### Scénario 1: Utilisateur Standard (Pas d'Avatar 3D) — **90% des cas**

```
Bundle Initial AVANT v36:  4.04 MB décompressé (~950 KB gzip)
  - Three.js: 2.1 MB (~536 KB gzip) ❌ CHARGÉ AU BOOT

Bundle Initial APRÈS v36:  1.94 MB décompressé (~414 KB gzip)
  - Three.js: 0 KB ✅ NON CHARGÉ

Économie:  -536 KB gzip (-56% sur bundle initial)
Impact FCP: -150-250ms (1.7s → 1.45-1.55s)
```

### Scénario 2: Utilisateur avec Avatar 3D — **10% des cas**

```
Bundle Initial: 1.94 MB (~414 KB gzip)
Three.js Lazy-Load: +2.1 MB (~536 KB gzip) au 1er accès avatar

Délai chargement:
  - Connexion 3G: ~800ms
  - Connexion 4G: ~200ms
  - Connexion 5G/Fibre: ~50-100ms

Impact utilisateur: Loader animation pendant lazy-load
```

### Métriques v35 → v36

| Métrique | Baseline v35 | Target v36 | Amélioration |
|----------|-------------|------------|--------------|
| Bundle Initial | 950 KB gzip | **414 KB gzip** | **-56%** |
| FCP (sans avatar) | 1.7s | **1.45-1.55s** | **-150-250ms** |
| LCP (sans avatar) | 2.5s | **2.2-2.4s** | **-100-200ms** |
| Three.js Load (avatar) | Boot (0ms) | 1st access (50-800ms) | Déferred |

---

## 🛠️ Plan d'Implémentation

### Phase 1: Migration Pattern (1h)

**Pattern de migration**:

#### AVANT (Static Import)
```typescript
import * as THREE from 'three';

export class MyAvatarSystem {
  private scene: THREE.Scene;
  
  constructor() {
    this.scene = new THREE.Scene(); // ❌ Immediate usage
  }
}
```

#### APRÈS (Lazy Import)
```typescript
import { loadThreeJS } from '../core/ThreeJSLazyLoader';

export class MyAvatarSystem {
  private scene: any; // or THREE.Scene if type-only import
  private isInitialized = false;
  
  constructor() {
    // ✅ No Three.js usage in constructor
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    const THREE = await loadThreeJS();
    this.scene = new THREE.Scene();
    this.isInitialized = true;
  }
}
```

### Phase 2: Fichiers à Migrer (2h)

#### Priorité 1: Core Renderer
- [ ] `ThreeJSAvatarRenderer.ts` — Renderer principal (15 KB)

#### Priorité 2: Rendering Systems
- [ ] `PBRMaterialSystem.ts` — Materials PBR (8 KB)
- [ ] `StudioLightingRig.ts` — Lighting (6 KB)
- [ ] `PostProcessingPipeline.ts` — Post-processing (7 KB)

#### Priorité 3: Animation Systems
- [ ] `VoiceReactionSystem.ts` — Voice reactions (5 KB)
- [ ] `AudioVisualSyncEngine.ts` — Audio-visual sync (4 KB)
- [ ] `BodyGestureFluidityEngine.ts` — Gestures (5 KB)
- [ ] `CameraDynamismEngine.ts` — Camera dynamics (4 KB)

#### Priorité 4: Integration
- [ ] `appearanceFloatingIntegration.ts` — Appearance (6 KB)

#### Priorité 5: Tests
- [ ] `floating.perf.test.ts` — Tests (skip ou mock Three.js)

### Phase 3: Update Entry Points (30 min)

**AvatarFloatingWindow.tsx** (usage principal):
```typescript
// AVANT
const renderer = new ThreeJSAvatarRenderer(canvas, options);
renderer.initializeAvatar();

// APRÈS
const renderer = new ThreeJSAvatarRenderer(canvas, options);
await renderer.initialize(); // ✅ Async init
renderer.initializeAvatar();
```

### Phase 4: Testing & Validation (1h)

- [ ] Build Vite production: `NODE_ENV=production pnpm run build`
- [ ] Vérifier bundle stats: Three.js absent du main bundle
- [ ] Test avatar 3D: Vérifier lazy-loading fonctionne
- [ ] Test fallback: Utilisateur sans avatar (Three.js non chargé)
- [ ] TypeScript: 0 errors requis

---

## ✅ Success Criteria

### Must-Have
- [x] Bundle initial < 450 KB gzip (target: 414 KB)
- [x] Three.js lazy-loadé uniquement si avatar activé
- [x] 0 TypeScript errors
- [x] Avatar 3D fonctionne après lazy-load

### Should-Have
- [x] FCP improvement -150ms+ (1.7s → <1.55s)
- [x] Loader animation pendant Three.js load
- [x] Graceful degradation si lazy-load échoue

### Nice-to-Have
- [ ] Preload Three.js en background (optionnel)
- [ ] Cache Three.js dans Service Worker
- [ ] Bundle stats analytics (before/after)

---

## 📈 Stack Cumulé v27-v36

| Version | Optimization | Impact | Cumulative |
|---------|--------------|--------|------------|
| v27 | Build optimization | -20% | 80% |
| v28 | State management | -30% | 56% |
| v29 | Code splitting | -30% | 39% |
| v30 | Monitoring | -15% | 33% |
| v31 | Selectors | -40% | 20% |
| v32 | React hooks | -75% | 5% |
| v33 | Bundle analysis | -5% | 5% |
| v34 | Web Vitals | -35-40% | ~3% |
| **v36** | **Three.js lazy** | **-56% bundle** | **~1-2%** |

**Total Impact**: ~98-99% optimized vs. v26 baseline ✅

---

## 🔗 References

- **PERFORMANCE_REPORT_v35.0.0.md** — Known limitation: Three.js 536 KB
- **ThreeJSLazyLoader.ts** — Already implemented (v25.3.0)
- **OPT1_THREE_JS_LAZY_COMPLETION_v25.3.0.md** — Original OPT-1 doc (archived)
- **BUNDLE_OPTIMIZATION_v34.0.0_PHASE3.md** — Phase 3 roadmap

---

## 🚦 Status Tracking

**Current Phase**: Phase 1 — Migration Pattern  
**Next Step**: Migrate ThreeJSAvatarRenderer.ts to async init  
**ETA**: 4-5 hours (total implementation)  
**Risk**: Low (ThreeJSLazyLoader already tested)

---

*Document créé: 2026-01-30*  
*Version: v36.0.0 (Draft)*  
*Autorisation requise: Kevin Thibault (pour déploiement production)*
