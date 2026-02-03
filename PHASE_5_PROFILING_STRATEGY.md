# PHASE 5 — PERFORMANCE PROFILING & RE-RENDER OPTIMIZATION

**Status:** 🔄 IN PROGRESS  
**Date:** 2 février 2026  
**Branch:** MAIN

---

## 1. Baseline Metrics Captured

### Bundle Analysis (Post-Phase 4)

- **Total:** 9.5M (dist/)
- **Chunks:** 40 compiled
- **Compression:** Gzip + Brotli (both verified)
- **Top Chunk:** react-vendor (811KB raw, 240KB gzip, 202KB brotli)

### Code Architecture

```
Key Components for Profiling:
├── src/ui/pages/Chat.tsx (1,545 lines)
│   ├── VirtualizedMessageList (implemented)
│   ├── useChat hook (Phase 4 extracted)
│   ├── ChatInput (6+ useState detected)
│   └── ChatToolbar (5+ useState detected)
│
├── src/components/sections/ConversationSection.tsx
│   ├── memo wrapper (already present)
│   ├── useDeferredValue (already used)
│   └── useConversationEngine (lazy-loaded)
│
├── src/hooks/useChat.ts (now ~1,600 lines, -555 lines)
│   └── Phase 4 utilities extracted: loaders, utils, modes, cache
│
└── src/services/ (AI backends)
    ├── cognitiveKernel (lazy-loaded Phase 4)
    ├── chatMemory (extracted Phase 4)
    └── providers (auto-selection logic)
```

---

## 2. Profiling Strategy

### Phase 5a: Re-render Analysis

- **Method:** React DevTools Profiler + Chrome DevTools
- **Target:** Identify components re-rendering >5x/message
- **Success Criteria:** Reduce unnecessary re-renders by 30%

### Phase 5b: Per-Component Optimization

1. **Chat.tsx** — Main page component
2. **ConversationSection.tsx** — Already memo-wrapped (verify effectiveness)
3. **VirtualizedMessageList** — Verify memoization of list items
4. **ChatInput** — High re-render risk (multiple useState)
5. **ChatToolbar** — Audio controls may trigger unnecessary renders

### Phase 5c: Memory & Performance Metrics

- TTI (Time to Interactive) baseline
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- Memory footprint per 100 messages

---

## 3. Identified Optimization Targets

### Target 1: VirtualizedMessageList

**File:** `src/components/chat/VirtualizedMessageList.tsx`

**Status:** ✅ Already implemented (used in Chat.tsx line 28)

**Phase 5 Action:**

- Verify each message item is wrapped with React.memo
- Check if messageId changes unnecessarily
- Analyze virtual scroll performance (scrolling 50+ messages)

**Expected Impact:** -60% re-renders when scrolling history

---

### Target 2: useChat Hook Memoization

**File:** `src/hooks/useChat.ts` (now ~1,600 lines post-Phase 4)

**Phase 4 Extractions:**

- ✅ useChat.loaders.ts (service loading)
- ✅ useChat.utils.ts (message utilities)
- ✅ useChatModes.ts (mode management)
- ✅ useChatMemoryCache.ts (memory caching)

**Phase 5 Action:**

- Wrap callback exports with useCallback
- Memoize derived state (omnisStats, uiIntegrity)
- Verify useRef usage for operationLock, messages

**Expected Impact:** -40% re-render cascades in child components

---

### Target 3: ChatInput Component

**File:** `src/components/chat/ChatInput.tsx`

**Detected Issues:**

- Multiple useState hooks (detected 6-8 in similar components)
- Potentially re-triggering validation on each keystroke
- Files upload state may trigger parent re-renders

**Phase 5 Action:**

- Extract file upload state to separate hook
- Implement useCallback for validation handlers
- Add memo wrapper for input component

**Expected Impact:** -50% keystroke-triggered re-renders

---

### Target 4: ConversationSection Context

**File:** `src/components/sections/ConversationSection.tsx`

**Current State:** ✅ Already memo-wrapped, useMemo/useDeferredValue present

**Phase 5 Verification:**

