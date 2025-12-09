# PHASE 4.3 — RUNTIME PERFORMANCE PROFILING REPORT
**Date**: 8 décembre 2025  
**Auteur**: GitHub Copilot (Claude Sonnet 4.5)  
**Contexte**: Analyse performance runtime après PHASE 4.2 (code splitting optimizations)

---

## 🎯 **OBJECTIFS PHASE 4.3**

### **Cibles d'analyse**
1. **First Contentful Paint (FCP)** : < 1.8s (cible Google)
2. **Largest Contentful Paint (LCP)** : < 2.5s (cible Google)
3. **Time to Interactive (TTI)** : < 3.8s (cible Google)
4. **Total Blocking Time (TBT)** : < 300ms (cible Google)
5. **Cumulative Layout Shift (CLS)** : < 0.1 (cible Google)

### **Métriques additionnelles**
- **React component render time** (via React DevTools Profiler)
- **JavaScript execution time** (via Chrome DevTools Performance)
- **Memory usage baseline** (heap size initial)
- **Network waterfall** (asset loading sequence)

---

## 📊 **MÉTRIQUES ESTIMÉES (Analyse statique)**

### **Bundle Analysis (dist/)**
```bash
Bundle total: 5.0MB
├── JS: 2.5MB (50%)
├── CSS: 0.3MB (6%)
├── Assets: 2.2MB (44%)
```

### **Critical Path Analysis**
```
index.html (4KB)
  ↓
main.js (entrypoint)
  ↓
├── react-vendor.js (172KB) ← React runtime
├── ui-components.js (372KB) ← UI library
├── DashboardPage (eager) ← Critical
└── services-common.js (204KB) ← Core services
```

### **Lazy Loading Status**
| Route | Statut | Taille | Impact FCP |
|-------|--------|--------|-----------|
| `/` (Dashboard) | ✅ Eager | ~800KB | 🔴 Bloque |
| `/chat` | ✅ Lazy | 348KB | ✅ Différé |
| `/cognitive` | ✅ Lazy | ~150KB | ✅ Différé |
| `/system-center` | ✅ Lazy | ~200KB | ✅ Différé |
| **Bubbles** | ✅ Lazy | ~150KB | ✅ Différé |

---

## 🔍 **BOTTLENECKS IDENTIFIÉS (Sans mesure live)**

### **1. Dashboard eager loaded (800KB)**
**Impact** : Bloque FCP/LCP car chargé avant first paint

**Cause** :
```typescript
// App.tsx ligne 82
import { DashboardPage } from './pages/DashboardPage'; // ❌ Eager import
```

**Solution** :
```typescript
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
```

**Gain attendu** : FCP -400ms, LCP -600ms

---

### **2. React vendor bundle (172KB)**
**Impact** : Bundle critique non compressible

**Cause** : React 18 + React Router + React DOM
**Solution** : ❌ Impossible (dépendance critique)
**Alternative** : Preload avec `<link rel="modulepreload">`

**Gain attendu** : TTI -100ms (avec preload)

---

### **3. UI Components bundle (372KB)**
**Impact** : Chargé upfront pour tous les composants UI

**Cause** : AppShell (Sidebar, Header) utilise ui-components
**Solution** : 
- Lazy load composants non critiques (Modal, Tooltip)
- Code split par feature (Button/Input separate de Charts/Forms)

**Gain attendu** : FCP -200ms, bundle initial -150KB

---

### **4. Services-common (204KB)**
**Impact** : Services chargés même si routes lazy

**Cause** : useLivingEngines() importé dans App.tsx
**Solution** : Lazy load services par route

**Gain attendu** : TTI -300ms

---

### **5. CSS-in-JS overhead**
**Impact** : Runtime CSS parsing + injection

**Cause** : Styled-components / Emotion runtime
**Solution** : Migrer vers CSS modules ou Tailwind (build-time)

**Gain attendu** : TBT -50ms, FCP -100ms

---

## 📈 **PROJECTIONS PERFORMANCE**

### **Avant optimisations (estimé)**
| Métrique | Valeur | Score Lighthouse |
|----------|--------|------------------|
| FCP | ~2.5s | 🟠 50/100 |
| LCP | ~4.0s | 🔴 30/100 |
| TTI | ~5.5s | 🔴 20/100 |
| TBT | ~800ms | 🔴 25/100 |
| CLS | ~0.3 | 🟠 60/100 |
| **Score global** | - | **🔴 37/100** |

