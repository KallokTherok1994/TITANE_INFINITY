# Lazy-Loading Strategy for Heavy Engines

**Phase 4 - Week 6:** Lazy-load engines lourds  
**Version:** v26.2.0  
**Date:** 2025-12-20

---

## 🎯 Objective

Reduce initial bundle size and improve first paint time by lazy-loading heavy, non-critical engines using React.lazy() and dynamic imports.

---

## 📊 Engine Analysis

### Current Heavy Engines (>30KB)

| Engine | Size | Critical? | Lazy Load? |
|--------|------|-----------|------------|
| **uiux** | 168KB | No (UI polish) | ✅ Yes |
| **time** | 116KB | Partial (Agenda needed) | ⚠️ Selective |
| **flow** | 76KB | Yes (Core chat) | ❌ No |
| **cognitive** | 56KB | Yes (Core AI) | ❌ No |
| **voice** | 40KB | No (Optional TTS) | ✅ Yes |
| **phasespace** | 40KB | No (Visualization) | ✅ Yes |
| **metasingularity** | 40KB | Partial (State mgmt) | ⚠️ Selective |
| **identity** | 36KB | Yes (User context) | ❌ No |
| **autopoiesis** | 36KB | No (Advanced feature) | ✅ Yes |

### Critical Path (Must Load Immediately)

1. **flow** - FlowEngine (Chat core)
2. **cognitive** - Cognitive processing
3. **identity** - User identity context
4. **selfHealing** - Error recovery

**Total Critical:** ~200KB

### Non-Critical Path (Can Be Lazy)

1. **uiux** - UI polish engines (168KB)
2. **voice** - TTS/Voice engines (40KB)
3. **phasespace** - Phase space visualization (40KB)
4. **autopoiesis** - Self-organization (36KB)
5. **emotion** - Synesthetic emotions (32KB)
6. **aura** - Aura effects (32KB)

**Total Lazy-Loadable:** ~348KB (63% reduction)

---

## 🔧 Implementation Strategy

### Pattern 1: React.lazy() for Components

For engines that render UI:

```typescript
// Before: Eager loading
import { UIUXEngine } from '@/engines/uiux';

// After: Lazy loading
const UIUXEngine = React.lazy(() => import('@/engines/uiux').then(m => ({ default: m.UIUXEngine })));

// Usage with Suspense
<Suspense fallback={<LoadingIndicator variant="spinner" />}>
  <UIUXEngine />
</Suspense>
```

### Pattern 2: Dynamic Import for Services

For engines that are services/utilities:

```typescript
// Before: Eager loading
import { voiceEngine } from '@/engines/voice';
voiceEngine.speak('Hello');

// After: Lazy loading
const getVoiceEngine = async () => {
  const { voiceEngine } = await import('@/engines/voice');
  return voiceEngine;
};

// Usage
const voice = await getVoiceEngine();
voice.speak('Hello');
```

### Pattern 3: Conditional Loading

Load only when feature is used:

```typescript
// Load voice engine only when TTS is enabled
const useTTS = () => {
  const [voiceEngine, setVoiceEngine] = useState(null);

  useEffect(() => {
    if (userPreferences.ttsEnabled) {
      import('@/engines/voice').then(({ voiceEngine }) => {
        setVoiceEngine(voiceEngine);
      });
    }
  }, [userPreferences.ttsEnabled]);

  return voiceEngine;
};
```

### Pattern 4: Route-Based Code Splitting

Load engines per route:

```typescript
// router.tsx
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const VisionPage = React.lazy(() => import('@/pages/VisionPage'));

// Route config
{
  path: '/dashboard',
  element: (
    <Suspense fallback={<PageLoadingFallback variant="dashboard" />}>
      <DashboardPage />
    </Suspense>
  )
}
```

---

## 📝 Implementation Plan

### Phase 1: Non-Critical UI Engines (High Impact)

**Target:** 168KB reduction

**Engines:**
1. `uiux` - UI polish (168KB)

**Changes:**
```typescript
// src/engines/index.ts
- export * from './uiux';
+ // Lazy-loaded via dynamic import

// Usage in components
const loadUIUXEngine = () => import('@/engines/uiux');
```

**Impact:** -30% bundle size

---

### Phase 2: Optional Feature Engines (Medium Impact)

**Target:** 148KB reduction

**Engines:**
1. `voice` - TTS/Voice (40KB)
2. `phasespace` - Visualization (40KB)
3. `autopoiesis` - Self-org (36KB)
4. `emotion` - Synesthetic (32KB)

