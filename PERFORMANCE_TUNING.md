# ⚡ PERFORMANCE TUNING — TITANE∞ v27.0.0

**Guide complet d'optimisation des performances pour TITANE∞.**

---

## 📊 Current Performance Baseline (v27.0.0)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Startup Time** | ~1.2s | < 1.0s | ⚠️ Good |
| **Bundle Size** | 7.1 MB | < 6.5 MB | 🔴 To Optimize |
| **Memory Usage** | ~250 MB | < 200 MB | ⚠️ Acceptable |
| **Chat Response Time** | ~500ms | < 200ms | 🟡 Depends on Ollama |
| **UI Responsiveness** | 60 FPS | 60 FPS | ✅ Perfect |

---

## 🎯 Optimization Targets for 100/100

### Priority 1: Bundle Size (7.1 MB → 6.5 MB)

**Current breakdown**:
```
vite-built bundle:  4.2 MB (main code)
Dependencies:       1.8 MB (node_modules dist)
Assets:            1.1 MB (fonts, icons)
```

#### 1.1 Code Splitting

**File**: `vite.config.ts`

**Action**: Enable automatic chunk splitting
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'ui-components': [
            '@/components/ui',
            '@/components/icons',
          ],
          'ai-services': [
            '@/services/ai',
            '@/lib/security',
          ],
        },
      },
    },
  },
});
```

**Expected Savings**: ~200-300 KB (lazy loading)

---

#### 1.2 Remove Unused Dependencies

**Audit**:
```bash
npm list --depth=0 | grep -v "├──\|└──"
# Review each package
```

**Candidates for removal**:
- ❓ `axios` (use native `fetch`)
- ❓ `lodash` (use modern JS alternatives)
- ❓ Unused UI library modules

**Action**: Replace or remove
```bash
npm uninstall axios lodash  # if unused
```

**Expected Savings**: ~150-250 KB

---

#### 1.3 Optimize Images & Assets

**Current state**:
- Fonts: ~500 KB
- Icons: ~300 KB
- Other: ~300 KB

**Optimizations**:

a) **Font Subsetting** (keep only needed chars)
```bash
# Use font subsetter
npm install --save-dev fonttools

# Keep only: ASCII + Latin-1
# Remove: CJK, Arabic, etc. if not needed
```

**Expected Savings**: ~150-200 KB

b) **SVG Optimization**
```bash
npm install --save-dev svgo

# Run on all SVGs
svgo --folder=public/icons --recursive
```

**Expected Savings**: ~50-100 KB

c) **Image Compression**
```bash
npm install --save-dev imagemin imagemin-mozjpeg

# Compress PNGs and JPGs
```

**Expected Savings**: ~100-150 KB

---

#### 1.4 Tree-Shaking & Dead Code Removal

**Check**: Run build analysis
```bash
npm run build -- --analyze
```

**Remove dead imports** in:
- `src/services/ai/providers/`
- `src/lib/security/`
- `src/hooks/`

**Expected Savings**: ~100-200 KB

---

### Priority 2: Memory Usage (250 MB → 200 MB)

#### 2.1 Optimize React Components

**Pattern 1**: Use `memo` for expensive renders
```typescript
import { memo } from 'react';

const ChatMessage = memo(({ content, role }: Props) => {
  return <div>{content}</div>;
});
```

**Pattern 2**: Use `useMemo` for expensive computations
```typescript
const memoizedData = useMemo(
  () => expensiveComputation(data),
  [data]
);
```

**Pattern 3**: Use `useCallback` for event handlers
```typescript
const handleSend = useCallback((msg: string) => {
  // ...
}, [dependencies]);
```

**Expected Savings**: ~30-50 MB

---

#### 2.2 Optimize Storage

**Current**: In-memory caching of all chat history

**Optimization**: Use IndexedDB for large datasets
```typescript
import { useIDB } from '@/hooks/useIDB';

// Store only recent (last 100 messages) in memory
// Archive older to IndexedDB
const { messages, archive } = useIDB('chat-history');

useEffect(() => {
  if (messages.length > 100) {
    archive(messages.slice(0, 50));
  }
}, [messages]);
```

**Expected Savings**: ~50-80 MB

---

#### 2.3 Lazy Load Heavy Modules

**Module**: AI providers (Ollama, OpenAI)

```typescript
// Before: Eagerly loaded
import { ollamaProvider } from '@/services/ai/providers/ollama';

