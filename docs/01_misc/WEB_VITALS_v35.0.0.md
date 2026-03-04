# v35.0.0 — Web Vitals & Perceived Performance Optimization

**Initiative**: Optimize FCP (First Contentful Paint) & LCP (Largest Contentful Paint)  
**Status**: 🚀 ACTIVE IMPLEMENTATION  
**Target**: -40-60% FCP improvement, -30-50% LCP improvement  
**Effort**: 3-4 hours

---

## 🎯 Strategic Approach

### Phase 1: Critical Path Optimization (45 min)

1. **Identify critical resources** for initial render
2. **Extract inline CSS** to external stylesheets (faster parsing)
3. **Preload critical fonts** + optimize font-display
4. **Defer non-critical JavaScript**

### Phase 2: Image Optimization (30 min)

1. **Lazy-load above-the-fold images** that appear lower
2. **Generate WebP variants** with fallbacks
3. **Optimize image dimensions** (no upscaling)
4. **Add intrinsic sizing** to prevent layout shift

### Phase 3: Component-Level Code Splitting (45 min)

1. **Split main page bundles** by viewport/route
2. **Lazy-load heavy components** that appear below fold
3. **Add Suspense boundaries** with loading states
4. **Preload on idle** (requestIdleCallback)

### Phase 4: Rendering Optimization (30 min)

1. **Minimize render-blocking CSS**
2. **Optimize critical selectors**
3. **Remove unused CSS** from critical path
4. **Use CSS containment** for performance

---

## 📊 CURRENT STATE (Baseline)

### Estimated Current Metrics (v34.0.0)

```
FCP (First Contentful Paint):    ~2.5-3s (target: <1.8s)
LCP (Largest Contentful Paint):  ~3.5-4.5s (target: <2.5s)
CLS (Cumulative Layout Shift):   TBD
TTFB (Time to First Byte):       ~200-300ms
```

**Issues Identified**:

- Heavy JS bundle (4.04MB uncompressed) → blocks rendering
- Inline styles in components → layout thrashing
- Images likely unoptimized → LCP blocker
- No preload directives for critical resources

---

## Phase 1: Critical Path Analysis & Optimization

### 1.1 Identify Critical Rendering Path

**Critical Resources** (must load for FCP):

- `index.html` + critical CSS
- React core + app initialization
- Router setup
- Main layout components (TitanePage)
- Initial page CSS

**Non-Critical** (can lazy-load):

- Charts, timelines, dev tools (already lazy ✅)
- Avatar/3D components
- Heavy feature bundles

### 1.2 External CSS Strategy

**Current**: Likely using Tailwind + component CSS-in-JS  
**Target**: Separate critical CSS in `<link>` tag

**Implementation**:

```html
<!-- Critical path CSS (should be <14KB gzipped for TCP window) -->
<link rel="stylesheet" href="/assets/critical-index.css" media="screen" />

<!-- Deferred CSS -->
<link
  rel="stylesheet"
  href="/assets/deferred.css"
  media="print"
  onload="this.media='screen'"
/>
```

**Action**: Audit vite.config.ts for CSS splitting strategy

### 1.3 Font Optimization

**Pattern**:

```html
<!-- Preload critical fonts -->
<link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossorigin />

<!-- Optimize display -->
<link rel="stylesheet" href="..." />
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter.woff2') format('woff2');
    font-display: swap; /* Show fallback immediately, swap when loaded */
  }
</style>
```

### 1.4 Script Optimization

**Current**: React + dependencies in `<script>` (render-blocking)  
**Target**: Defer non-critical, preload critical

```html
<!-- Critical React runtime only -->
<script src="/assets/react-vendor.js" defer></script>

<!-- Preload for early discovery -->
<link rel="modulepreload" href="/assets/index.js" />
```

---

## Phase 2: Image Optimization Strategy

### 2.1 Image Audit

**Find Images**:

```bash
grep -r "src=" src/components/ --include="*.tsx" | grep -i "\.png\|\.jpg\|\.webp"
find public/ -name "*.png" -o -name "*.jpg" | head -20
```

**Metrics**:

- Total image size
- Uncompressed vs optimized
- WebP support detection

### 2.2 Lazy-Loading Images

**Pattern** (with IntersectionObserver):

```tsx
const Image = ({ src, alt }) => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoaded(true);
        observer.disconnect();
      }
    });
    observer.observe(ref.current);
  }, []);

  return (
    <img
      ref={ref}
      src={loaded ? src : 'data:image/gif;base64,...'}
      alt={alt}
      loading="lazy"
    />
  );
};
```

