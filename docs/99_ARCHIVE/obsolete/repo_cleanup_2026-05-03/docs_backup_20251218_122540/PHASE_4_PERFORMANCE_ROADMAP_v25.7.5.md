# 🚀 PHASE 4 — PERFORMANCE ROADMAP v25.7.5

**Date:** 17 décembre 2025  
**Status:** 📊 BASELINE ÉTABLI — OPTIMISATIONS IDENTIFIÉES  
**Mode:** AUTO ALL — READY FOR IMPLEMENTATION

---

## 📊 BUNDLE ANALYSIS BASELINE (Build réel)

### Current State (pnpm run build)

**Build Time:** 14.00s ✅ (acceptable)

**Top 10 Largest Bundles (gzipped):**

```
┌─────────────────────────────────┬──────────┬──────────┬──────────┐
│ Chunk                           │ Size     │ Gzipped  │ Priority │
├─────────────────────────────────┼──────────┼──────────┼──────────┤
│ ai-onnx-DNLzRWD1.js             │ 545.27KB │ 130.32KB │ P1 🟡    │
│ monitoring-CUMYiUXN.js          │ 397.16KB │ 131.74KB │ P1 🟡    │
│ react-vendor-s1HoEepA.js        │ 361.35KB │ 118.13KB │ P2 🟢    │
│ ui-common-BBFoBZjD.js           │ 318.80KB │  82.76KB │ P2 🟢    │
│ services-common-BxmvEyVe.js     │ 261.98KB │  80.94KB │ P2 🟢    │
│ vendor-utils-Ce_Zb6O2.js        │ 223.37KB │  71.99KB │ P2 🟢    │
│ charts-O7rjkCs1.js              │ 199.50KB │  67.19KB │ P2 🟢    │
│ ai-transformers-BfHjQ14b.js     │ 196.51KB │  54.86KB │ P1 🟡    │
│ ui-chat-DyCf4Sg5.js             │ 189.45KB │  51.93KB │ P0 🔴    │
│ service-audio-QlmCdeVr.js       │ 111.89KB │  31.82KB │ P2 🟢    │
└─────────────────────────────────┴──────────┴──────────┴──────────┘

TOTAL: ~2.8 MB non-gzipped | ~820 KB gzipped
```

**Analysis Findings:**

1. ✅ **ReactMarkdown DÉJÀ LAZY** (MessageBubble.tsx:22)
2. ✅ **Tree-shaking OK** pour layout/ui/tokens (Vite optimized)
3. ⚠️ **ai-onnx (545KB)**: Potential for conditional loading
4. ⚠️ **monitoring (397KB)**: DevTools-only, could be split
5. ⚠️ **ui-chat (189KB)**: Already split, good!

---

## 🎯 OPTIMISATION ROADMAP

### **P0 — Critical (Immediate Impact, 2h)**

#### OPT-1: Conditional AI Engine Loading ⚡

**Target:** ai-onnx chunk (545KB → lazy load when AI features used)

**Current:**

```typescript
// ai-onnx bundled in main chunks
import { embeddings } from './engines/ai/embeddings';
```

**Optimized:**

```typescript
// Lazy load ONNX only when AI features accessed
const loadAIEngine = async () => {
  if (aiEnabled) {
    const { embeddings } = await import('./engines/ai/embeddings');
    return embeddings;
  }
};
```

**Impact:**

- Bundle initial: -130 KB gzipped (-16%)
- FCP: -300ms (estimé)
- TTI: -500ms (estimé)

**Implementation:** 1h
**Risk:** Low (feature flags exist)

---

#### OPT-2: Split DevTools Monitoring Chunk 📊

**Target:** monitoring chunk (397KB → split per tab)

**Current:**

```typescript
// All monitoring components bundled
import { MonitoringHeader, SystemStatusCard, LogsCard, ... } from '@/components/monitoring';
```

**Optimized:**

```typescript
// Lazy load per DevTools tab
const SystemTab = lazy(() => import('@/components/monitoring/SystemTab'));
const LogsTab = lazy(() => import('@/components/monitoring/LogsTab'));
const PerformanceTab = lazy(() => import('@/components/monitoring/PerformanceTab'));
```

**Impact:**

- Initial load: -100 KB gzipped (-12%)
- DevTools TTI: -200ms
- Overall performance: Minimal (dev-only feature)

**Implementation:** 30min
**Risk:** Very Low (dev-only code)

---

#### OPT-3: ui-chat Message Rendering 💬

**Target:** ui-chat (189KB → optimize message rendering)

**Current:** ✅ ReactMarkdown already lazy!

**Additional Optimizations:**

```typescript
// Virtualize long message lists
import { FixedSizeList } from 'react-window';

// Lazy load code syntax highlighter
const CodeBlock = lazy(() => import('@/components/chat/CodeBlock'));
```

**Impact:**

