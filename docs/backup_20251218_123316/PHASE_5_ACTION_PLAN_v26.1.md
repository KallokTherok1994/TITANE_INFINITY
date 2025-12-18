# 🎯 TITANE∞ v26.0 → v26.1 — PLAN D'ACTION PHASE 5

## Optimization, Performance & Production Readiness

**Date de début:** 17 décembre 2025  
**Version actuelle:** v26.0.0  
**Version cible:** v26.1.0  
**Durée estimée:** 2-3 heures  
**Priorité:** HAUTE

---

## 📊 OBJECTIFS PHASE 5

### Performance Targets

- 🎯 Bundle size: **3.2 MB → <2.5 MB** (-22%)
- 🎯 Initial load: **~2s → <1.5s** (-25%)
- 🎯 Service Worker cache: **4.1 MB → <2.5 MB** (-39%)
- 🎯 Lighthouse Performance: **85/100 → 95/100**

### Code Quality Targets

- 🎯 Console logs production: **35+ → 0** (conditional only)
- 🎯 TypeScript strict: **Maintained 0 errors**
- 🎯 Bundle analysis: **Identify top 10 heaviest modules**
- 🎯 Lazy loading: **≥5 routes/components**

---

## 🗺️ ROADMAP DÉTAILLÉE

### Phase 5.1: Bundle Analysis & Profiling (30min)

#### 5.1.1 Install Bundle Analyzer

```bash
npm install --save-dev rollup-plugin-visualizer
```

#### 5.1.2 Configuration Vite

**Fichier:** `vite.config.ts`

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... existing plugins
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

#### 5.1.3 Generate Analysis

```bash
npm run build
# Opens dist/stats.html automatically
```

**Actions:**

- [ ] Identifier top 10 modules les plus lourds
- [ ] Analyser dépendances tierces (react-d3-tree, react-chrono, recharts)
- [ ] Évaluer code splitting opportunities
- [ ] Documenter findings dans `BUNDLE_ANALYSIS_v26.1.md`

---

### Phase 5.2: Code Splitting & Lazy Loading (45min)

#### 5.2.1 Route-Based Splitting

**Fichier:** `src/App.tsx` (ou équivalent router)

```typescript
// Avant
import { TitanePage } from './pages/TitanePage';

// Après
const TitanePage = lazy(() => import('./pages/TitanePage'));
```

**Cibles pour lazy loading:**

- `TitanePage` (page principale)
- `SettingsPage` (si existe)
- `ChatPage` (si séparé)
- Heavy modals/dialogs

#### 5.2.2 Component-Level Splitting

**Fichiers à lazy load:**

1. **VisionMetricsChart** (recharts heavy)

```typescript
const VisionMetricsChart = lazy(() => import('./features/vision/VisionMetricsChart'));
```

2. **MemoryTreeViewer** (react-d3-tree heavy)

```typescript
const MemoryTreeViewer = lazy(() => import('./features/memory/MemoryTreeViewer'));
```

3. **EvolutionTimeline** (react-chrono heavy)

```typescript
const EvolutionTimeline = lazy(() => import('./features/evolution/EvolutionTimeline'));
```

#### 5.2.3 Suspense Fallback

```typescript
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

**Actions:**

- [ ] Convertir 5+ composants en lazy imports
- [ ] Créer `LoadingSpinner` component réutilisable
- [ ] Tester chargement différé (Network tab DevTools)
- [ ] Valider build size reduction

---

### Phase 5.3: Console Logs Cleanup (20min)

#### 5.3.1 Create Debug Utility

**Fichier:** `src/utils/logger.ts`

```typescript
/**
 * Production-safe logger
 * Only logs in development mode
 */
class Logger {
  private isDev = import.meta.env.DEV;