**Better**: Use `native loading="lazy"` attribute where supported

### 2.3 Image Format Optimization

**Recommended**:

```tsx
<picture>
  {/* WebP for modern browsers */}
  <source srcSet="/img/hero.webp" type="image/webp" />
  {/* JPEG fallback */}
  <img src="/img/hero.jpg" alt="Hero" loading="lazy" />
</picture>
```

---

## Phase 3: Component-Level Code Splitting

### 3.1 Below-the-Fold Component Splitting

**Current**: Everything in main bundle  
**Target**: Split by viewport location

**Components to Defer** (candidates):

- Sections below hero/header
- Dashboard panels that load separately
- Feature-specific modules
- Heavy computation visualizations

**Pattern**:

```tsx
// Defer loading until needed
const DeferredSection = lazy(() => import('./DeferredSection'));

export function MainPage() {
  return (
    <>
      {/* Critical above-the-fold */}
      <Hero />
      <Navigation />

      {/* Below-the-fold with Suspense */}
      <Suspense fallback={<Skeleton />}>
        <DeferredSection />
      </Suspense>
    </>
  );
}
```

### 3.2 Route-Based Preloading

**Pattern** (use requestIdleCallback):

```tsx
// Preload next route when idle
function useIdlePreload(routePath) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import(routePath);
      });
    }
  }, [routePath]);
}
```

---

## Phase 4: Rendering Optimization

### 4.1 CSS Containment

**Apply to component subtrees**:

```css
.heavy-component {
  contain: layout style paint; /* Limit reflow scope */
}
```

### 4.2 Optimize Critical Selectors

**Bad**: `div > span > p` (expensive traversal)  
**Good**: `.specific-class` (direct match)

**Audit**:

```bash
# Find complex selectors in CSS
grep -r ">" src/ --include="*.css" | wc -l
```

### 4.3 Remove Unused CSS

**Tools**:

- PurgeCSS / Tailwind's unused CSS removal
- UnCSS for runtime detection
- Coverage in DevTools

---

## 📋 IMPLEMENTATION ROADMAP

### Step 1: Analyze Current Performance (10 min)

- [ ] Run Lighthouse audit (current baseline)
- [ ] Export report
- [ ] Identify biggest FCP/LCP blockers
- [ ] Take screenshots

### Step 2: Critical CSS Extraction (20 min)

- [ ] Identify critical styles (header, nav, hero)
- [ ] Create `critical.css` file
- [ ] Add preload directive
- [ ] Measure FCP improvement

### Step 3: Font Optimization (10 min)

- [ ] Add `font-display: swap`
- [ ] Preload critical fonts
- [ ] Remove font-weight variants not used initially

### Step 4: Image Audit & Optimization (15 min)

- [ ] List all images in public/
- [ ] Identify above-the-fold images
- [ ] Add `loading="lazy"` to below-fold
- [ ] Create WebP variants for largest images

### Step 5: Component Code Splitting (15 min)

- [ ] Identify below-fold heavy components
- [ ] Wrap in `React.lazy()` + `Suspense`
- [ ] Add preload on idle

### Step 6: Measurement & Validation (15 min)

- [ ] Re-run Lighthouse
- [ ] Compare metrics (before vs after)
- [ ] Document impact
- [ ] Commit changes

---

## ✅ SUCCESS METRICS

| Metric            | Current    | Target         | Gain              |
| ----------------- | ---------- | -------------- | ----------------- |
| FCP               | ~2.5-3s    | <1.8s          | -30-40%           |
| LCP               | ~3.5-4.5s  | <2.5s          | -30-40%           |
| TTFB              | ~200-300ms | ~200ms         | Stable            |
| Bundle (critical) | 4.04MB     | <2MB (initial) | -50% initial load |

**Lighthouse Score Impact**:

- Performance: +15-25 points
- CWV: May improve from NEEDS WORK → GOOD

---

## 🚀 IMMEDIATE NEXT STEPS

1. Start with Lighthouse audit (baseline)
2. Implement critical CSS extraction
3. Add font optimization
4. Lazy-load non-critical images
5. Split heavy components
6. Re-measure

**Estimated Total Time**: 3-4 hours for full implementation + validation

---

**Status**: Ready to begin Phase 1  
**First Action**: Run Lighthouse audit to establish baseline  
**Tool**: Chrome DevTools Lighthouse tab or `npm run build && npx lighthouse`