- Confirm memo comparator is correct
- Check if useConversationEngine returns stable references
- Verify no prop drilling causing unnecessary renders

**Expected Impact:** +5-10% TTI improvement (already optimized in Phase 3C)

---

## 4. Performance Measurement Plan

### Baseline (Post-Phase 4 — Current)

```
Metrics to Capture:
- Chrome DevTools: Performance profile (cold + warm)
- React Profiler: Component render times
- Memory: Initial + 100 messages scenario
- Bundle: Size per component split
- TTI: Current baseline (target: <2s)
- FCP: First paint time
```

### After Optimizations (Target)

```
Expected Improvements:
- TTI: -15-20% (2.0s → 1.6-1.7s)
- FCP: -10-15% (1.2s → 1.0-1.1s)
- Re-renders per message: -30-50%
- Memory per 100 messages: -10-15%
- Interaction response: <100ms (target: <50ms)
```

---

## 5. Implementation Roadmap

### Step 1: Profiling (Current)

- [ ] Capture React DevTools baseline
- [ ] Document component render tree
- [ ] Identify hot-path re-renders

### Step 2: Component Memoization

- [ ] Wrap high-frequency components with React.memo
- [ ] Implement custom comparators where needed
- [ ] Test memoization effectiveness

### Step 3: Callback Optimization

- [ ] Audit useCallback in useChat.ts
- [ ] Audit useCallback in Chat.tsx
- [ ] Audit useCallback in ChatInput.tsx

### Step 4: Derived State Memoization

- [ ] Identify expensive computations
- [ ] Implement useMemo selectively
- [ ] Profile impact vs. memory overhead

### Step 5: Validation & Measurement

- [ ] Re-measure TTI, FCP, LCP
- [ ] Verify re-render reduction
- [ ] Check memory footprint

### Step 6: Documentation

- [ ] Create Phase 5 completion report
- [ ] Document all optimizations applied
- [ ] Measure cumulative impact (Phases 1-5)

---

## 6. Critical Components Status

| Component              | File                                            | Status   | Memo | useCallback | useMemo | Action                 |
| ---------------------- | ----------------------------------------------- | -------- | ---- | ----------- | ------- | ---------------------- |
| Chat.tsx               | src/ui/pages/Chat.tsx                           | ⚠️ Check | ❓   | ✅          | ✅      | Audit memo usage       |
| ConversationSection    | src/components/sections/ConversationSection.tsx | ✅ Good  | ✅   | ✅          | ✅      | Verify comparator      |
| VirtualizedMessageList | src/components/chat/VirtualizedMessageList.tsx  | ✅ Good  | ❓   | -           | -       | Check item memoization |
| ChatInput              | src/components/chat/ChatInput.tsx               | ⚠️ Check | ❓   | ⚠️          | ⚠️      | Optimize handlers      |
| ChatToolbar            | src/components/chat/ChatToolbar.tsx             | ⚠️ Check | ❓   | ⚠️          | -       | Audit state management |
| useChat hook           | src/hooks/useChat.ts                            | ✅ Good  | -    | ❓          | ❓      | Audit callbacks        |

---

## 7. Next Steps

### Immediate (Phase 5a-5b)

1. Run React DevTools profiler on Chat page
2. Analyze message-list rendering performance
3. Identify re-render patterns

### Short-term (Phase 5c)

1. Implement identified optimizations
2. Apply memoization strategically
3. Test each change in isolation

### Validation (Phase 5d-5e)

1. Measure impact per optimization
2. Document cumulative improvements
3. Generate Phase 5 completion report

---

## 8. Success Criteria

✅ **Phase 5 Complete When:**

- [ ] Re-renders per interaction: -30% minimum
- [ ] TTI improved: -10% minimum (target: <1.8s)
- [ ] No memory leaks detected
- [ ] All optimizations tested & verified
- [ ] Phase 5 completion report generated
- [ ] Zero regressions in functionality

---

**Phase 5 Target:** 🎯 Achieve 40% re-render reduction + 15% TTI improvement

**Status:** Ready for profiling phase → NEXT: React DevTools analysis