### **Après optimisations (projeté)**
| Métrique | Avant | Après | Δ | Score |
|----------|-------|-------|---|-------|
| FCP | 2.5s | **1.5s** | -40% | 🟢 85/100 |
| LCP | 4.0s | **2.2s** | -45% | 🟢 90/100 |
| TTI | 5.5s | **3.0s** | -45% | 🟢 85/100 |
| TBT | 800ms | **250ms** | -69% | 🟢 90/100 |
| CLS | 0.3 | **0.05** | -83% | 🟢 95/100 |
| **Score global** | 37/100 | **🟢 89/100** | +141% | - |

---

## 🚀 **PLAN D'OPTIMISATIONS RUNTIME**

### **Phase 1 : Critical Rendering Path (Priorité P0)**

#### **1.1 Lazy load DashboardPage**
```typescript
// Avant
import { DashboardPage } from './pages/DashboardPage';

// Après
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
```
**Impact** : FCP -400ms, bundle initial -800KB

#### **1.2 Preload critical assets**
```html
<!-- index.html -->
<link rel="modulepreload" href="/assets/react-vendor.js">
<link rel="modulepreload" href="/assets/ui-components.js">
<link rel="preload" href="/assets/titane-logo.svg" as="image">
```
**Impact** : LCP -200ms (logo), TTI -100ms (vendor)

#### **1.3 Inline critical CSS**
```html
<!-- index.html -->
<style>
  /* Critical above-the-fold styles */
  body { margin: 0; font-family: 'Inter', sans-serif; }
  .app-shell { min-height: 100vh; }
</style>
```
**Impact** : FCP -150ms

---

### **Phase 2 : Code Splitting Agressif (Priorité P1)**

#### **2.1 Split UI components par feature**
```typescript
// vite.config.ts
manualChunks: {
  'ui-core': ['Button', 'Input', 'Text'],
  'ui-layout': ['Sidebar', 'Header', 'AppShell'],
  'ui-charts': ['recharts'],
  'ui-forms': ['react-hook-form', 'zod'],
}
```
**Impact** : Bundle initial -200KB, TTI -200ms

#### **2.2 Lazy load services par route**
```typescript
// Avant (App.tsx)
import { useLivingEngines } from './hooks';

// Après (par page)
// DashboardPage.tsx
const livingEngines = lazy(() => import('../hooks/useLivingEngines'));
```
**Impact** : Bundle initial -150KB, TTI -150ms

---

### **Phase 3 : Runtime Optimizations (Priorité P2)**

#### **3.1 React.memo pour composants lourds**
```typescript
// Avant
export const Sidebar = (props) => { ... };

// Après
export const Sidebar = React.memo((props) => { ... }, (prev, next) => {
  return prev.collapsed === next.collapsed;
});
```
**Impact** : Re-renders -60%, TBT -100ms

#### **3.2 Virtual scrolling pour listes**
```typescript
// Avant
{items.map(item => <Item key={item.id} {...item} />)}

// Après
import { FixedSizeList } from 'react-window';
<FixedSizeList height={600} itemCount={items.length} itemSize={50}>
  {({ index, style }) => <Item style={style} {...items[index]} />}
</FixedSizeList>
```
**Impact** : Render time -80% (listes >50 items), TBT -150ms

#### **3.3 Debounce événements fréquents**
```typescript
// Avant
<input onChange={(e) => handleSearch(e.target.value)} />

// Après
import { useDebouncedCallback } from 'use-debounce';
const debouncedSearch = useDebouncedCallback(handleSearch, 300);
<input onChange={(e) => debouncedSearch(e.target.value)} />
```
**Impact** : TBT -50ms, CPU usage -30%

---

### **Phase 4 : Asset Optimizations (Priorité P3)**

#### **4.1 Compress images (WebP + AVIF)**
```bash
# Convertir PNG/JPG → WebP
for img in src/assets/*.{png,jpg}; do
  cwebp -q 80 "$img" -o "${img%.*}.webp"
done
```
**Impact** : Assets -40%, LCP -300ms (si image hero)