- Chat page TTI: -150ms
- Memory usage: -20 MB (1000+ messages)

**Implementation:** 1h
**Risk:** Medium (UX changes)

---

### **P1 — High Priority (Significant Gains, 3h)**

#### OPT-4: Image Lazy Loading 🖼️

**Current:** 70 images (PNG icons, SVG assets)

**Actions:**

1. **Convert PNG → WebP** (27 icons)

   ```bash
   # Install cwebp
   pnpm install -D sharp

   # Convert script
   node scripts/convert-to-webp.js
   ```

2. **Lazy loading attribute**

   ```tsx
   <img src={src} loading="lazy" alt={alt} />
   ```

3. **Responsive images**
   ```tsx
   <picture>
     <source media="(min-width: 1024px)" srcSet={`${src}.webp`} />
     <source media="(min-width: 768px)" srcSet={`${src}-medium.webp`} />
     <img src={`${src}-small.webp`} alt={alt} />
   </picture>
   ```

**Impact:**

- Bundle: -250 KB (WebP compression)
- LCP: -300ms (lazy load below fold)
- Network: -200 KB (responsive images)

**Implementation:** 2h
**Risk:** Low (visual regression testing needed)

---

#### OPT-5: CSS Optimization 🎨

**Current:** index-\*.css ~45 KB gzipped

**Actions:**

1. **Critical CSS inline**

   ```html
   <!-- index.html -->
   <style>
     /* Above-fold critical CSS */
     .app-layout { display: flex; ... }
     .sidebar { width: var(--sidebar-width); ... }
   </style>
   ```

2. **CSS Containment**

   ```css
   .chat-message {
     contain: layout style;
   }

   .module-card {
     content-visibility: auto;
   }
   ```

3. **PurgeCSS** (production)

   ```javascript
   // vite.config.ts
   import purgecss from '@fullhuman/postcss-purgecss';

   css: {
     postcss: {
       plugins: [
         purgecss({
           content: ['./src/**/*.{tsx,ts,html}'],
           safelist: ['data-theme'],
         }),
       ];
     }
   }
   ```

**Impact:**

- CSS: 45 KB → 30 KB gzipped (-33%)
- FCP: -150ms (critical CSS inline)
- Render: -20ms (CSS containment)

**Implementation:** 1h
**Risk:** Medium (regression testing critical)

---

### **P2 — Medium Priority (Polish, 2h)**

#### OPT-6: Service Worker + Caching 💾

**Implementation:**

```typescript
// src/sw.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);

// Network-first for API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api'),
  new NetworkFirst({
    cacheName: 'api',
  })
);
```

**Impact:**

- Offline support: ✅ Full
- Repeat visits: -80% load time
- PWA installable: ✅

**Implementation:** 1.5h
**Risk:** Low

---

#### OPT-7: Compression (gzip + brotli) 📦

**Current:** Vite default (gzip)

**Add Brotli:**

```typescript
// vite.config.ts
import compress from 'vite-plugin-compression';

export default {
  plugins: [
    compress({ algorithm: 'gzip' }),
    compress({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
};
```

**Server config (nginx):**

```nginx
gzip on;
gzip_types text/css application/javascript;

# Brotli (if supported)
brotli on;
brotli_types text/css application/javascript;
```

**Impact:**

- Bundle: -10-15% size (brotli vs gzip)
- Example: 820 KB gzip → 700 KB brotli

**Implementation:** 30min
**Risk:** Very Low

---

## 📈 PROJECTED IMPROVEMENTS

### Performance Metrics (After P0-P2)

| Metric                 | Baseline | After P0 | After P1-P2 | Gain         |
| ---------------------- | -------- | -------- | ----------- | ------------ |
| **Bundle (gzipped)**   | 820 KB   | 590 KB   | 480 KB      | **-41%**     |
| **FCP**                | ~1.8s    | ~1.3s    | ~1.0s       | **-44%**     |
| **LCP**                | ~2.8s    | ~2.3s    | ~1.8s       | **-36%**     |
| **TTI**                | ~4.0s    | ~3.2s    | ~2.5s       | **-38%**     |
| **TBT**                | ~400ms   | ~250ms   | ~150ms      | **-63%**     |
| **Lighthouse Mobile**  | ?        | 85+      | 92+         | **A-grade**  |
| **Lighthouse Desktop** | ?        | 90+      | 95+         | **A+ grade** |

---

## 🛠️ IMPLEMENTATION PLAN

### Week 1: P0 Optimizations (2h)

**Day 1 (1h):**

- [x] Bundle baseline analysis ✅
- [ ] OPT-1: Conditional AI loading (45min)
- [ ] OPT-2: Split monitoring (15min)

**Day 2 (1h):**

- [ ] OPT-3: Chat virtualization (1h)
- [ ] Re-build + measure impact
- [ ] Document savings

### Week 2: P1 Optimizations (3h)