// After: Lazy loaded
const ollamaProvider = lazy(
  () => import('@/services/ai/providers/ollama')
);
```

**Expected Savings**: ~40-60 MB

---

### Priority 3: Startup Time (1.2s → < 1.0s)

#### 3.1 Code Splitting on Routes

**File**: `src/App.tsx`

```typescript
import { Suspense, lazy } from 'react';

const ChatPage = lazy(() => import('@/pages/Chat'));
const SettingsPage = lazy(() => import('@/pages/Settings'));

export function App() {
  return (
    <Routes>
      <Route path="/chat" element={
        <Suspense fallback={<Loading />}>
          <ChatPage />
        </Suspense>
      } />
    </Routes>
  );
}
```

**Expected Savings**: ~300-400ms startup

---

#### 3.2 Preload Critical Resources

**HTML** (`index.html`):
```html
<!-- Critical fonts -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" />

<!-- Critical CSS -->
<link rel="preload" href="/dist/main.css" as="style" />

<!-- DNS prefetch -->
<link rel="dns-prefetch" href="//127.0.0.1:11434" />
```

**Expected Savings**: ~100-200ms

---

#### 3.3 Optimize Vite Config

**File**: `vite.config.ts`

```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true },
    },
    sourcemap: false,  // Only for production
  },
  // Use esbuild for faster builds
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
```

**Expected Savings**: ~50-100ms

---

## 🚀 Benchmark & Monitoring

### Lighthouse Score Check

```bash
# Install Lighthouse CI
npm install --save-dev @lhci/cli@latest

# Run audit
lhci autorun
```

**Target scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

---

### Monitor Runtime Performance

**Code**: Instrument key functions

```typescript
import { performance } from 'perf_hooks';

// Mark start
performance.mark('ai-chat-start');

// ... do work ...

// Mark end
performance.mark('ai-chat-end');
performance.measure('ai-chat', 'ai-chat-start', 'ai-chat-end');

// Get duration
const measure = performance.getEntriesByName('ai-chat')[0];
console.log(`AI Chat took ${measure.duration}ms`);
```

---

### Memory Profiling

```typescript
// Check memory usage
console.memory?.usedJSHeapSize
// Log periodically
setInterval(() => {
  const mem = (performance as any).memory;
  console.log(`Memory: ${Math.round(mem.usedJSHeapSize / 1048576)}MB`);
}, 5000);
```

---

## 🔧 Production Optimization Checklist

- [ ] **Bundle Analysis**
  - [ ] Run `npm run build -- --analyze`
  - [ ] Check bundle map for large modules
  - [ ] Identify candidates for code splitting

- [ ] **Code Splitting**
  - [ ] Split by route (Chat, Settings, etc.)
  - [ ] Lazy load heavy dependencies
  - [ ] Add loading fallbacks

- [ ] **Asset Optimization**
  - [ ] Compress images (imagemin)
  - [ ] Subset fonts (keep only needed chars)
  - [ ] Minify SVGs (svgo)

- [ ] **React Optimization**
  - [ ] Add `memo` to expensive components
  - [ ] Add `useMemo` for heavy computations
  - [ ] Add `useCallback` for event handlers

- [ ] **Storage Optimization**
  - [ ] Move chat history to IndexedDB (> 100 messages)
  - [ ] Clean old data periodically
  - [ ] Monitor cache size

- [ ] **Build Configuration**
  - [ ] Enable tree-shaking
  - [ ] Disable sourcemaps in production
  - [ ] Optimize terser settings

- [ ] **Monitoring**
  - [ ] Set up Lighthouse CI
  - [ ] Monitor startup time weekly
  - [ ] Track memory usage trends

---

## 📈 Performance Improvement Timeline

**Week 1**: Bundle size optimization (7.1 MB → 6.7 MB)
- Code splitting: -300 KB
- Unused deps removal: -200 KB
- Asset optimization: -200 KB

**Week 2**: Memory optimization (250 MB → 220 MB)
- React memo/useMemo: -30 MB
- Storage optimization: -50 MB
- Lazy loading: -40 MB

**Week 3**: Startup optimization (1.2s → 0.9s)
- Route-based code splitting: -300ms
- Resource preloading: -150ms
- Vite optimization: -50ms

**Target**: 100/100 performance score by v27.1.0

---

## 🎓 Additional Resources

- [Web.dev Performance Guide](https://web.dev/performance/)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [React Performance](https://react.dev/reference/react/memo)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

---

**Dernière mise à jour**: 2026-01-30  
**Status**: ✅ Optimizations Ready for Implementation