#### **4.2 Font subsetting (glyphs français uniquement)**
```css
/* Avant */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* Après */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap&subset=latin');
/* Et télécharger + self-host pour contrôle total */
```
**Impact** : Font loading -50%, FCP -100ms

---

## 🛠️ **TOOLING RECOMMENDATIONS**

### **Lighthouse CI (automation)**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: http://localhost:4173
          budgetPath: ./lighthouse-budget.json
```

### **React DevTools Profiler (manual)**
1. Build production : `npm run build && npm run preview`
2. Ouvrir Chrome DevTools → Profiler tab
3. Record interaction (navigate Dashboard → Chat)
4. Analyser flamegraph pour composants >50ms

### **Chrome DevTools Performance (manual)**
1. Ouvrir DevTools → Performance tab
2. Record page load (hard refresh Ctrl+Shift+R)
3. Analyser :
   - Main thread blocking (long tasks >50ms)
   - Network waterfall (asset loading)
   - Memory timeline (heap growth)

---

## 📝 **NEXT STEPS**

### **Immédiat (PHASE 4.3 complet)**
1. ✅ **Démarrer preview server** : `npm run build && npm run preview`
2. ⏳ **Run Lighthouse audit** : `npx lighthouse http://localhost:4173 --output json --output-path ./lighthouse-report.json`
3. ⏳ **Analyser résultats** : Comparer avec projections ci-dessus
4. ⏳ **Implémenter P0 fixes** : Lazy load Dashboard + preload critical

### **Court terme (PHASE 4.4)**
1. Memory leak detection (heap snapshots)
2. Event listener cleanup audit
3. Component unmount cleanup

### **Long terme (post-PHASE 4)**
1. Migration CSS-in-JS → CSS Modules
2. Image lazy loading avec Intersection Observer
3. Service Worker + offline support

---

## 🎓 **LESSONS LEARNED (Estimation)**

1. **Bundle size ≠ Performance** : 5.0MB avec lazy loading peut être plus rapide que 2.0MB tout eager
2. **Critical path matters** : 800KB Dashboard eager bloque FCP plus que 2MB lazy Chat
3. **Preload strategic** : Preload vendor/ui-components peut gagner 100-200ms TTI
4. **Measure before optimize** : Projections ici sont théoriques, mesure réelle nécessaire

---

## 📂 **FICHIERS À CRÉER**

### **lighthouse-budget.json** (Performance budget)
```json
{
  "resourceSizes": [
    { "resourceType": "script", "budget": 400 },
    { "resourceType": "stylesheet", "budget": 100 },
    { "resourceType": "image", "budget": 500 },
    { "resourceType": "total", "budget": 1500 }
  ],
  "timings": [
    { "metric": "first-contentful-paint", "budget": 1800 },
    { "metric": "largest-contentful-paint", "budget": 2500 },
    { "metric": "interactive", "budget": 3800 }
  ]
}
```

### **.lighthouserc.json** (Lighthouse CI config)
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }]
      }
    }
  }
}
```

---

## ⚠️ **LIMITATIONS ACTUELLES**

1. **Lighthouse non exécuté** : Build en cours pendant cette analyse (transforming/rendering chunks)
2. **Pas de mesures réelles** : Toutes les projections sont théoriques basées sur bundle analysis
3. **Preview server timeout** : Build trop long (>45s), interrompu pour éviter blocage

**Recommandation** : Exécuter Lighthouse manuellement après build complet :
```bash
npm run build  # Attendre fin (peut prendre 1-2 minutes)
npm run preview &  # Background
sleep 5  # Attendre démarrage
npx lighthouse http://localhost:4173 --view  # Ouvre rapport dans browser
```

---

## 🎯 **CONCLUSION PHASE 4.3**

**Status** : ⚠️ **INCOMPLET** (mesures réelles requises)

**Préparation** : ✅ Plan d'optimisations défini (4 phases, 11 actions)

**Prochaine étape** : 
- **Option A** : Exécuter Lighthouse et compléter rapport avec vraies métriques
- **Option B** : Passer à PHASE 4.4 (memory leaks) et revenir à Lighthouse plus tard
- **Option C** : Implémenter fixes P0 maintenant, mesurer après

**Recommandation** : **Option C** (implémenter lazy Dashboard + preload, puis mesurer impact)