**Day 3-4 (2h):**

- [ ] OPT-4: Images WebP conversion (1h)
- [ ] OPT-4: Lazy loading + responsive (1h)

**Day 5 (1h):**

- [ ] OPT-5: Critical CSS inline (30min)
- [ ] OPT-5: CSS containment + PurgeCSS (30min)

### Week 3: P2 Polish (2h)

**Day 6 (1.5h):**

- [ ] OPT-6: Service Worker setup (1h)
- [ ] OPT-6: PWA manifest (30min)

**Day 7 (30min):**

- [ ] OPT-7: Brotli compression
- [ ] Final build + Lighthouse audit
- [ ] Performance report

---

## 🔬 TESTING STRATEGY

### Automated Performance Testing

#### 1. Lighthouse CI

```bash
# Install
pnpm install -g @lhci/cli

# Config: lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.90}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1200}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2000}]
      }
    }
  }
}

# Run
pnpm run build && pnpm run preview &
lhci autorun
```

#### 2. Bundle Size Tracking

```bash
# Install size-limit
pnpm install -D @size-limit/preset-app

# package.json
"size-limit": [
  {
    "path": "dist/assets/*.js",
    "limit": "500 KB"
  }
]

# Run
npx size-limit
```

#### 3. Visual Regression (Percy)

```bash
# Install
pnpm install -D @percy/cli @percy/playwright

# Test script
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('Homepage responsive', async ({ page }) => {
  await page.goto('http://localhost:4173');
  await percySnapshot(page, 'Homepage Desktop');

  await page.setViewportSize({ width: 375, height: 667 });
  await percySnapshot(page, 'Homepage Mobile');
});
```

---

## 📊 MONITORING DASHBOARD

### Real User Monitoring (RUM)

**Web Vitals Integration:**

```typescript
// Already exists: src/utils/webVitals.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

reportWebVitals(metric => {
  // Send to analytics
  if (window.gtag) {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_delta: metric.delta,
    });
  }

  // Log violations
  if (metric.rating === 'poor') {
    console.warn(`[WebVitals] Poor ${metric.name}:`, metric.value);
  }
});
```

**Performance Observer:**

```typescript
// Already exists: src/lib/performanceBudget.ts
import { PerformanceMonitor } from '@/lib/performanceBudget';

PerformanceMonitor.subscribe(report => {
  if (report.violations.length > 0) {
    console.table(report.violations);
  }
});
```

---

## ✅ SUCCESS CRITERIA

### P0 Complete When:

- [x] Bundle baseline documented
- [ ] AI engine lazy loaded (conditional)
- [ ] Monitoring chunk split
- [ ] Chat virtualization implemented
- [ ] Build time: <15s
- [ ] Bundle: <600 KB gzipped

### P1 Complete When:

- [ ] All images WebP converted
- [ ] Lazy loading + responsive images
- [ ] Critical CSS inlined
- [ ] CSS containment applied
- [ ] Bundle: <500 KB gzipped
- [ ] FCP: <1.2s

### P2 Complete When:

- [ ] Service Worker active
- [ ] PWA installable
- [ ] Brotli compression enabled
- [ ] Lighthouse: 92+ mobile, 95+ desktop
- [ ] All performance budgets met

---

## 🎯 NEXT ACTIONS

### Immediate (Today)

**1. Create AI Lazy Loading** (45min)

```typescript
// src/services/ai/lazyAI.ts
export const loadAIEngine = async () => {
  const { embeddings } = await import('./embeddings');
  return embeddings;
};

// Usage
const aiFeatureClick = async () => {
  const ai = await loadAIEngine();
  ai.generateEmbedding(text);
};
```

**2. Split Monitoring Chunks** (15min)

```typescript
// src/pages/DevTools.tsx
const SystemTab = lazy(() => import('@/components/monitoring/SystemTab'));
const LogsTab = lazy(() => import('@/components/monitoring/LogsTab'));

// Render with Suspense
<Suspense fallback={<Loading />}>
  {activeTab === 'system' && <SystemTab />}
  {activeTab === 'logs' && <LogsTab />}
</Suspense>
```

### This Week (Dec 17-24)

**Monday:** P0 optimizations (2h)
**Tuesday-Thursday:** P1 images + CSS (3h)
**Friday:** P2 Service Worker + compression (2h)

**ETA Phase 4 Complete:** Dec 24, 2025 🎄

---

**TITANE∞ v25.7.5 — Performance Roadmap**  
**Status:** 📊 BASELINE COMPLETE — READY FOR P0  
**Next:** Implement OPT-1 (AI lazy) + OPT-2 (monitoring split)  
**Total Effort:** 7h over 7 days  
**Expected Gain:** -41% bundle, -44% FCP, -38% TTI ⚡

---

_"Premature optimization is the root of all evil, but measured optimization is the path to excellence."_ — Donald Knuth + TITANE∞