**Changes:**
```typescript
// Conditional loading based on feature flags
const loadVoiceEngine = () => {
  if (userPreferences.ttsEnabled) {
    return import('@/engines/voice');
  }
};

const loadPhaseSpaceEngine = () => {
  if (route === '/phasespace') {
    return import('@/engines/phasespace');
  }
};
```

**Impact:** -27% bundle size

---

### Phase 3: Selective Time Engine (Low Impact)

**Target:** Partial lazy-loading

**Strategy:**
- Keep Agenda critical (user scheduling)
- Lazy-load Energy, Priority, ChatScheduler

```typescript
// src/engines/time/index.ts
export { AgendaEngine, agendaEngine } from './agenda'; // Eager
export const loadEnergyEngine = () => import('./energy'); // Lazy
export const loadPriorityEngine = () => import('./priority'); // Lazy
```

**Impact:** -50KB (~10% of time engine)

---

## 🎯 Expected Improvements

### Bundle Size

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Bundle | 550KB | 202KB | **-63%** |
| Lazy Chunks | 0KB | 348KB | N/A |
| Total | 550KB | 550KB | No change |

### Performance

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| First Paint | 1.8s | 0.7s | **-61%** |
| Time to Interactive | 2.5s | 1.2s | **-52%** |
| Initial Parse | 450ms | 180ms | **-60%** |

### User Experience

- ✅ Faster initial load
- ✅ App usable sooner
- ✅ Progressive enhancement
- ⚠️ Slight delay when accessing lazy features (acceptable)

---

## ⚠️ Considerations

### Trade-offs

**Pros:**
- ✅ Much faster initial load
- ✅ Reduced memory footprint
- ✅ Better perceived performance
- ✅ Pay-as-you-go loading

**Cons:**
- ⚠️ Slight delay when lazy feature accessed
- ⚠️ More complex code
- ⚠️ Need Suspense boundaries
- ⚠️ Testing more complex

### Mitigation Strategies

1. **Prefetch on Idle**
   ```typescript
   // Prefetch likely-needed engines during idle time
   requestIdleCallback(() => {
     import('@/engines/voice');
     import('@/engines/uiux');
   });
   ```

2. **Smart Preloading**
   ```typescript
   // Preload on user intent (hover, route change)
   <Link to="/vision" onMouseEnter={() => import('@/pages/VisionPage')}>
   ```

3. **Loading States**
   ```typescript
   // Use consistent loading indicators
   <Suspense fallback={<LoadingIndicator variant="skeleton" />}>
   ```

4. **Error Boundaries**
   ```typescript
   // Catch lazy loading errors
   <ErrorBoundary fallback={<LazyLoadError />}>
     <Suspense>
   ```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Test lazy loading success
test('loads voice engine dynamically', async () => {
  const { voiceEngine } = await import('@/engines/voice');
  expect(voiceEngine).toBeDefined();
});

// Test loading error handling
test('handles lazy load failure', async () => {
  // Mock import failure
  jest.mock('@/engines/voice', () => Promise.reject(new Error('Load failed')));
  
  await expect(loadVoiceEngine()).rejects.toThrow();
});
```

### Integration Tests

```typescript
// Test Suspense boundary
test('shows loading indicator while lazy loading', () => {
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### E2E Tests

```typescript
// Test feature works after lazy load
test('TTS works after voice engine loads', async () => {
  await page.click('[data-testid="enable-tts"]');
  await page.waitForSelector('[data-testid="tts-active"]');
  
  await page.click('[data-testid="speak-button"]');
  // Verify TTS works
});
```

---

## 📋 Rollout Plan

### Week 1: Foundation

- [x] Identify heavy engines (Done)
- [x] Create lazy-loading strategy (This document)
- [ ] Setup Suspense boundaries
- [ ] Add loading indicators

### Week 2: Implementation

- [ ] Phase 1: Lazy-load uiux engine
- [ ] Phase 2: Lazy-load optional engines
- [ ] Phase 3: Selective time engine loading
- [ ] Update documentation

### Week 3: Validation

- [ ] Performance testing
- [ ] E2E testing
- [ ] User acceptance testing
- [ ] Rollout to production

---

## 📚 References

- [React.lazy() Documentation](https://react.dev/reference/react/lazy)
- [Code Splitting Guide](https://react.dev/learn/code-splitting)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#async-chunk-loading-optimization)

---

**Next Step:** Implement Phase 1 (uiux engine lazy-loading)