  log(...args: any[]) {
    if (this.isDev) {
      console.log('[TITANE]', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.isDev) {
      console.warn('[TITANE]', ...args);
    }
  }

  error(...args: any[]) {
    // Errors always logged (but sanitized)
    console.error('[TITANE ERROR]', ...args);
  }
}

export const logger = new Logger();
```

#### 5.3.2 Replace Console Calls

**Fichiers à modifier:**

- `src/pages/TitanePage.tsx` (11 instances)
- `src/services/chatMemoryCompactor.ts` (10 instances)
- `src/engines/autopoiesis/autopoiesisEngine.ts` (3 instances)
- `src/engines/interoception/interoceptionEngine.ts` (3 instances)

**Pattern de remplacement:**

```typescript
// Avant
console.log('Node clicked:', node);

// Après
import { logger } from '@/utils/logger';
logger.log('Node clicked:', node);
```

**Actions:**

- [ ] Créer `logger.ts` utility
- [ ] Remplacer console.log → logger.log (debug only)
- [ ] Remplacer console.warn → logger.warn
- [ ] Garder console.error pour erreurs critiques
- [ ] Valider build production (0 logs)

---

### Phase 5.4: Service Worker Optimization (25min)

#### 5.4.1 Audit Cache Strategy

**Fichier:** `vite-plugin-pwa` config

**Analyse actuelle:**

- 98 fichiers précachés
- 4.1 MB total cache

**Optimisations:**

1. **Exclude large assets:** `.map` files, test files
2. **Runtime caching:** Images, fonts (cache on demand)
3. **Version chunking:** Hash-based invalidation

#### 5.4.2 Configuration PWA

```typescript
// vite.config.ts
VitePWA({
  workbox: {
    globPatterns: [
      '**/*.{js,css,html}', // Exclude .map, .br
    ],
    globIgnores: ['**/*.map', '**/stats.html', 'build-*.txt'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\./,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
    ],
  },
});
```

**Actions:**

- [ ] Exclure fichiers non-essentiels du precache
- [ ] Implémenter runtime caching (fonts, images)
- [ ] Tester cache size post-optimization
- [ ] Valider offline functionality

---

### Phase 5.5: Accessibility Audit (20min)

#### 5.5.1 Lighthouse A11y Test

```bash
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:5173
```

**Vérifications:**

- [ ] ARIA labels coverage >95%
- [ ] Keyboard navigation complete
- [ ] Color contrast ratios WCAG AA
- [ ] Screen reader compatibility
- [ ] Focus management

#### 5.5.2 Manual Testing

**Checklist:**

- [ ] Tab navigation (all interactive elements)
- [ ] Shift+Tab reverse navigation
- [ ] Enter/Space activation
- [ ] Escape closing modals
- [ ] Screen reader announcements (NVDA/VoiceOver)

**Fixes si nécessaire:**

- [ ] Add missing `aria-label`
- [ ] Fix focus traps
- [ ] Improve contrast (buttons, text)
- [ ] Add skip-to-content link

---

### Phase 5.6: Performance Profiling (25min)

#### 5.6.1 React DevTools Profiler

**Actions:**

1. Lancer app en mode dev
2. Ouvrir React DevTools → Profiler
3. Enregistrer session interaction (navigation, filtres, etc.)
4. Identifier composants lents (>16ms render)

**Optimisations courantes:**

- [ ] Add `React.memo()` aux composants lourds
- [ ] Use `useMemo()` pour calculs coûteux
- [ ] Use `useCallback()` pour event handlers
- [ ] Avoid inline functions in render

#### 5.6.2 Network Performance

**Chrome DevTools → Network:**

- [ ] Vérifier waterfall (pas de blocages)
- [ ] Analyser TTFB (Time To First Byte)
- [ ] Valider compression (Brotli/Gzip)
- [ ] Check cache headers

#### 5.6.3 Lighthouse Audit

```bash
# Chrome DevTools → Lighthouse
# Run audit: Performance + Best Practices + Accessibility + SEO
```

**Targets:**

- Performance: ≥95/100
- Best Practices: ≥95/100
- Accessibility: ≥95/100
- SEO: ≥90/100 (si applicable)

---

### Phase 5.7: Production Build Validation (15min)

#### 5.7.1 Build & Test

```bash
# Clean build
rm -rf dist/
npm run build

# Verify output
ls -lh dist/assets/

# Test production bundle
npm run preview
# Open http://localhost:4173
```

**Validations:**

- [ ] Bundle size <2.5 MB
- [ ] Gzip/Brotli compression active
- [ ] Source maps generated (dev only)
- [ ] No console logs in production
- [ ] Service Worker registered
- [ ] App loads <1.5s (simulated 3G)

#### 5.7.2 Cross-Browser Testing

**Browsers to test:**

- [ ] Chrome 120+ (primary)
- [ ] Firefox 121+
- [ ] Safari 17+ (macOS/iOS)
- [ ] Edge 120+

**Features to verify:**

- [ ] Layout responsive
- [ ] Interactions working
- [ ] No console errors
- [ ] PWA installable

---

## 📈 SUCCESS METRICS

### Before vs After (Expected)

| Metric                | Before (v26.0) | After (v26.1) | Delta      |
| --------------------- | -------------- | ------------- | ---------- |
| **Bundle Size**       | 3.2 MB         | <2.5 MB       | -22%       |
| **SW Cache**          | 4.1 MB         | <2.5 MB       | -39%       |
| **Initial Load**      | ~2s            | <1.5s         | -25%       |
| **Console Logs**      | 35+            | 0 (prod)      | -100%      |
| **Lighthouse Perf**   | 85/100         | ≥95/100       | +12%       |
| **TypeScript Errors** | 0              | 0             | Maintained |

---

## 🔧 TOOLS & COMMANDS

### Analysis

```bash
# Bundle analyzer
npm run build && open dist/stats.html

# Lighthouse CI
npx @lhci/cli autorun

# Bundle size check
npx bundlesize
```

### Testing

```bash
# Dev mode (with logging)
npm run dev

# Production build
npm run build && npm run preview

# Test suite
npm test
```

### Profiling

```bash
# React DevTools Profiler (manual)
# Chrome DevTools → Performance tab
# Network waterfall analysis
```

---

## ✅ CHECKLIST PHASE 5

### 5.1 Bundle Analysis

- [ ] Install rollup-plugin-visualizer
- [ ] Configure vite.config.ts
- [ ] Generate bundle stats
- [ ] Document top 10 heavy modules
- [ ] Create BUNDLE_ANALYSIS_v26.1.md

### 5.2 Code Splitting

- [ ] Lazy load TitanePage
- [ ] Lazy load VisionMetricsChart
- [ ] Lazy load MemoryTreeViewer
- [ ] Lazy load EvolutionTimeline
- [ ] Lazy load TransformationRoadmap
- [ ] Create LoadingSpinner component
- [ ] Test lazy loading (Network tab)

### 5.3 Console Cleanup

- [ ] Create logger.ts utility
- [ ] Replace console.log in TitanePage
- [ ] Replace console.log in chatMemoryCompactor
- [ ] Replace console.log in engines
- [ ] Validate production build (0 logs)

### 5.4 Service Worker

- [ ] Audit current precache (98 files)
- [ ] Exclude .map, .br, stats.html
- [ ] Configure runtime caching
- [ ] Test cache size reduction
- [ ] Validate offline mode

### 5.5 Accessibility

- [ ] Run Lighthouse a11y audit
- [ ] Manual keyboard navigation test
- [ ] Screen reader test (NVDA/VoiceOver)
- [ ] Fix missing ARIA labels
- [ ] Validate WCAG AA compliance

### 5.6 Performance

- [ ] React DevTools profiling
- [ ] Add React.memo where needed
- [ ] Optimize useMemo/useCallback
- [ ] Network waterfall analysis
- [ ] Lighthouse performance audit (≥95)

### 5.7 Production Validation

- [ ] Clean build
- [ ] Bundle size check (<2.5 MB)
- [ ] Production preview test
- [ ] Cross-browser testing (4 browsers)
- [ ] PWA install test

---

## 📝 DOCUMENTATION À CRÉER

### Phase 5 Deliverables

1. **BUNDLE_ANALYSIS_v26.1.md** - Analyse bundle détaillée
2. **PERFORMANCE_REPORT_v26.1.md** - Benchmarks avant/après
3. **OPTIMIZATION_CHANGELOG_v26.1.md** - Liste modifications
4. **LIGHTHOUSE_AUDIT_v26.1.md** - Scores Lighthouse finaux

---

## 🚀 POST-PHASE 5

### Phase 6 Preview (Deploy & Docs)

- Production deployment guide
- User documentation complète
- API documentation
- Component library docs
- CI/CD pipeline setup

### v27.0 Preview (Q1 2025)

- Unified memory v2 migration
- Secrets management (keyring OS)
- Legacy API cleanup
- Breaking changes documentation

---

**Phase 5 Status:** 🔄 READY TO START  
**Estimated Duration:** 2-3 hours  
**Next Step:** Bundle Analysis (5.1)

---

_Plan créé: 17 décembre 2025_  
_TITANE∞ v26.0 → v26.1 Optimization_
